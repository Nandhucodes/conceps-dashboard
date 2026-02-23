# Conceps Dashboard — Backend

REST API built with **Node.js + Express** and **MySQL**. Handles authentication, user management, products, registrations, and dashboard metrics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 4 |
| Database | MySQL 8 (via `mysql2`) |
| Auth | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`) |
| Validation | `express-validator` |
| OTP / SMS | Fast2SMS (`axios`) |
| File Upload | `multer` |
| Dev server | `nodemon` |

---

## Project Structure

```
backend/
├── server.js                    # Entry point — starts Express server
├── .env                         # Environment variables (not committed)
├── .env.example                 # Template for .env
└── src/
    ├── config/
    │   ├── db.js                # MySQL connection pool
    │   ├── schema.sql           # Full DB schema (CREATE TABLE statements)
    │   └── migrate_soft_delete.sql  # Migration: adds deleted_at columns
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── user.controller.js
    │   ├── product.controller.js
    │   ├── registration.controller.js
    │   └── dashboard.controller.js
    ├── models/
    │   ├── User.js
    │   ├── Product.js
    │   ├── Registration.js
    │   └── OTP.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   ├── product.routes.js
    │   ├── registration.routes.js
    │   ├── dashboard.routes.js
    │   ├── admin.routes.js
    │   └── upload.routes.js
    ├── middlewares/
    │   ├── auth.middleware.js   # protect + authorize
    │   └── validate.middleware.js
    ├── validators/
    │   ├── auth.validator.js
    │   ├── user.validator.js
    │   ├── product.validator.js
    │   ├── registration.validator.js
    │   └── admin.validator.js
    ├── utils/
    │   ├── jwt.utils.js
    │   ├── otp.utils.js
    │   ├── sms.utils.js
    │   └── response.utils.js
    ├── services/
    │   └── email.service.js
    └── seeders/
        └── adminSeeder.js       # Creates the first admin account
```

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- MySQL 8 running and accessible

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=test_local

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

OTP_EXPIRES_MINUTES=10

SMS_API_KEY=your_fast2sms_api_key
SMS_SENDER_ID=FSTSMS

FRONTEND_ORIGIN=http://localhost:5173
```

### 4. Set up the database

Create the tables from the schema file:

```bash
mysql -u root -p < src/config/schema.sql
```

If you have an **existing database** and only need to add soft-delete columns:

```bash
mysql -u root -p test_local < src/config/migrate_soft_delete.sql
```

### 5. Seed the admin account

```bash
npm run seed:admin
```

Default credentials (edit `src/seeders/adminSeeder.js` before running to change them):

| Field | Value |
|---|---|
| Email | `admin@conceps.com` |
| Password | `Admin@1234` |
| Role | `admin` |

### 6. Start the dev server

```bash
npm run dev
```

Server starts on `http://localhost:5000`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart on file change) |
| `npm start` | Start without nodemon (production) |
| `npm run seed:admin` | Create the first admin account |

---

## API Reference

All routes are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/signup` | Public | Register a new user (sends OTP via SMS) |
| POST | `/login` | Public | Login with email + password, returns JWT |
| POST | `/verify-otp` | Public | Verify the 6-digit SMS OTP |
| POST | `/resend-otp` | Public | Resend OTP to registered phone |
| POST | `/reset-password` | Public | Reset password using email + new password |
| POST | `/change-password` | JWT | Change own password (required on first login) |
| POST | `/create-admin` | JWT + Admin | Create another admin account |

### Users — `/api/users`

All routes require **JWT + admin role**.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Paginated list (`?page&limit&search&role&status`) |
| GET | `/:id` | Single user |
| POST | `/` | Create user |
| PUT | `/:id` | Update user |
| DELETE | `/:id` | Soft-delete user |
| DELETE | `/bulk` | Bulk soft-delete (`body: { ids: [1,2,3] }`) |

### Products — `/api/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Paginated list (`?page&limit`) |
| GET | `/:id` | Public | Single product |
| POST | `/` | JWT | Create product |
| DELETE | `/:id` | JWT | Soft-delete product |

### Registrations — `/api/registrations`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | JWT | Submit a new registration |
| GET | `/` | JWT + Admin | Paginated list (`?page&limit&search&status`) |
| GET | `/:id` | JWT + Admin | Single registration |
| PATCH | `/:id/status` | JWT + Admin | Update status (`pending/approved/rejected`) |
| DELETE | `/:id` | JWT + Admin | Soft-delete registration |

### Dashboard — `/api/dashboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/metrics` | JWT | Aggregate stats: users, products, revenue, registrations |

---

## Authentication Flow

1. User signs up → OTP sent via Fast2SMS
2. User verifies OTP → account activated, JWT returned
3. JWT must be sent in every protected request:
   ```
   Authorization: Bearer <token>
   ```
4. Admin-only routes additionally check `role = 'admin'`

---

## Soft Delete

All three main tables (`users`, `products`, `registrations`) use **soft delete**:

- A `deleted_at DATETIME DEFAULT NULL` column is set to `NOW()` on deletion.
- No rows are ever physically removed.
- All queries automatically filter out `WHERE deleted_at IS NULL`.

---

## Response Envelope

Every response uses a consistent JSON shape:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "What went wrong",
  "errors": [ ... ]
}
```
