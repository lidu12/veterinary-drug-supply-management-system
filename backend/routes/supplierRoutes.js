const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { validate, supplierRules } = require('../middleware/validate');

/**
 * Supplier Management Routes Module
 * File: backend/routes/supplierRoutes.js
 * 
 * Functions & RBAC Permissions:
 * - GET    /api/suppliers     -> List all drug import companies with supplied medicine counts (Admin, Staff, Auditor)
 * - POST   /api/suppliers     -> Register a new supplier with validated contact details (Admin, Staff)
 * - PUT    /api/suppliers/:id -> Update supplier contact info and address (Admin, Staff)
 * - DELETE /api/suppliers/:id -> Remove supplier with full audit logging (Admin ONLY)
 */

// Apply JWT verification to all supplier routes
router.use(verifyToken);

// Get all suppliers
router.get(
  '/',
  authorizeRoles('Admin', 'Staff', 'Auditor'),
  supplierController.getAllSuppliers
);

// Create new supplier
router.post(
  '/',
  authorizeRoles('Admin', 'Staff'),
  supplierRules,
  validate,
  supplierController.createSupplier
);

// Update supplier details
router.put(
  '/:id',
  authorizeRoles('Admin', 'Staff'),
  supplierController.updateSupplier
);

// Delete supplier (Admin only)
router.delete(
  '/:id',
  authorizeRoles('Admin'),
  supplierController.deleteSupplier
);

module.exports = router;
