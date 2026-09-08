-- =============================================================================
-- Tropical Veterinary - Seed Data for System Evaluation
-- Default Accounts:
-- Admin: admin@tropicalvet.com / Admin123!
-- Staff: staff@tropicalvet.com / Staff123!
-- Auditor: auditor@tropicalvet.com / Auditor123!
-- =============================================================================

-- 1. SEED USERS (Bcrypt hashed passwords for Admin123!, Staff123!, Auditor123!)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin_user', 'admin@tropicalvet.com', '$2a$10$7Z8Kqf2R1s4Y8x9W0v1u2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8', 'Admin'),
('staff_user', 'staff@tropicalvet.com', '$2a$10$7Z8Kqf2R1s4Y8x9W0v1u2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8', 'Staff'),
('auditor_user', 'auditor@tropicalvet.com', '$2a$10$7Z8Kqf2R1s4Y8x9W0v1u2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8', 'Auditor');

-- 2. SEED SUPPLIERS
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('PharmaVet Imports Ltd', 'Dr. Samuel Vance', '+251-911-234567', 'sales@pharmavet.com', 'Bole Sub-city, Addis Ababa, Ethiopia'),
('AgriMed Global Solutions', 'Elena Rostova', '+44-20-7946-0912', 'export@agrimed.co.uk', 'London Gateway Business Park, UK'),
('BioVet Animal Health Inc', 'Carlos Mendez', '+1-305-555-0199', 'orders@biovethealth.com', 'Miami Free Trade Zone, FL, USA');

-- 3. SEED MEDICINES
INSERT INTO medicines (code, name, category, quantity, unit_price, expiry_date, reorder_level, supplier_id) VALUES
('VET-ANT-001', 'Penicillin G Procaine 300,000 IU', 'Antibiotics', 150, 45.50, CURRENT_DATE + INTERVAL '180 days', 30, 1),
('VET-ANT-002', 'Oxytetracycline 20% Injection', 'Antibiotics', 15, 68.00, CURRENT_DATE + INTERVAL '15 days', 25, 1),
('VET-VAC-001', 'Rinderpest/PPR Vaccine (50 doses)', 'Vaccines', 200, 120.00, CURRENT_DATE + INTERVAL '365 days', 40, 2),
('VET-VAC-002', 'Anthrax Spore Live Vaccine', 'Vaccines', 8, 95.00, CURRENT_DATE - INTERVAL '5 days', 20, 2),
('VET-PAR-001', 'Ivermectin 1% Cattle Dewormer', 'Anti-parasitic', 80, 32.00, CURRENT_DATE + INTERVAL '240 days', 25, 3),
('VET-VIT-001', 'Multivitamin + Amino Acids Injectable', 'Vitamins', 12, 28.50, CURRENT_DATE + INTERVAL '90 days', 20, 3);

-- 4. SEED TRANSACTIONS
INSERT INTO transactions (transaction_type, medicine_id, quantity, unit_price, total_price, performed_by, notes, is_anomalous) VALUES
('PURCHASE', 1, 200, 40.00, 8000.00, 1, 'Initial batch import from PharmaVet', FALSE),
('SALE', 1, 50, 45.50, 2275.00, 2, 'Sale to Oromia Regional Pastoral Clinic', FALSE),
('SALE', 3, 50, 120.00, 6000.00, 2, 'Routine vaccination program supply', FALSE);

-- 5. SEED AUDIT LOGS
INSERT INTO audit_logs (user_id, user_email, user_role, action, resource, details, ip_address, status) VALUES
(1, 'admin@tropicalvet.com', 'Admin', 'SYSTEM_BOOT', '/system/boot', 'Database seeded with RBAC users and medicine catalog', '127.0.0.1', 'SUCCESS');

-- 6. SEED SECURITY ALERTS
INSERT INTO security_alerts (alert_type, severity, description, user_id, ip_address, is_resolved) VALUES
('EXPIRY_WARNING', 'MEDIUM', 'Medicine VET-VAC-002 expired 5 days ago', NULL, '127.0.0.1', FALSE),
('LOW_STOCK_WARNING', 'HIGH', 'Medicine VET-ANT-002 stock (15) is below reorder threshold (25)', NULL, '127.0.0.1', FALSE);
