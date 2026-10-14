# 🛡️ Tropical Veterinary Drug Supply Management System
### *Enterprise Pharmaceutical Supply Chain & Defense-in-Depth Cybersecurity Architecture*

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel%20Live-black?style=for-the-badge&logo=vercel)](https://veterinary-drug-supply-management-system-lidiya1.vercel.app)
[![Render Backend](https://img.shields.io/badge/Backend-Render%20Live-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://tropical-vet-backend.onrender.com/health)
[![Neon PostgreSQL](https://img.shields.io/badge/Database-Neon%20Serverless%20Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

---

## 🌐 Live Production Deployments

| Component | Platform | Status | Live Link |
|---|---|---|---|
| **Web Client (SPA)** | **Vercel** | ![Status](https://img.shields.io/badge/Status-Live-emerald) | [🔗 Open Application](https://veterinary-drug-supply-management-system-lidiya1.vercel.app) |
| **API Gateway** | **Render** | ![Status](https://img.shields.io/badge/Status-Online-emerald) | [🔗 Health Endpoint](https://tropical-vet-backend.onrender.com/health) |
| **Relational Database** | **Neon** | ![Status](https://img.shields.io/badge/Status-Operational-emerald) | `Serverless PostgreSQL 16 (SSL Enforced)` |

> **Note for Evaluators**: If Vercel Deployment Protection is active on the team account, sign in via Vercel or use the provided credentials below inside the application.

---

## 📖 Executive Summary

The **Tropical Veterinary Drug Supply Management System** is a mission-critical full-stack platform engineered for **Tropical Veterinary**, an animal healthcare company importing and distributing veterinary pharmaceuticals, live vaccines, and livestock therapeutics.

The platform provides complete end-to-end supply chain transparency, automated stockout velocity forecasting, strict Role-Based Access Control (RBAC), and enterprise-grade defensive cybersecurity controls to protect pharmaceutical data integrity.

---

## 🔑 Pre-Configured Demo Credentials

The database has been seeded with three distinct operational roles. Quick one-click login buttons are also embedded directly into the login screen:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| 👑 **Administrator** | `admin@tropicalvet.com` | `Admin123!` | Full control: Inventory CRUD, Supplier directory, Sales & Purchases, Destructive Deletes, Security Audit Trail, Intrusion Anomaly Alerts |
| 💼 **Staff Member** | `staff@tropicalvet.com` | `Staff123!` | Operational: Add/Edit medicines, Manage suppliers, Record stock purchases and customer sales |
| 🔍 **Compliance Auditor** | `auditor@tropicalvet.com` | `Auditor123!` | Read-Only Regulatory Oversight: Review inventory, inspect suppliers, review full immutable audit trail & intrusion alarms |

---

## 🏛️ System Architecture

```
                                ┌─────────────────────────────────────────┐
                                │       React Frontend (SPA / Vite)       │
                                │  - Predictive Stockout Velocity Engine │
                                │  - Real-time Expiry & Restock Badges    │
                                │  - Audited Sales & Purchase Registers   │
                                │  - Intrusion & Anomaly Monitor Center   │
                                └────────────────────┬────────────────────┘
                                                     │ HTTPS / REST (JWT)
                                                     ▼
                                ┌─────────────────────────────────────────┐
                                │         Express API Gateway             │
                                │  - Helmet Defense-in-Depth Headers      │
                                │  - Distributed IP Rate Limiter          │
                                │  - Rapid Burst Intrusion Detection      │
                                │  - Regex-Based Input Sanitization       │
                                └────────────────────┬────────────────────┘
                                                     │
                 ┌───────────────────────────────────┴───────────────────────────────────┐
                 ▼                                                                       ▼
  ┌─────────────────────────────┐                                         ┌─────────────────────────────┐
  │   Security & Auth Engine    │                                         │    Supply Chain Services    │
  │  - Bcrypt 10 Salt Rounds    │                                         │  - Dynamic Stock Recalculate│
  │  - 5-Attempt Account Lockout│                                         │  - High-Volume Anomaly Flags│
  │  - Fine-Grained RBAC Guard  │                                         │  - Expiry Window Alerting   │
  │  - Non-Repudiation Logger   │                                         │  - Supplier Registry        │
  └──────────────┬──────────────┘                                         └──────────────┬──────────────┘
                 │                                                                       │
                 └───────────────────────────────────┬───────────────────────────────────┘
                                                     │ Parameterized SQL Queries ($1, $2)
                                                     ▼
                                ┌─────────────────────────────────────────┐
                                │       Neon Serverless PostgreSQL        │
                                │  - SSL Encrypted (require / rejectUnauth│
                                │  - Foreign Key Cascades & Check Bounds  │
                                │  - B-Tree Performance Indexes           │
                                └─────────────────────────────────────────┘
```

---

## 🔒 Defense-in-Depth Cybersecurity Specifications

### 1. Cryptographic Password Hashing
* **Standard**: Implements `bcryptjs` with **10 salt rounds** (`bcrypt.genSalt(10)`).
* **Threat Neutralized**: Defends against rainbow table attacks and precomputed dictionary lookups.

### 2. Stateless JWT Authentication & Claims Validation
* **Standard**: Issues HMAC-SHA256 signed JSON Web Tokens (`jsonwebtoken`) bearing user identity and RBAC claims. Tokens automatically expire after **8 hours** (`JWT_EXPIRES_IN=8h`).
* **Threat Neutralized**: Prevents session hijacking, credential replay, and unauthorized state tampering.

### 3. Role-Based Access Control (RBAC) & Least Privilege
* **Standard**: Enforces `authorizeRoles('Admin', 'Staff', 'Auditor')` middleware on every protected route.
* **Segregation of Duties**:
  * Destructive `DELETE` actions are strictly reserved for **Admin**.
  * Forensic audit trails and intrusion alerts (`/api/audit/*`) are accessible only by **Admin** and **Auditor**.
  * Unauthorized attempts trigger immediate high-severity records in `security_alerts`.

### 4. Brute-Force Shield: 5-Failed Attempts Account Lockout
* **Standard**: Tracks consecutive invalid authentication attempts. Upon the 5th consecutive failure, the account is locked for **15 minutes** (`locked_until = NOW() + 15 mins`) and an `ACCOUNT_LOCKED` security alert is dispatched.
* **Threat Neutralized**: Shuts down automated password spraying and dictionary attacks.

### 5. Rapid Request Anomaly Monitoring
* **Standard**: `detectRapidRequests` middleware tracks per-IP request timestamps. Requests targeting authentication endpoints arriving under `150ms` intervals raise a `RAPID_REQUEST_ANOMALY` alert.
* **Threat Neutralized**: Detects automated brute-force scripts and headless credential stuffers.

### 6. Relational SQL Injection Immunity
* **Standard**: Zero string concatenation across all database interactions. Every query uses parameterized placeholder bindings (`$1, $2, ... $n`) with native type coercion via `pg.Pool.query`.
* **Threat Neutralized**: Complete immunity against classic and blind SQL injection vulnerabilities.

### 7. Cross-Site Scripting (XSS) Sanitization
* **Standard**: Dual-layer defense utilizing `express-validator` and custom recursive middleware stripping `<script>` blocks, HTML injection, and `javascript:` pseudo-protocols across headers, query parameters, and JSON payloads.

### 8. Atomic Transactions & Stock Isolation
* **Standard**: Inventory adjustments execute in strict PostgreSQL atomic transactions (`BEGIN`, `SELECT ... FOR UPDATE`, `COMMIT`, `ROLLBACK`).
* **Threat Neutralized**: Eliminates race conditions and stock balance corruption under concurrent high-throughput orders.

### 9. High-Value / Volume Anomaly Detection
* **Standard**: Outbound sales exceeding 100 medicine units or $5,000 USD are automatically flagged as anomalous (`is_anomalous = TRUE`) and highlighted in both the transaction ledger and auditor dashboard.

### 10. Immutable Security Audit Trail (Non-Repudiation)
* **Standard**: Every sensitive lifecycle event (`AUTH_LOGIN`, `MEDICINE_CREATE`, `MEDICINE_DELETE`, `TRANSACTION_SALE`, etc.) writes an unalterable log containing timestamp, user identity, role, target resource, client IP, and HTTP user-agent.

---

## 📡 API Endpoint Reference

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/health` | Public | System uptime & health diagnostic |
| `POST` | `/api/auth/register` | Public | Register new staff account |
| `POST` | `/api/auth/login` | Public (Rate Limited) | Authenticate user & issue 8h JWT |
| `GET` | `/api/auth/me` | Authenticated | Fetch authenticated user profile |
| `GET` | `/api/inventory` | Admin, Staff, Auditor | List medicines (search, categories, expiry) |
| `GET` | `/api/inventory/analytics/predictive` | Admin, Staff, Auditor | Stockout velocity forecast & restocking KPIs |
| `GET` | `/api/inventory/:id` | Admin, Staff, Auditor | Fetch single medicine details |
| `POST` | `/api/inventory` | Admin, Staff | Create medicine catalog item |
| `PUT` | `/api/inventory/:id` | Admin, Staff | Update pricing, quantity, or reorder levels |
| `DELETE` | `/api/inventory/:id` | **Admin Only** | Remove medicine from catalog |
| `GET` | `/api/suppliers` | Admin, Staff, Auditor | Directory of pharmaceutical suppliers |
| `POST` | `/api/suppliers` | Admin, Staff | Register new medicine distributor |
| `PUT` | `/api/suppliers/:id` | Admin, Staff | Update supplier contact information |
| `DELETE` | `/api/suppliers/:id` | **Admin Only** | Remove supplier |
| `GET` | `/api/transactions` | Admin, Staff, Auditor | Filtered transaction history |
| `POST` | `/api/transactions` | Admin, Staff | Record purchase or sales transaction |
| `GET` | `/api/audit/logs` | **Admin, Auditor** | View immutable security audit trail |
| `GET` | `/api/audit/alerts` | **Admin, Auditor** | View intrusion alerts and anomalies |
| `PUT` | `/api/audit/alerts/:id/resolve` | **Admin, Auditor** | Mark security threat resolved |

---

## 📂 Project Repository Structure

```
veterinary-drug-supply-management-system/
├── README.md                           # Master documentation, architecture & live links
├── backend/
│   ├── .env.example                    # Template for cloud & local environment variables
│   ├── package.json                    # Backend dependencies (Express, pg, bcrypt, helmet)
│   ├── server.js                       # Express bootstrap, CORS & global security policies
│   ├── config/
│   │   └── db.js                       # PostgreSQL connection pool with Neon SSL support
│   ├── database/
│   │   ├── schema.sql                  # Production DDL (tables, checks, constraints, indexes)
│   │   ├── seed.sql                    # Initial drug catalog and RBAC accounts
│   │   └── initDb.js                   # Automated one-step DB creation and seeding script
│   ├── middleware/
│   │   ├── auth.js                     # JWT verification & RBAC authorization
│   │   ├── security.js                 # Rate limiters, rapid detection, XSS sanitizers
│   │   ├── validate.js                 # Express-validator input validation rules
│   │   └── auditLogger.js              # Immutable audit logging helper
│   ├── controllers/                    # Business logic controllers
│   └── routes/                         # Express API route modules
│
└── frontend/
    ├── package.json                    # React 18, Vite, Lucide React dependencies
    ├── vite.config.js                  # Vite configuration & local /api proxy
    ├── vercel.json                     # Vercel SPA rewrite routing configuration
    └── src/
        ├── App.jsx                     # Route definitions & authenticated shell
        ├── index.css                   # Custom medical emerald design system
        ├── api/client.js               # Centralized HTTP client with JWT interceptor
        ├── context/AuthContext.jsx     # User session & permission provider
        ├── components/                 # Modals, Navbar, Sidebar, StatCards
        └── pages/                      # Dashboard, Inventory, Suppliers, Ledger, Audit
```

---

## 💻 Local Development Setup

### 1. Prerequisites
* **Node.js** v18+ 
* **PostgreSQL** (Local instance or free [Neon.tech](https://neon.tech) cloud database)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local credentials or Neon DATABASE_URL
npm run db:init     # Builds schema and seeds accounts
npm run dev         # Launches backend on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev         # Launches Vite dev server on http://localhost:3000
```

---

## 📄 License & Attribution

Developed for **Tropical Veterinary Import & Distribution Operations**. Distributed under the ISC License.
