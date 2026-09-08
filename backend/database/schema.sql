-- =============================================================================
-- Tropical Veterinary - Secure Veterinary Drug Supply Management System Schema
-- Enterprise Cybersecurity Architecture for Tropical Veterinary
-- =============================================================================

-- Drop tables if they exist (clean rebuild order: reverse dependency order)
DROP TABLE IF EXISTS security_alerts CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
-- Stores user accounts, bcrypt hashes, RBAC roles, and 5-attempt security lockouts
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Staff', 'Auditor')),
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SUPPLIERS TABLE
-- Stores medicine importing companies
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. MEDICINES TABLE
-- Drug catalog with stock quantities, expiry tracking, and reorder levels
CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- e.g., Antibiotics, Vaccines, Anti-parasitic, Vitamins, Painkillers
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    expiry_date DATE NOT NULL,
    reorder_level INT NOT NULL DEFAULT 20,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TRANSACTIONS TABLE
-- Audited sales and purchase transactions with anomaly flags
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('PURCHASE', 'SALE')),
    medicine_id INT REFERENCES medicines(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    performed_by INT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    is_anomalous BOOLEAN DEFAULT FALSE,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AUDIT LOGS TABLE
-- Non-repudiation security audit trail for all user actions
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(100),
    user_role VARCHAR(20),
    action VARCHAR(50) NOT NULL, -- e.g. AUTH_LOGIN, MEDICINE_ADD, TRANSACTION_SALE
    resource VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'SUCCESS', -- SUCCESS, FAILED, WARNING, BLOCKED
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SECURITY ALERTS TABLE
-- Stores security threats, intrusion alerts, and unusual activity warnings
CREATE TABLE security_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL, -- e.g., ACCOUNT_LOCKED, RAPID_ATTEMPTS, MULTIPLE_IP_LOGIN, HIGH_VOLUME_SALE
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Database Performance & Security Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_medicines_expiry ON medicines(expiry_date);
CREATE INDEX idx_medicines_reorder ON medicines(quantity, reorder_level);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_alerts_unresolved ON security_alerts(is_resolved, created_at DESC);
