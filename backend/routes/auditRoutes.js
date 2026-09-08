const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

/**
 * Security Audit & Intrusion Alerts Routes Module
 * File: backend/routes/auditRoutes.js
 * 
 * Functions & RBAC Permissions:
 * - GET /api/audit/logs              -> Fetch immutable security audit logs (Admin, Auditor)
 * - GET /api/audit/alerts            -> Fetch intrusion alerts and anomalous threat logs (Admin, Auditor)
 * - PUT /api/audit/alerts/:id/resolve -> Mark security alert as investigated & resolved (Admin, Auditor)
 */

// Apply JWT verification to all audit routes
router.use(verifyToken);

// Segregation of duties: Only Admin and Auditor roles can inspect security logs
router.use(authorizeRoles('Admin', 'Auditor'));

// Retrieve non-repudiation audit logs
router.get('/logs', auditController.getAuditLogs);

// Retrieve security threat alerts
router.get('/alerts', auditController.getSecurityAlerts);

// Mark security alert as resolved
router.put('/alerts/:id/resolve', auditController.resolveSecurityAlert);

module.exports = router;
