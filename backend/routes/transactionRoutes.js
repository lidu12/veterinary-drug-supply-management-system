const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { validate, transactionRules } = require('../middleware/validate');

/**
 * Sales & Purchase Transactions Routes Module
 * File: backend/routes/transactionRoutes.js
 * 
 * Functions & RBAC Permissions:
 * - GET  /api/transactions -> Retrieve transaction history with type/anomaly filters (Admin, Staff, Auditor)
 * - POST /api/transactions -> Execute atomic SALE/PURCHASE transaction with stock deduction/addition,
 *                             insufficient stock check, and automated high-volume anomaly detection (Admin, Staff)
 */

// Apply JWT verification to all transaction routes
router.use(verifyToken);

// Get transaction history
router.get(
  '/',
  authorizeRoles('Admin', 'Staff', 'Auditor'),
  transactionController.getAllTransactions
);

// Record purchase or sale
router.post(
  '/',
  authorizeRoles('Admin', 'Staff'),
  transactionRules,
  validate,
  transactionController.recordTransaction
);

module.exports = router;
