# 🛡️ Secure Veterinary Drug Supply Management System
### **Tropical Veterinary Import & Distribution Operations**
*Enterprise Cybersecurity Architecture & Auditable Supply Chain System*

---

## 📖 System Overview

The **Secure Veterinary Drug Supply Management System** is a production-grade full-stack web application custom-built for **Tropical Veterinary**, an animal healthcare company importing and distributing veterinary pharmaceuticals, vaccines, and supplements.

The platform delivers complete supply chain control, predictive stockout velocity modeling, strict Role-Based Access Control (RBAC), and defense-in-depth cybersecurity tailored for Tropical Veterinary's mission-critical operations.

---

## 🏛️ System Architecture

```
                               ┌─────────────────────────────────────────┐
                               │       React Frontend (SPA / Vite)       │
                               │  - Dashboard & Velocity Forecast Engine │
                               │  - Drug Inventory & Expiry Badges       │
                               │  - Supplier Directory & Transactions    │
                               │  - Security Audit & Intrusion Center    │
                               └────────────────────┬────────────────────┘
                                                    │ HTTPS / REST (JWT)
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │         Express API Gateway             │
                               │  - Helmet Security Headers              │
                               │  - IP Rate Limiting & DoS Shield        │
                               │  - XSS Sanitization & Rapid Detect      │
                               └────────────────────┬────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼                                                                     ▼
  ┌─────────────────────────────┐                                       ┌─────────────────────────────┐
  │   Security & Auth Layer     │                                       │   Supply Chain Core         │
  │  - Bcrypt Hashing (10 Rnds) │                                       │  - Inventory Management     │
  │  - 5-Attempt Account Lockout│                                       │  - Predictive Stock Velocity│
  │  - RBAC (Admin/Staff/Audit) │                                       │  - Atomic Sales & Purchases │
  │  - Non-Repudiation Auditing │                                       │  - Supplier Registrations   │
  └──────────────┬──────────────┘                                       └──────────────┬──────────────┘
                 │                                                                     │
                 └──────────────────────────────────┬──────────────────────────────────┘
                                                    │ Parameterized SQL ($1, $2)
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │       PostgreSQL Relational DB          │
                               │  - users, medicines, suppliers,         │
                               │    transactions, audit_logs, alerts     │
                               └─────────────────────────────────────────┘
```

---

## 📂 Project Folder Structure

```
veterinary-drug-supply-management-system/
├── README.md                           # System documentation and security specification
├── backend/
│   ├── .env                            # Backend environment configuration
│   ├── .env.example                    # Environment template
│   ├── package.json                    # Backend dependencies and scripts
│   ├── server.js                       # Express application entry point and global security middleware
│   ├── config/
│   │   └── db.js                       # PostgreSQL connection pool with parameterized query helpers
│   ├── database/
│   │   ├── schema.sql                  # Complete SQL DDL with constraints and indexes
│   │   ├── seed.sql                    # Initial seed data for catalog and default accounts
│   │   └── initDb.js                   # Automated one-step DB creation and seeding script
│   ├── middleware/
│   │   ├── auth.js                     # JWT token verification and Role-Based Access Control (RBAC)
│   │   ├── security.js                 # Rate limiters, rapid request intrusion detection, XSS sanitization
│   │   ├── validate.js                 # Input validation rules using express-validator
│   │   └── auditLogger.js              # Immutable audit logging helper for non-repudiation
│   ├── controllers/
│   │   ├── authController.js           # Registration, login with 5-attempt lockout, and profile retrieval
│   │   ├── inventoryController.js      # CRUD operations, stock status badges, predictive stockout velocity
│   │   ├── supplierController.js       # Pharmaceutical supplier CRUD and import statistics
│   │   ├── transactionController.js    # Atomic sales/purchases with stock lock and anomaly detection
│   │   └── auditController.js          # Audit log queries and security threat alert management
│   └── routes/
│       ├── authRoutes.js               # /api/auth routes
│       ├── inventoryRoutes.js          # /api/inventory routes
│       ├── supplierRoutes.js           # /api/suppliers routes
│       ├── transactionRoutes.js        # /api/transactions routes
│       └── auditRoutes.js              # /api/audit routes
│
└── frontend/
    ├── package.json                    # Frontend dependencies (React, Vite, Lucide)
    ├── vite.config.js                  # Vite configuration and API proxy
    ├── index.html                      # Single-page app HTML template
    └── src/
        ├── main.jsx                    # React DOM bootstrap
        ├── App.jsx                     # Core application routing and shell
        ├── index.css                   # Custom design system with medical emerald dark theme
        ├── api/
        │   └── client.js               # Centralized HTTP client with JWT interceptor
        ├── context/
        │   └── AuthContext.jsx         # React Auth context and RBAC permission helper
        ├── components/
        │   ├── Navbar.jsx              # System status bar, clock, and user badge
        │   ├── Sidebar.jsx             # Role-aware navigation sidebar
        │   ├── StatCard.jsx            # Reusable KPI card with glowing indicators
        │   └── Modal.jsx               # Accessible dialog modal component
        └── pages/
            ├── LoginPage.jsx           # Secure login with lockout countdown & demo buttons
            ├── RegisterPage.jsx        # Verified account registration
            ├── DashboardPage.jsx       # Overview metrics, predictive stockout forecast, and alert ribbon
            ├── InventoryPage.jsx       # Medicine catalog with search, category/alert filters, and CRUD
            ├── SuppliersPage.jsx       # Import supplier directory and contact management
            ├── TransactionsPage.jsx    # Audited stock transactions ledger with anomaly flags
            └── AuditLogsPage.jsx       # Real-time intrusion alerts and audit trail (Admin/Auditor)
```

