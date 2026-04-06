# 💰 Finance Backend — Data Processing & Access Control API

A production-quality **Finance Data Processing and Access Control Backend** built with Node.js, TypeScript, Express.js, and Prisma ORM. Features JWT authentication, role-based access control (RBAC), full CRUD for financial transactions, and rich dashboard analytics.

This project demonstrates **real-world backend engineering skills**, including:

* 🔐 JWT Authentication
* 🧑‍💼 Role-Based Access Control (RBAC)
* 💳 Transaction Management (CRUD + Filters)
* 📊 Dashboard Analytics
* 🛢️ PostgreSQL Cloud Deployment (Railway)
* 📄 Swagger API Documentation
* ⚙️ Production-ready Architecture

---

# 🌐 Live Deployment

* 🚀 **Backend URL:**
  https://zorvyn-finance-production-5584.up.railway.app

* 📚 **Swagger Docs:**
  https://zorvyn-finance-production-5584.up.railway.app/api-docs

---

# 📋 Table of Contents

* Project Overview
* Features
* Tech Stack
* Architecture
* Getting Started
* Environment Setup
* Database Migration (SQLite → PostgreSQL)
* API Documentation
* Role & Permission Matrix
* Folder Structure
* Assumptions Made
* Tradeoffs & Design Decisions
* Testing
* Deployment
* Challenges Faced & Solutions
* Future Improvements
* Conclusion

---

# 🏗 Project Overview

This system provides a complete backend for managing financial data with three core capabilities:

### 1. Authentication & Authorization

* JWT-based authentication
* Secure password hashing
* Role-based access (VIEWER, ANALYST, ADMIN)

### 2. Transaction Management

* Full CRUD operations
* Filtering, sorting, pagination
* Search functionality
* Soft delete system

### 3. Dashboard Analytics

* Total income & expenses
* Monthly financial trends
* Category breakdowns
* Weekly summaries
* Recent activity tracking

All APIs return **standardized JSON responses** with:

* Consistent structure
* Centralized error handling
* Validation using Zod

---

# ✨ Features

## 🔐 Authentication

* Register & Login APIs
* JWT-based session management
* Secure password storage (bcrypt)

## 👥 Role-Based Access Control

* VIEWER → Read-only access
* ANALYST → Analytics access
* ADMIN → Full system control

## 💳 Transactions

* Create / Read / Update / Delete
* Soft deletion (no permanent loss)
* Advanced filtering & search
* Pagination & sorting

## 📊 Dashboard

* Financial summaries
* Category-wise breakdown
* Monthly trends
* Weekly reports

## 🛡️ Security

* Helmet for HTTP security headers
* Rate limiting (auth routes)
* CORS protection
* Input validation using Zod

---

# ⚙️ Tech Stack

| Technology       | Purpose             |
| ---------------- | ------------------- |
| Node.js          | Runtime             |
| TypeScript       | Type safety         |
| Express.js       | Backend framework   |
| Prisma ORM       | Database ORM        |
| PostgreSQL       | Production database |
| JWT              | Authentication      |
| bcryptjs         | Password hashing    |
| Zod              | Validation          |
| Swagger          | API documentation   |
| Jest + Supertest | Testing             |
| Helmet| Security headers |
| express-rate-limit| Rate limiting on auth routes |
| CORS   | Cross-origin request handling |


---

# 🧠 Architecture

Follows **Controller → Service → Database pattern**

```
Controller → Service → Prisma ORM → PostgreSQL
```

### Benefits:

* Clean code separation
* Scalable structure
* Easy debugging & testing

---

# 🚀 Getting Started

## Prerequisites

* Node.js >= 18
* npm >= 9

---

## Installation

```bash
git clone <repository-url>
cd finance-backend
npm install
```

# Generate Prisma client
```bash
npx prisma generate
```

# Run database migrations
```bash
npx prisma migrate dev --name init
```

# Seed the database with sample data
``` bash
npm run seed
```

## Run Locally

```bash
npm run dev
```

---

## Build & Start

```bash
npm run build
npm start
```

---

# 🔑 Environment Setup

Copy `.env.example` to `.env` and update values as needed:

```bash
cp .env.example .env
```


