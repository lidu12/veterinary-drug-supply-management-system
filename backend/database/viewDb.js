const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'tropical_vet_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

/**
 * Database Visual Inspector CLI
 * File: backend/database/viewDb.js
 * 
 * Run with: npm run db:view
 */
const viewDatabase = async () => {
  console.log('\n======================================================================');
  console.log('🐾 TROPICAL VETERINARY — LIVE POSTGRESQL DATABASE INSPECTOR');
  console.log(`🗄️ Database: ${process.env.DB_NAME || 'tropical_vet_db'} | Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
  console.log('======================================================================\n');

  try {
    // 1. USERS TABLE
    console.log('👤 [1] TABLE: users');
    const users = await pool.query('SELECT id, username, email, role, failed_login_attempts, locked_until, created_at FROM users ORDER BY id ASC');
    console.table(users.rows);

    // 2. MEDICINES TABLE
    console.log('\n💊 [2] TABLE: medicines');
    const medicines = await pool.query('SELECT id, code, name, category, quantity, unit_price, expiry_date, reorder_level, supplier_id FROM medicines ORDER BY id ASC');
    console.table(medicines.rows);

    // 3. SUPPLIERS TABLE
    console.log('\n🏢 [3] TABLE: suppliers');
    const suppliers = await pool.query('SELECT id, name, contact_person, phone, email, address FROM suppliers ORDER BY id ASC');
    console.table(suppliers.rows);

    // 4. TRANSACTIONS TABLE
    console.log('\n📊 [4] TABLE: transactions');
    const transactions = await pool.query('SELECT id, transaction_type, medicine_id, quantity, unit_price, total_price, performed_by, is_anomalous, transaction_date FROM transactions ORDER BY id DESC LIMIT 10');
    console.table(transactions.rows);

    // 5. SECURITY ALERTS TABLE
    console.log('\n🛡️ [5] TABLE: security_alerts');
    const alerts = await pool.query('SELECT id, alert_type, severity, description, ip_address, is_resolved, created_at FROM security_alerts ORDER BY id DESC LIMIT 5');
    console.table(alerts.rows);

    // 6. AUDIT LOGS TABLE
    console.log('\n📜 [6] TABLE: audit_logs (Last 5 records)');
    const audit = await pool.query('SELECT id, user_email, user_role, action, resource, details, ip_address, status, timestamp FROM audit_logs ORDER BY id DESC LIMIT 5');
    console.table(audit.rows);

    console.log('\n✅ Database inspection completed successfully.\n');
  } catch (err) {
    console.error('❌ Failed to read database:', err.message);
  } finally {
    await pool.end();
  }
};

viewDatabase();
