# Store Rating Web Application

A full-stack web application built with **Node.js / Express.js**, **MySQL** and **React.js (Vite)** that allows users to submit ratings (1 to 5 stars) for registered stores, with role-based access control for System Administrators, Store Owners and Normal Users.

## Features
- **Single Authentication System**: One login system for Admin, Store Owners and Normal Users.
- **Role-Based Access Control**:
  - **System Admin**: Dashboard stats (Total Users, Stores, Ratings), add users/stores, filter and view user & store directories, multi-column sorting.
  - **Normal User**: Signup page, login, search stores by Name and Address, submit and modify 1–5 star ratings (including half-star display), password update.
  - **Store Owner**: Store dashboard displaying average store rating, total review count and customer feedback list.
- **Form Validations**:
  - Name: 20–60 characters
  - Address: Max 400 characters
  - Password: 8–16 characters with at least 1 uppercase letter and 1 special character
  - Email: Standard email format validation

---

## Setup & Running Instructions

### 1. Backend Setup
```bash
cd backend
npm install
```

Configure your MySQL connection details in `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_portal
JWT_SECRET=super_secret_jwt_key_roxiler_2026
```

Start the backend server (automatically initializes database schema and seeds initial data):
```bash
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Default Seed Account Credentials

Upon first launch, the database automatically seeds default test accounts:

| Role | Name | Email | Password |
|---|---|---|---|
| **System Admin** | `Admin User` | `admin@system.com` | `Admin@123` |
| **Store Owner 1** | `Shree Balaji Market` | `balaji.shree@techmart.com` | `Owner@123` |
| **Store Owner 2** | `New Balaji Market` | `newbalaji@techmart.com` | `Owner@123` |
| **Normal User 1** | `Rushikesh Patane` | `rushikesh.patane@gmail.com` | `User@123` |
| **Normal User 2** | `Jhon Doe` | `jhon.doe@gmail.com` | `User@123` |
