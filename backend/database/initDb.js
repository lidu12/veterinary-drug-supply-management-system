const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432');
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const targetDbName = process.env.DB_NAME || 'tropical_vet_db';

/**
 * Enhanced Database Initializer:
 * 1. Connects to the default administration database ('postgres')
 * 2. Automatically creates 'tropical_vet_db' if it does not exist
 * 3. Connects to 'tropical_vet_db' and builds tables, constraints, and indexes from schema.sql
 * 4. Seeds default RBAC users with bcrypt hashes, suppliers, medicines, and transactions
 */
const initDatabase = async () => {
  console.log('🔄 Initializing Tropical Veterinary Database...');

  // Step 1: Connect to default 'postgres' database to ensure tropical_vet_db exists
  const adminPool = new Pool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres',
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log(`🔍 Checking if database '${targetDbName}' exists...`);
    const checkRes = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDbName]
    );

    if (checkRes.rows.length === 0) {
      console.log(`🔨 Database '${targetDbName}' does not exist. Creating it now...`);
      await adminPool.query(`CREATE DATABASE "${targetDbName}"`);
      console.log(`✅ Database '${targetDbName}' created successfully.`);
    } else {
      console.log(`✅ Database '${targetDbName}' already exists.`);
    }
  } catch (err) {
    console.error('⚠️ Warning while checking/creating database:', err.message);
  } finally {
    await adminPool.end();
  }

  // Step 2: Connect to targetDbName to execute schema and seeds
  const targetPool = new Pool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: targetDbName,
    connectionTimeoutMillis: 5000,
  });

  try {
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔨 Executing schema.sql (creating tables, foreign keys, and indexes)...');
    await targetPool.query(schemaSql);
    console.log('✅ Tables and constraints created successfully.');

    // Generate secure bcrypt hashes for seed users
    const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
    const staffPasswordHash = await bcrypt.hash('Staff123!', 10);
    const auditorPasswordHash = await bcrypt.hash('Auditor123!', 10);

    // Insert default RBAC users
    console.log('👤 Seeding default RBAC accounts (Admin, Staff, Auditor)...');
    await targetPool.query(`
      INSERT INTO users (username, email, password_hash, role) VALUES
      ('admin_user', 'admin@tropicalvet.com', $1, 'Admin'),
      ('staff_user', 'staff@tropicalvet.com', $2, 'Staff'),
      ('auditor_user', 'auditor@tropicalvet.com', $3, 'Auditor')
      ON CONFLICT (email) DO NOTHING;
    `, [adminPasswordHash, staffPasswordHash, auditorPasswordHash]);

    // Insert suppliers
    console.log('🏢 Seeding pharmaceutical suppliers...');
    await targetPool.query(`
      INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
      ('PharmaVet Imports Ltd', 'Dr. Samuel Vance', '+251-911-234567', 'sales@pharmavet.com', 'Bole Sub-city, Addis Ababa, Ethiopia'),
      ('AgriMed Global Solutions', 'Elena Rostova', '+44-20-7946-0912', 'export@agrimed.co.uk', 'London Gateway Business Park, UK'),
      ('BioVet Animal Health Inc', 'Carlos Mendez', '+1-305-555-0199', 'orders@biovethealth.com', 'Miami Free Trade Zone, FL, USA')
      ON CONFLICT DO NOTHING;
    `);

    // Insert medicines catalog
    console.log('💊 Seeding veterinary medicines catalog...');
    await targetPool.query(`
      INSERT INTO medicines (code, name, category, quantity, unit_price, expiry_date, reorder_level, supplier_id) VALUES
      ('VET-ANT-001', 'Penicillin G Procaine 300,000 IU', 'Antibiotics', 150, 45.50, CURRENT_DATE + INTERVAL '180 days', 30, 1),
      ('VET-ANT-002', 'Oxytetracycline 20% Injection', 'Antibiotics', 15, 68.00, CURRENT_DATE + INTERVAL '15 days', 25, 1),
      ('VET-VAC-001', 'Rinderpest/PPR Vaccine (50 doses)', 'Vaccines', 200, 120.00, CURRENT_DATE + INTERVAL '365 days', 40, 2),
      ('VET-VAC-002', 'Anthrax Spore Live Vaccine', 'Vaccines', 8, 95.00, CURRENT_DATE - INTERVAL '5 days', 20, 2),
      ('VET-PAR-001', 'Ivermectin 1% Cattle Dewormer', 'Anti-parasitic', 80, 32.00, CURRENT_DATE + INTERVAL '240 days', 25, 3),
      ('VET-VIT-001', 'Multivitamin + Amino Acids Injectable', 'Vitamins', 12, 28.50, CURRENT_DATE + INTERVAL '90 days', 20, 3)
      ON CONFLICT (code) DO NOTHING;
    `);

    // Insert sample transactions
    console.log('📊 Seeding initial transaction history...');
    await targetPool.query(`
      INSERT INTO transactions (transaction_type, medicine_id, quantity, unit_price, total_price, performed_by, notes, is_anomalous) VALUES
      ('PURCHASE', 1, 200, 40.00, 8000.00, 1, 'Initial batch import from PharmaVet', FALSE),
      ('SALE', 1, 50, 45.50, 2275.00, 2, 'Sale to Oromia Regional Pastoral Clinic', FALSE),
      ('SALE', 3, 50, 120.00, 6000.00, 2, 'Routine vaccination program supply', FALSE)
      ON CONFLICT DO NOTHING;
    `);

    // Insert sample audit logs and security alerts
    console.log('🛡️ Seeding security alerts and audit trail...');
    await targetPool.query(`
      INSERT INTO audit_logs (user_id, user_email, user_role, action, resource, details, ip_address, status) VALUES
      (1, 'admin@tropicalvet.com', 'Admin', 'SYSTEM_INIT', '/system/init', 'Database initialized and seeded with RBAC users and drug inventory catalog', '127.0.0.1', 'SUCCESS');
      
      INSERT INTO security_alerts (alert_type, severity, description, user_id, ip_address, is_resolved) VALUES
      ('EXPIRY_WARNING', 'MEDIUM', 'Medicine VET-VAC-002 (Anthrax Spore Live Vaccine) is expired', NULL, '127.0.0.1', FALSE),
      ('LOW_STOCK_WARNING', 'HIGH', 'Medicine VET-ANT-002 (Oxytetracycline 20%) stock (15) is below reorder threshold (25)', NULL, '127.0.0.1', FALSE);
    `);

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Default test accounts ready for login:');
    console.log('  👑 Admin:   admin@tropicalvet.com   | Password: Admin123!');
    console.log('  💼 Staff:   staff@tropicalvet.com   | Password: Staff123!');
    console.log('  🔍 Auditor: auditor@tropicalvet.com | Password: Auditor123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database Initialization Failed:', error);
    process.exit(1);
  } finally {
    await targetPool.end();
  }
};

initDatabase();