```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

---

# 🛢️ Database Migration (SQLite → PostgreSQL)

Originally built using SQLite, later migrated to PostgreSQL for production.

## Changes Made:

### 1. Prisma Schema Update

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Railway Integration

* Connected PostgreSQL service
* Added DATABASE_URL in environment variables

### 3. Deployment Fixes

* Removed prisma.config.ts (env issue)
* Fixed CORS for production
* Fixed Swagger base URL

---

# 📡 API Documentation

Available at:

```
/api-docs
```

---

## 🔐 Authentication

### POST /api/auth/register

Register a new user

### POST /api/auth/login

Login user and get JWT token

---

## 👥 User Management (ADMIN)

* GET /api/users
* GET /api/users/:id
* PATCH /api/users/:id/role
* PATCH /api/users/:id/status
* DELETE /api/users/:id

---

## 💳 Transactions

* POST /api/transactions (ADMIN)
* GET /api/transactions (ALL)
* GET /api/transactions/:id
* PATCH /api/transactions/:id (ADMIN)
* DELETE /api/transactions/:id (ADMIN)

---

## 📊 Dashboard

* GET /api/dashboard/summary
* GET /api/dashboard/category-breakdown
* GET /api/dashboard/monthly-trends
* GET /api/dashboard/recent-activity
* GET /api/dashboard/weekly-summary

---
#### `POST /api/auth/register`
Register a new user.

**Auth Required:** No

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "VIEWER"  // optional, defaults to VIEWER
}
```

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "VIEWER",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

#### `POST /api/auth/login`
Login with email and password.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "admin@finance.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

---

### 👥 User Management (Admin Only)

All endpoints require `Authorization: Bearer <token>` with ADMIN role.

#### `GET /api/users?page=1&limit=10`
List all users (paginated).

#### `GET /api/users/:id`
Get single user by ID.

#### `PATCH /api/users/:id/role`
Change user role.
```json
{ "role": "ANALYST" }
```

#### `PATCH /api/users/:id/status`
Activate/deactivate a user.
```json
{ "status": "INACTIVE" }
```

#### `DELETE /api/users/:id`
Delete a user (soft-deletes their transactions first).

---

### 💳 Transactions

#### `POST /api/transactions` (ADMIN only)
Create a new transaction.

**Request Body:**
```json
{
  "amount": 50000,
  "type": "INCOME",
  "category": "Salary",
  "date": "2024-06-15T00:00:00.000Z",
  "description": "Monthly salary"  // optional
}
```

#### `GET /api/transactions` (ALL roles)
Fetch all transactions with filters and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `type` | string | Filter by INCOME or EXPENSE |
| `category` | string | Filter by category name |
| `startDate` | string | Filter from date (ISO) |
| `endDate` | string | Filter to date (ISO) |
| `search` | string | Search by description or category |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |
| `sortBy` | string | Sort field: date, amount, category, type, createdAt |
| `order` | string | Sort order: asc or desc (default: desc) |

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Transactions fetched successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  }
}
```

#### `GET /api/transactions/:id` (ALL roles)
Get single transaction by ID.

#### `PATCH /api/transactions/:id` (ADMIN only)
Update a transaction (partial update supported).

#### `DELETE /api/transactions/:id` (ADMIN only)
Soft delete a transaction (sets `isDeleted = true`).

---
### 📊 Dashboard

#### `GET /api/dashboard/summary` (ALL roles)
```json
{
  "data": {
    "totalIncome": 270000,
    "totalExpenses": 122900,
    "netBalance": 147100,
    "totalTransactions": 20
  }
}
```

#### `GET /api/dashboard/category-breakdown` (ADMIN, ANALYST)
```json
{
  "data": {
    "categories": [
      { "category": "Salary", "total": 225000, "type": "INCOME" },
      { "category": "Rent", "total": 60000, "type": "EXPENSE" }
    ]
  }
}
```

#### `GET /api/dashboard/monthly-trends` (ADMIN, ANALYST)
```json
{
  "data": {
    "trends": [
      { "month": "January 2024", "income": 90000, "expense": 34000, "net": 56000 }
    ]
  }
}
```

#### `GET /api/dashboard/recent-activity` (ALL roles)
Returns last 10 transactions sorted by date descending.

#### `GET /api/dashboard/weekly-summary` (ADMIN, ANALYST)
Returns income and expense for the last 7 days.

---

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be a positive number" }
  ]
}
```

| Status Code | Meaning |
|---|---|
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---


# 🔒 Role & Permission Matrix

| Action             | VIEWER | ANALYST | ADMIN |
| ------------------ | :----: | :-----: | :---: |
| View transactions  |    ✅   |    ✅    |   ✅   |
| Create transaction |    ❌   |    ❌    |   ✅   |
| Update transaction |    ❌   |    ❌    |   ✅   |
| Delete transaction |    ❌   |    ❌    |   ✅   |
| Dashboard summary  |    ✅   |    ✅    |   ✅   |
| Analytics          |    ❌   |    ✅    |   ✅   |
| Manage users       |    ❌   |    ❌    |   ✅   |