---

## ⚡ Quick Setup & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v13.0 or higher

---

### Step 1: Database Setup
1. Create a PostgreSQL database named `tropical_vet_db`:
   ```sql
   CREATE DATABASE tropical_vet_db;
   ```
2. Verify credentials in `backend/.env`:
   ```ini
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=tropical_vet_super_secret_jwt_key_2026_production_security
   JWT_EXPIRES_IN=8h
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=tropical_vet_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   ```

3. Run the automated database initializer & seeder:
   ```bash
   cd backend
   npm run db:init
   ```
   *This automatically executes `schema.sql`, generates real bcrypt hashes, and seeds initial data.*

---

### Step 2: Run Backend Server
```bash
cd backend
npm install
npm run dev
```
- API Server will run at: **`http://localhost:5000`**
- Health Check: **`http://localhost:5000/health`**

---

### Step 3: Run Frontend React App
```bash
cd frontend
npm install
npm run dev
```
- Frontend application will run at: **`http://localhost:3000`**

---

## 🔑 Default Test Accounts

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| 👑 **Admin** | `admin@tropicalvet.com` | `Admin123!` | Full system access: Inventory CRUD, Supplier CRUD, Transactions, Audit Logs, Delete Operations |
| 💼 **Staff** | `staff@tropicalvet.com` | `Staff123!` | Inventory Management (Add/Edit), Suppliers (Add/Edit), Record Sales & Purchases |
| 🔍 **Auditor** | `auditor@tropicalvet.com` | `Auditor123!` | Read-Only Access: Review Inventory, Review Suppliers, Inspect Full Audit Trail & Security Alerts |

*(Quick one-click evaluation buttons are also provided directly on the Login screen).*

---

## 🔒 Comprehensive Tropical Veterinary Cybersecurity Architecture

### 1. Cryptographic Password Protection
- **Implementation**: Uses `bcryptjs` with **10 salt rounds** (`bcrypt.genSalt(10)`).
- **Defense**: Defends against rainbow table attacks and pre-computed hash lookup dictionaries.

### 2. JWT Authentication & Bearer Token Claims
- **Implementation**: Issues signed JWT tokens using HMAC-SHA256 (`jsonwebtoken`) containing user ID, username, email, and RBAC role. Tokens automatically expire after 8 hours (`JWT_EXPIRES_IN=8h`).
- **Defense**: Stateless authentication with signature validation prevents session tampering.

### 3. Role-Based Access Control (RBAC) & Principle of Least Privilege
- **Implementation**: `authorizeRoles('Admin', 'Staff', 'Auditor')` middleware enforces granular role authorization at the route level.
- **Segregation of Duties**:
  - Only **Admin** can perform destructive `DELETE` operations.
  - Only **Admin** and **Auditor** can access the security audit logs and intrusion alerts (`/api/audit/*`).
  - Unauthorized attempts immediately log high-severity alerts to `security_alerts`.

### 4. Brute-Force Defense: 5-Failed Attempts Account Lockout
- **Implementation**: Tracks consecutive failed password attempts in `users.failed_login_attempts`. On the 5th failed attempt, the account is locked for 15 minutes (`locked_until = NOW() + 15 mins`) and an `ACCOUNT_LOCKED` security alert is dispatched.
- **Defense**: Mitigates automated online dictionary and credential-stuffing attacks.

