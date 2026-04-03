# Zorvyn Finance Dashboard Backend

## Overview
A Node.js/Express.js backend for a Finance Dashboard system with role-based access control, data modeling, and summary-level analytics. Built with PostgreSQL and Prisma ORM.

## Tech Stack
- **Node.js & Express.js**
- **PostgreSQL** & **Prisma ORM**
- **JWT** for Authentication
- **Zod** for Input Validation

## Features
- **Authentication & Authorization**: Secure JWT-based auth with roles (`VIEWER`, `ANALYST`, `ADMIN`).
- **User Management**: Admins can manage users and access levels.
- **Financial Records**: CRUD operations for transactions with pagination and filtering.
- **Dashboard Summary**: Aggregate data API (totals, daily trends, category breakdowns).
- **Security**: Basic protections with `helmet`, input validation via Zod, and robust error handling.

## Roles
- `VIEWER`: Can only view dashboard data and aggregate information.
- `ANALYST`: Can view detailed financial records and summaries.
- `ADMIN`: Full management access (create/update records and users).

## Setup Instructions

### Pre-requisites
- Node.js (v18+ recommended)
- PostgreSQL
- Docker (optional, for easy database setup)

### Installation
1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up your `.env` file based on a `.env.example` structure:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_db?schema=public"
   JWT_SECRET="your_jwt_secret"
   JWT_EXPIRES_IN="1d"
   ```

3. Start PostgreSQL using docker (optional):
   ```sh
   docker-compose up -d
   ```

4. Run Prisma database migrations:
   ```sh
   npm run db:migrate
   ```

5. Seed the database with initial users and data (optional):
   ```sh
   npm run db:seed
   ```

### Running the Server
- Development Mode:
  ```sh
  npm run dev
  ```
- Production Mode:
  ```sh
  npm start
  ```

## API Documentation Concepts
- **`POST /api/auth/register`**: Register a new user.
- **`POST /api/auth/login`**: Login and receive JWT.
- **`GET /api/records`**: Get financial records (Analyst/Admin). Query params for pagination and filtering (`type`, `category`, `startDate`, `endDate`).
- **`POST /api/records`**: Create a record (Admin only).
- **`PUT /api/records/:id`**: Update a record (Admin only).
- **`DELETE /api/records/:id`**: Soft-delete a record (Admin only).
- **`GET /api/summary`**: Get dashboard summary (Analyst/Viewer/Admin).
- **`GET /api/users`**: List users (Admin only).

## Assumptions and Trade-offs
- **Soft Delete**: Records are soft-deleted to keep historical analytics intact. 
- **Roles Strategy**: Defined as enum for simplicity and strong scaling mapping. A mature system might use a separate `roles` and `permissions` normalized system.
- **Validation**: Strict schema validation using `Zod` blocks bad data payloads cleanly before reaching the service layer.
Backend-Assignment-Submission
