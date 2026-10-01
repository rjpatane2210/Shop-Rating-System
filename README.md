# Store Rating Web Application

A full-stack web application built with **Node.js/Express**, **MySQL**, and **React** for user ratings on registered stores.

## Features
- **Authentication**: Single login page for Admin, Store Owners, and Normal Users.
- **Roles**:
  - **System Admin**: Dashboard stats, add stores/users, view and filter user/store lists, multi-column sorting.
  - **Normal User**: Signup, login, search stores by Name and Address, submit and update 1-5 star ratings, password update.
  - **Store Owner**: View average store rating and customer feedback list, password update.
- **Validations**:
  - Name: 20-60 characters
  - Address: Max 400 characters
  - Password: 8-16 characters with at least one uppercase letter and one special character
  - Email: Standard email format validation

## Setup & Running

### 1. Backend
```bash
cd backend
npm install
```
Configure your MySQL credentials in `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_portal
JWT_SECRET=super_secret_jwt_key_roxiler_2026
```
Start the backend server (automatically initializes database tables and seeds sample data):
```bash
npm start
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Sample Seed Accounts
- **Admin**: `admin@system.com` / `Admin123!Password`
- **Store Owner**: `owner.jonathan@techmart.com` / `Owner123!Pass`
- **Normal User**: `alex.user@gmail.com` / `User123!Password`
