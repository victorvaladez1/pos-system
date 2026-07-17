# POS System Backend

A RESTful backend API for a restaurant point-of-sale system built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL**.

This backend supports core POS workflows including menu management, tables, orders, order items, modifiers, payments, kitchen order queues, sales reports, role-based access control, JWT authentication, and bcrypt-hashed passcodes.

## Features

* TypeScript + Express REST API
* PostgreSQL database
* Restaurant menu management

  * Categories
  * Items
  * Modifiers
* Table management

  * Table status tracking
  * Open order lookup by table
  * Table occupancy updates
  * Dirty table workflow after closing or cancelling dine-in orders
* Order management

  * Create, update, cancel, close, and delete orders
  * Open order listing
  * Full order summaries with items, modifiers, payments, and totals
* Order item management

  * Add/update/delete order items
  * Update kitchen status: pending, submitted, ready, served, voided
* Order item modifiers
* Payment management
* Kitchen order queue
* Reports

  * Daily sales
  * Payment methods
  * Top-selling items
  * Open balances
* User management

  * Create users
  * Update users
  * Deactivate users
* Authentication

  * Passcode login
  * bcrypt-hashed passcodes
  * JWT authentication
  * `GET /auth/me` current-user endpoint
* Role-based authorization

  * Admin
  * Manager
  * Cashier
  * Server
  * Kitchen
  * Host
* Demo user seed script
* Automated test suite with Vitest and Supertest

## Tech Stack

* **Node.js**
* **Express**
* **TypeScript**
* **PostgreSQL**
* **postgres.js**
* **JWT**
* **bcrypt**
* **Vitest**
* **Supertest**

## Project Structure

