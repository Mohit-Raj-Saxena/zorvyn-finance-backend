# Finance Data Processing and Access Control Backend

A backend system for a finance dashboard built with Node.js, Express, and MongoDB. The system supports financial record management, role-based access control, and dashboard analytics APIs.

## Live API

Base URL:
https://zorvyn-finance-backend-6g7q.onrender.com

Example endpoint:
POST /api/auth/register

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator
- **Security:** express-rate-limit

## Features

- JWT based authentication (register, login)
- Role based access control (Viewer, Analyst, Admin)
- Financial records management with soft delete
- Dashboard summary and analytics APIs
- Input validation with clear error messages
- Rate limiting to prevent brute force attacks
- Pagination and search support
- Date and category based filtering
- MongoDB Atlas cloud database

## Project Structure
```
zorvyn-finance-backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js      # Register and login logic
│   │   ├── userController.js      # User management logic
│   │   ├── recordController.js    # Financial records logic
│   │   └── dashboardController.js # Analytics and summary logic
│   ├── middleware/
│   │   ├── auth.js                # JWT verification middleware
│   │   └── roles.js               # Role based access control middleware
│   ├── models/
│   │   ├── User.js                # User schema
│   │   └── Record.js              # Financial record schema
│   ├── routes/
│   │   ├── auth.js                # Auth routes
│   │   ├── users.js               # User routes
│   │   ├── records.js             # Record routes
│   │   └── dashboard.js           # Dashboard routes
│   ├── app.js                     # Express app setup
│   └── server.js                  # Server entry point
├── .env                           # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

## Roles and Permissions

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| Register / Login | ✅ | ✅ | ✅ |
| View records | ✅ | ✅ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View category totals | ❌ | ✅ | ✅ |
| View monthly trends | ❌ | ✅ | ✅ |
| View weekly trends | ❌ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd zorvyn-finance-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create a `.env` file in the root directory
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```
### 4. Run the server
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## API Documentation

### Authentication

#### Register User

POST /api/auth/register
Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "viewer"
}
```

#### Login User
POST /api/auth/login
Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Users

#### Get own profile
GET /api/users/profile
Authorization: Bearer <token>
#### Get all users (Admin only)
GET /api/users
Authorization: Bearer <token>

#### Get user by ID (Admin only)
GET /api/users/:id
Authorization: Bearer <token>

#### Update user role or status (Admin only)
PUT /api/users/:id
Authorization: Bearer <token>
Body:
```json
{
  "role": "analyst",
  "status": "active"
}
```
#### Delete user (Admin only)
DELETE /api/users/:id
Authorization: Bearer <token>
---

### Financial Records

#### Create record (Admin only)
POST /api/records
Authorization: Bearer <token>
Body:
```json
{
  "amount": 50000,
  "type": "income",
  "category": "Salary",
  "date": "2026-04-01",
  "notes": "Monthly salary"
}
```

#### Get all records with filtering and search
GET /api/records
Authorization: Bearer <token>
Query parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| type | Filter by income or expense | ?type=expense |
| category | Filter by category | ?category=Rent |
| startDate | Filter from date | ?startDate=2026-04-01 |
| endDate | Filter to date | ?endDate=2026-04-30 |
| search | Search in notes and category | ?search=monthly |
| page | Page number (default 1) | ?page=2 |
| limit | Records per page (default 10) | ?limit=5 |

Example:
GET /api/records?type=expense&startDate=2026-04-01&page=1&limit=5

#### Get record by ID
GET /api/records/:id
Authorization: Bearer <token>

#### Update record (Admin only)
PUT /api/records/:id
Authorization: Bearer <token>
Body:
```json
{
  "amount": 55000,
  "notes": "Updated salary"
}
```

#### Delete record - Soft Delete (Admin only)
DELETE /api/records/:id
Authorization: Bearer <token>
---

### Dashboard

#### Get summary (All roles)
GET /api/dashboard/summary
Authorization: Bearer <token>
Response:
```json
{
  "totalIncome": 70000,
  "totalExpenses": 23000,
  "netBalance": 47000
}
```

#### Get category totals (Analyst, Admin)
GET /api/dashboard/categories
Authorization: Bearer <token>

#### Get recent activity (All roles)
GET /api/dashboard/recent
Authorization: Bearer <token>

#### Get monthly trends (Analyst, Admin)
GET /api/dashboard/trends/monthly
Authorization: Bearer <token>

#### Get weekly trends (Analyst, Admin)
GET /api/dashboard/trends/weekly
Authorization: Bearer <token>
---

## Assumptions Made

- Any user can register with any role for simplicity. In a production system, role assignment would be restricted to admins only.
- Soft delete is used for financial records so that data is never permanently lost and can be audited later.
- Rate limiting is set to 100 requests per 15 minutes globally and 10 requests per 15 minutes for auth routes to prevent brute force attacks.
- JWT tokens expire after 7 days.
- The `createdBy` field in records tracks which admin created each record for audit purposes.

## Tradeoffs Considered

- **MongoDB over SQL:** Chosen because the schema is flexible and financial records can vary in structure. MongoDB Atlas also removes the need for local database setup.
- **Soft delete over hard delete:** Financial data should never be permanently deleted. Soft delete preserves data integrity and allows future auditing.
- **JWT over sessions:** JWT is stateless and more suitable for REST APIs. It also scales better since no session store is needed.
- **express-validator over manual validation:** Provides clean, maintainable validation rules that are easy to extend.
- **Mongoose over raw MongoDB driver:** Provides schema enforcement, validation, and cleaner query syntax.