# 💰 Finance Backend — Data Processing & Access Control API

A production-quality **Finance Data Processing and Access Control Backend** built with Node.js, TypeScript, Express.js, and Prisma ORM. Features JWT authentication, role-based access control (RBAC), full CRUD for financial transactions, and rich dashboard analytics.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Role & Permission Matrix](#-role--permission-matrix)
- [Folder Structure](#-folder-structure)
- [Assumptions Made](#-assumptions-made)
- [Tradeoffs & Design Decisions](#-tradeoffs--design-decisions)
- [Running Tests](#-running-tests)

---

## 🏗 Project Overview

This system provides a comprehensive backend for managing financial data with three core capabilities:

1. **Authentication & Authorization** — JWT-based auth with role-based access control (VIEWER, ANALYST, ADMIN)
2. **Transaction Management** — Full CRUD for financial records (income/expense) with filtering, pagination, search, and soft delete
3. **Dashboard Analytics** — Summary statistics, category breakdowns, monthly trends, recent activity, and weekly summaries

All endpoints return standardized JSON responses with consistent error handling, validation, and pagination.

---

## ⚙️ Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **TypeScript** | Type safety and developer experience |
| **Express.js** | HTTP framework |
| **Prisma ORM** | Database access and schema management |
| **SQLite** | Lightweight database (easily swappable to PostgreSQL) |
| **JWT (jsonwebtoken)** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **Zod** | Request validation with type inference |
| **Swagger/OpenAPI** | Auto-generated API documentation |
| **Jest + Supertest** | Testing framework |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting on auth routes |
| **CORS** | Cross-origin request handling |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd finance-backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

### Environment Setup

Copy `.env.example` to `.env` and update values as needed:

```bash
cp .env.example .env
```

#### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `JWT_SECRET` | Secret key for JWT signing | (required) |
| `JWT_EXPIRES_IN` | Token expiration time | `24h` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `10` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |

### Seeded Test Credentials

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@finance.com | password123 |
| ANALYST | analyst@finance.com | password123 |
| VIEWER | viewer@finance.com | password123 |

### Available Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run seed         # Seed database with sample data
npm test             # Run tests
npx prisma studio    # Open Prisma Studio (DB GUI)
```

---

## 📡 API Documentation

Interactive Swagger documentation is available at: **`http://localhost:3000/api-docs`**

### Base URL: `http://localhost:3000`

---

### 🔐 Authentication

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

## 🔒 Role & Permission Matrix

| Action | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| View transactions | ✅ | ✅ | ✅ |
| Create transaction | ❌ | ❌ | ✅ |
| Update transaction | ❌ | ❌ | ✅ |
| Delete transaction | ❌ | ❌ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View category breakdown | ❌ | ✅ | ✅ |
| View monthly trends | ❌ | ✅ | ✅ |
| View weekly summary | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Change roles/status | ❌ | ❌ | ✅ |

---

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

## 📝 Assumptions Made

1. **SQLite is used** for simplicity; the schema is fully compatible with PostgreSQL by changing the Prisma provider
2. **Default role is VIEWER** when registering without specifying a role
3. **All new users start as ACTIVE** by default
4. **Soft delete** is used for transactions — they are never permanently removed
5. **User deletion** soft-deletes all associated transactions before removing the user record
6. **Amount is stored as Float** (suitable for most use cases; for production financial systems, use Decimal)
7. **Rate limiting** applies only to auth routes (register + login) — 10 requests per 15 minutes per IP
8. **JWT tokens expire in 24 hours** by default (configurable via env)
9. **Search** is case-sensitive in SQLite (would be case-insensitive with PostgreSQL `ilike`)
10. **Monthly trends** are ordered chronologically based on transaction dates
11. **Weekly summary** covers the last 7 calendar days from now

---

## ⚖️ Tradeoffs & Design Decisions

| Decision | Rationale |
|---|---|
| **SQLite over PostgreSQL** | Simpler setup for development/demo; easily swappable via Prisma provider |
| **Zod over Joi** | Better TypeScript inference, smaller bundle, more modern API |
| **Static class methods** | Clean service layer without instantiation; works well for stateless operations |
| **Singleton Prisma client** | Prevents connection pool exhaustion during hot-reloading |
| **Soft delete pattern** | Preserves data integrity and enables audit trails |
| **Aggregation in app layer** | SQLite lacks advanced aggregate functions; Prisma raw queries avoided for portability |
| **No refresh tokens** | Simplified auth flow for internship scope; access tokens only |
| **Global error middleware** | Centralized error handling prevents response format inconsistencies |
| **Swagger via JSDoc** | Co-located docs with routes; stays in sync with code |

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
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

---

## 📄 License

ISC