```txt
src/
  app.ts
  db.ts
  routes/
    auth.routes.ts
    categories.routes.ts
    health.routes.ts
    items.routes.ts
    kitchen.routes.ts
    modifiers.routes.ts
    orderItemModifiers.routes.ts
    orderItems.routes.ts
    orders.routes.ts
    payments.routes.ts
    reports.routes.ts
    tables.routes.ts
    time.routes.ts
    users.routes.ts
  controllers/
  services/
  middleware/
  types/
  utils/
  scripts/
    seedDemoUsers.ts
  tests/
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the backend root.

```env
DATABASE_URL=postgres://your_user:your_password@localhost:5432/your_database
JWT_SECRET=your-dev-secret
```

### 3. Run the development server

```bash
npm run dev
```

The API will run on your configured backend port.

## Demo Users

The project includes a demo user seed script for local development.

Run:

```bash
npm run seed:demo-users
```

Demo credentials:

| Role    | Passcode |
| ------- | -------: |
| Admin   |     1111 |
| Manager |     2222 |
| Cashier |     3333 |
| Kitchen |     4444 |
| Server  |     5555 |
| Host    |     6666 |

The seed script is safe to rerun. It removes existing demo users and recreates them with bcrypt-hashed passcodes.

## Authentication

### Login

```http
POST /auth/passcode-login
```

Request body:

```json
{
  "passcode": "1111"
}
```

Successful response:

```json
{
  "user": {
    "id": "uuid",
    "first_name": "Admin",
    "middle_name": null,
    "last_name": "User",
    "user_role": "admin",
    "is_active": true,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "token": "jwt-token"
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

Successful response:

```json
{
  "user": {
    "id": "uuid",
    "first_name": "Admin",
    "middle_name": null,
    "last_name": "User",
    "user_role": "admin",
    "is_active": true,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

## Authorization

Protected routes require a JWT in the `Authorization` header:

```http
Authorization: Bearer <token>
```

### Role Permissions

| Feature         | Allowed Roles           |
| --------------- | ----------------------- |
| User management | Manager, Admin          |
| Payments        | Cashier, Manager, Admin |
| Kitchen orders  | Kitchen, Manager, Admin |
| Reports         | Manager, Admin          |

## API Routes

### Health

| Method | Endpoint  | Description  |
| ------ | --------- | ------------ |
| GET    | `/health` | Health check |

### Time

| Method | Endpoint | Description              |
| ------ | -------- | ------------------------ |
| GET    | `/time`  | Test database time query |

### Auth

| Method | Endpoint               | Description                    |
| ------ | ---------------------- | ------------------------------ |
| POST   | `/auth/passcode-login` | Login with passcode            |
| GET    | `/auth/me`             | Get current authenticated user |

### Categories

| Method | Endpoint          | Description        |
| ------ | ----------------- | ------------------ |
| POST   | `/categories`     | Create category    |
| GET    | `/categories`     | Get all categories |
| PATCH  | `/categories/:id` | Update category    |
| DELETE | `/categories/:id` | Delete category    |

### Items

| Method | Endpoint     | Description   |
| ------ | ------------ | ------------- |
| POST   | `/items`     | Create item   |
| GET    | `/items`     | Get all items |
| PATCH  | `/items/:id` | Update item   |
| DELETE | `/items/:id` | Delete item   |

### Modifiers

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| POST   | `/modifiers`     | Create modifier   |
| GET    | `/modifiers`     | Get all modifiers |
| PATCH  | `/modifiers/:id` | Update modifier   |
| DELETE | `/modifiers/:id` | Delete modifier   |

### Tables

| Method | Endpoint                 | Description                  |
| ------ | ------------------------ | ---------------------------- |
| POST   | `/tables`                | Create table                 |
| GET    | `/tables`                | Get all tables               |
| GET    | `/tables/:id/open-order` | Get active order for a table |
| PATCH  | `/tables/:id/status`     | Update table status          |
| PATCH  | `/tables/:id`            | Update table                 |
| DELETE | `/tables/:id`            | Delete table                 |

### Orders

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| POST   | `/orders`             | Create order             |
| GET    | `/orders`             | Get all orders           |
| GET    | `/orders/open`        | Get open orders          |
| GET    | `/orders/:id/summary` | Get order summary        |
| PATCH  | `/orders/:id/close`   | Close a fully paid order |
| PATCH  | `/orders/:id/cancel`  | Cancel an open order     |
| PATCH  | `/orders/:id`         | Update order             |
| DELETE | `/orders/:id`         | Delete order             |

### Order Items

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| POST   | `/order-items`            | Create order item        |
| GET    | `/order-items`            | Get all order items      |
| PATCH  | `/order-items/:id/status` | Update order item status |
| PATCH  | `/order-items/:id`        | Update order item        |
| DELETE | `/order-items/:id`        | Delete order item        |

### Order Item Modifiers

| Method | Endpoint                    | Description                   |
| ------ | --------------------------- | ----------------------------- |
| POST   | `/order-item-modifiers`     | Attach modifier to order item |
| GET    | `/order-item-modifiers`     | Get all order item modifiers  |
| DELETE | `/order-item-modifiers/:id` | Delete order item modifier    |

### Payments

Requires one of: `cashier`, `manager`, `admin`.

| Method | Endpoint        | Description      |
| ------ | --------------- | ---------------- |
| POST   | `/payments`     | Create payment   |
| GET    | `/payments`     | Get all payments |
| PATCH  | `/payments/:id` | Update payment   |
| DELETE | `/payments/:id` | Delete payment   |

### Kitchen

Requires one of: `kitchen`, `manager`, `admin`.

| Method | Endpoint          | Description             |
| ------ | ----------------- | ----------------------- |
| GET    | `/kitchen/orders` | Get kitchen order queue |

### Reports

Requires one of: `manager`, `admin`.

| Method | Endpoint                   | Description                         |
| ------ | -------------------------- | ----------------------------------- |
| GET    | `/reports/daily-sales`     | Get daily sales totals              |
| GET    | `/reports/payment-methods` | Get sales grouped by payment method |
| GET    | `/reports/top-items`       | Get top-selling items               |
| GET    | `/reports/open-balances`   | Get orders with remaining balances  |

### Users

Creating, updating, and deactivating users requires one of: `manager`, `admin`.

| Method | Endpoint     | Description     |
| ------ | ------------ | --------------- |
| POST   | `/users`     | Create user     |
| GET    | `/users`     | Get all users   |
| PATCH  | `/users/:id` | Update user     |
| DELETE | `/users/:id` | Deactivate user |

## Testing

Run the full test suite:

```bash
npm run test
```

Current test coverage checkpoint:

```txt
28 test files passed
443 tests passed
```

The test suite covers:

* CRUD operations
* Request validation
* Authentication
* JWT authorization
* Role permissions
* Kitchen queue behavior
* Order closing and cancellation
* Table occupancy and dirty table workflows
* Reports
* Payment flows
* Order summaries