---

# 📁 Folder Structure

## 📁 Folder Structure

```
finance-backend/
├── src/
│   ├── config/
│   │   └── db.ts                  # Singleton Prisma client instance
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # JWT verification & token decoding
│   │   └── role.middleware.ts     # Role-based access control factory
│   ├── modules/
│   │   ├── auth/                  # Authentication (register, login)
│   │   ├── users/                 # User management (ADMIN CRUD)
│   │   ├── transactions/          # Financial records (CRUD + filters)
│   │   └── dashboard/             # Analytics & summaries
│   ├── utils/
│   │   ├── response.util.ts       # Standardized API response wrapper
│   │   ├── errors.util.ts         # Custom error classes (400-500)
│   │   └── pagination.util.ts     # Pagination helper
│   ├── validators/
│   │   ├── user.validator.ts      # Zod schemas for user operations
│   │   └── transaction.validator.ts # Zod schemas for transactions
│   ├── types/
│   │   └── index.ts               # Shared TypeScript types & enums
│   └── app.ts                     # Express app + middleware + routes
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Database seeder script
├── tests/
│   ├── auth.test.ts               # Auth endpoint tests
│   ├── transactions.test.ts       # Transaction endpoint tests
│   └── dashboard.test.ts          # Dashboard endpoint tests
├── .env.example                   # Environment template
├── .gitignore
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

Each module follows the **Controller → Service → Model** pattern:
- **Controller**: Handles HTTP request/response, validation
- **Service**: Contains business logic, database queries
- **Model**: Defines select fields and data shapes

---


# 📝 Assumptions Made
1. **PosygreSQL is used** for production; the schema is fully compatible with the Prisma provider
2. **Default role is VIEWER** when registering without specifying a role
3. **All new users start as ACTIVE** by default
4. **Soft delete** is used for transactions — they are never permanently removed
5. **User deletion** soft-deletes all associated transactions before removing the user record
6. **Amount is stored as Float** (suitable for most use cases; for production financial systems, use Decimal)
7. **Rate limiting** applies only to auth routes (register + login) — 10 requests per 15 minutes per IP
8. **JWT tokens expire in 24 hours** by default (configurable via env)
9. **Monthly trends** are ordered chronologically based on transaction dates
10. **Weekly summary** covers the last 7 calendar days from now


---

# ⚖️ Tradeoffs & Design Decisions

| Decision          | Reason                    |
| ----------------- | ------------------------- |
| PostgreSQL        | Scalable production DB    |
| Prisma ORM        | Type-safe queries         |
| JWT Auth          | Stateless system          |
| Zod               | Better TypeScript support |
| Soft Delete       | Data safety               |
| No Refresh Tokens | Simplicity                |

---

# 🧪 Running Tests

```bash
# Run all tests
npm test
```
# Run tests in watch mode
```bash
npm run test:watch
```
# Run specific test file
```bash
npx jest tests/auth.test.ts --forceExit
```

Tests cover:
- ✅ User registration (success, duplicate email, validation)
- ✅ User login (success, wrong password, non-existent user)
- ✅ Transaction CRUD (create, read, update, soft delete)
- ✅ Transaction filtering (type, category, search, pagination)
- ✅ Access control (ADMIN-only operations, VIEWER restrictions)
- ✅ Dashboard endpoints (summary, categories, trends, activity)
- ✅ Role-based dashboard access (VIEWER blocked from analytics)
- ✅ Unauthenticated request handling



# 🚀 Deployment (Railway)

## Steps Followed:

1. GitHub integration
2. PostgreSQL service added
3. Environment variables configured
4. Build & deploy

---

## Issues Faced & Fixes

### ❌ CORS Error

✔ Fixed by allowing Railway domain

### ❌ Prisma DB Error

✔ Switched SQLite → PostgreSQL

### ❌ Route Not Found

✔ Added root endpoint

### ❌ Swagger Not Working

✔ Fixed BASE_URL config

---

# 🔮 Future Improvements

* Refresh tokens
* Email verification
* Audit logs
* Docker support
* CI/CD pipeline
* GraphQL API

---

# 🧠 Learnings

* Real-world backend deployment
* Debugging production issues
* Database migration
* Environment configuration

---

# 📌 Conclusion

This project showcases:

✅ Backend development skills
✅ Secure authentication system
✅ Database design & migration
✅ Production deployment
✅ Problem-solving ability

---

# 👩‍💻 Author

**Keerti**
CSE AIML — Final Year
Aspiring Software Engineer 

---

# 📄 License

ISC
