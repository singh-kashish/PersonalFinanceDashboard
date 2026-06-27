# PersonalFinanceDashboard

## Personal Finance Tracker API - Server

Production-oriented Personal Finance Tracker built with Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT Authentication, Analytics APIs, Validation, and OpenAPI documentation.

## Features

### Authentication

- User Registration
- User Login
- JWT Access Tokens
- Refresh Token Rotation
- Protected Routes

### Transactions

- Create Transaction
- Get Transaction
- Get All Transactions
- Update Transaction
- Delete Transaction

### Filtering & Pagination

- Pagination
- Date Range Filtering
- Category Filtering
- Transaction Type Filtering
- Sorting

### Analytics

#### Summary

- Total Income
- Total Expense
- Current Balance
- Recent Transactions

#### Categories

- Category-wise Aggregation
- Transaction Counts
- Category Percentage Distribution

#### Monthly Analytics

- Monthly Income
- Monthly Expense
- Monthly Balance

#### Category Trends

- Monthly Category Spending Trends
- Historical Category Tracking
- Top Increasing Categories

### API Quality

- TypeScript
- Zod Validation
- Centralized Error Handling
- Async Error Wrapper
- Prisma ORM
- PostgreSQL
- Swagger/OpenAPI Documentation

---

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript

### Database

- PostgreSQL
- Prisma ORM
- Neon Database

### Authentication

- JWT
- Refresh Tokens

### Validation

- Zod

### Documentation

- Swagger/OpenAPI

---

## Architecture

Client
↓
Express API
↓
Controllers
↓
Services
↓
Prisma ORM
↓
PostgreSQL

Authentication Layer
↓
JWT Middleware
↓
Protected Routes

Analytics Layer
↓
Aggregations
↓
Prisma + Raw SQL
↓
Response DTOs

---

## Database Design

### User

Stores application users and authentication data.

### Transaction

Stores:

- Amount
- Type (Income / Expense)
- Category
- Description
- Date

Optimized using multiple indexes:

- userId
- userId + date
- userId + type
- category
- userId + category

### RefreshToken

Stores refresh tokens for session management.

---

## Analytics Endpoints

GET /analytics/summary

Returns:

- Total Income
- Total Expense
- Balance
- Recent Transactions

GET /analytics/categories

Returns:

- Category Totals
- Category Percentages
- Transaction Counts

GET /analytics/monthly

Returns:

- Monthly Income
- Monthly Expense
- Monthly Balance

GET /analytics/category-trends

Returns:

- Monthly Category Trends
- Top Increasing Categories

---

## Future Improvements

- Redis Caching
- Docker Compose
- GitHub Actions CI/CD
- Structured Logging (Pino)
- OpenTelemetry Tracing
- Grafana Dashboards
- Frontend Dashboard
- AI Spending Insights

---

## Running Locally

Install dependencies

npm install

Configure environment

cp .env.example .env

Run Prisma migrations

npx prisma migrate dev

Start development server

npm run dev

Open Swagger

http://localhost:3000/api-docs
