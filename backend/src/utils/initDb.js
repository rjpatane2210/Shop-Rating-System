const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function initDb() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'store_rating_portal';

  try {
    const rootConnection = await mysql.createConnection({ host, port, user, password });
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await rootConnection.end();

    const db = await mysql.createConnection({ host, port, user, password, database: dbName });

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        role ENUM('ADMIN', 'NORMAL_USER', 'STORE_OWNER') NOT NULL DEFAULT 'NORMAL_USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        address VARCHAR(400) NOT NULL,
        owner_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_store_rating (user_id, store_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [adminRows] = await db.query(`SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`);
    if (adminRows.length === 0) {
      const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
      await db.query(
        `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
        [
          'Admin User',
          'admin@system.com',
          hashedAdminPassword,
          'The Elegance park, Pune',
          'ADMIN'
        ]
      );

      const hashedOwnerPassword = await bcrypt.hash('Owner@123', 10);
      const [ownerResult] = await db.query(
        `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
        [
          'Shree Balaji Market',
          'balaji.shree@techmart.com',
          hashedOwnerPassword,
          'K-Shree, Pune',
          'STORE_OWNER'
        ]
      );

      const [ownerResult2] = await db.query(
        `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
        [
          'New Balaji Market',
          'newbalaji@techmart.com',
          hashedOwnerPassword,
          'K-Shree, Pune',
          'STORE_OWNER'
        ]
      );

      const hashedUserPassword = await bcrypt.hash('User@123', 10);
      const [user1Result] = await db.query(
        `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
        [
          'Rushikesh Patane',
          'rushikesh.patane@gmail.com',
          hashedUserPassword,
          'K-Ville, Pune',
          'NORMAL_USER'
        ]
      );

      const [user2Result] = await db.query(
        `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
        [
          'Jhon Doe',
          'jhon.doe@gmail.com',
          hashedUserPassword,
          'K-Town, Pune',
          'NORMAL_USER'
        ]
      );

      const [store1Result] = await db.query(
        `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
        [
          'Shree Balaji Market',
          'contact@techmart.com',
          'Chinchwad, Pune',
          ownerResult.insertId
        ]
      );

      const [store2Result] = await db.query(
        `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
        [
          'New Balaji Market',
          'support@urbanfresh.com',
          'A-Ward, Nashik',
          ownerResult2.insertId
        ]
      );

      await db.query(
        `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
        [user1Result.insertId, store1Result.insertId, 5]
      );

      await db.query(
        `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
        [user2Result.insertId, store1Result.insertId, 4]
      );

      await db.query(
        `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
        [user1Result.insertId, store2Result.insertId, 3]
      );

      console.log('Database initialized successfully.');
    }

    await db.end();
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  }
}

module.exports = { initDb };