### 5. Intrusion Detection: Rapid Request Burst Monitoring
- **Implementation**: `detectRapidRequests` middleware tracks timestamps per client IP. Requests to authentication endpoints with intervals `< 150ms` trigger a `RAPID_REQUEST_ANOMALY` alert.
- **Defense**: Detects automated brute-force bots and script-based credential crackers.

### 6. IP Anomaly Detection
- **Implementation**: The system records `last_login_ip`. If a user successfully logs in from an IP address different from their prior session, an `UNUSUAL_IP_LOGIN` alert is raised.

### 7. SQL Injection Immunity
- **Implementation**: All SQL interactions use parameterized queries with `$1, $2, ... $n` variable binding via `pg.Pool.query`. Raw user strings are never concatenated directly into SQL clauses.

### 8. Cross-Site Scripting (XSS) Sanitization
- **Implementation**: The custom `sanitizeInput` middleware and `express-validator.escape()` recursively strip `<script>` tags and `javascript:` URIs from all incoming JSON payloads, query parameters, and route parameters.

### 9. Atomic Transaction Stock Isolation (Race Condition Prevention)
- **Implementation**: Medicine transactions use PostgreSQL atomic transactions (`BEGIN`, `SELECT ... FOR UPDATE`, `COMMIT`, `ROLLBACK`). Row locking ensures that concurrent sales cannot over-allocate or corrupt medicine stock balances.

### 10. High-Volume Transaction Anomaly Detection
- **Implementation**: Sales exceeding 100 units or $5,000 USD total are automatically flagged with `is_anomalous = TRUE` and logged to `security_alerts` for auditor review.

### 11. Immutable Security Audit Logging (Non-Repudiation)
- **Implementation**: All sensitive actions (`AUTH_LOGIN`, `MEDICINE_CREATE`, `MEDICINE_DELETE`, `TRANSACTION_SALE`, etc.) write an immutable record to `audit_logs` capturing user ID, email, role, action, target resource, client IP, user-agent, and status.

---

## 📡 API Endpoint Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public (Rate Limited) | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Authenticated | Fetch current profile |
| `GET` | `/api/inventory` | Admin, Staff, Auditor | List medicines (search & filters) |
| `GET` | `/api/inventory/analytics/predictive` | Admin, Staff, Auditor | Stockout velocity forecast & KPIs |
| `GET` | `/api/inventory/:id` | Admin, Staff, Auditor | Single medicine details |
| `POST` | `/api/inventory` | Admin, Staff | Create medicine item |
| `PUT` | `/api/inventory/:id` | Admin, Staff | Update medicine item |
| `DELETE` | `/api/inventory/:id` | **Admin Only** | Delete medicine item |
| `GET` | `/api/suppliers` | Admin, Staff, Auditor | List suppliers & medicine counts |
| `POST` | `/api/suppliers` | Admin, Staff | Register new supplier |
| `PUT` | `/api/suppliers/:id` | Admin, Staff | Update supplier details |
| `DELETE` | `/api/suppliers/:id` | **Admin Only** | Delete supplier |
| `GET` | `/api/transactions` | Admin, Staff, Auditor | List transactions with filters |
| `POST` | `/api/transactions` | Admin, Staff | Record sale/purchase transaction |
| `GET` | `/api/audit/logs` | **Admin, Auditor** | View immutable audit trail |
| `GET` | `/api/audit/alerts` | **Admin, Auditor** | View intrusion alerts |
| `PUT` | `/api/audit/alerts/:id/resolve` | **Admin, Auditor** | Mark security alert resolved |

---

## 👨‍💻 System Capabilities Checklist

- [x] Full Backend with Express, Node.js, and PostgreSQL
- [x] Database Schema with 6 relational tables, check constraints, foreign keys, and indexes
- [x] Bcrypt password hashing (10 rounds) & JWT tokens (8h expiry)
- [x] 3 RBAC Roles: Admin, Staff, Auditor
- [x] 5-Attempt account lockout for 15 minutes
- [x] Intrusion detection (rapid request bursts & IP change warnings)
- [x] Input validation & XSS sanitization (Express Validator + custom regex filter)
- [x] SQL Injection protection via parameterized queries
- [x] Predictive low-stock velocity calculation
- [x] High-volume transaction anomaly detection
- [x] Modern, clean React frontend with role-aware UI and glassmorphism styling
- [x] Complete setup instructions and Tropical Veterinary cybersecurity defense documentation

---
*Developed for Tropical Veterinary Drug Supply Management System.*
