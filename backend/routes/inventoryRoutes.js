const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { validate, medicineRules } = require('../middleware/validate');

/**
 * Inventory & Medicine Routes Module
 * File: backend/routes/inventoryRoutes.js
 * 
 * Functions & RBAC Permissions:
 * - GET    /api/inventory                      -> List medicines with search, category & alert filters (Admin, Staff, Auditor)
 * - GET    /api/inventory/analytics/predictive -> Stockout velocity prediction & inventory health KPI counters (Admin, Staff, Auditor)
 * - GET    /api/inventory/:id                  -> Fetch single medicine details and supplier info (Admin, Staff, Auditor)
 * - POST   /api/inventory                      -> Create new drug item with input validation (Admin, Staff)
 * - PUT    /api/inventory/:id                  -> Update drug item stock, price, supplier, expiry (Admin, Staff)
 * - DELETE /api/inventory/:id                  -> Delete drug item permanently with audit logging (Admin ONLY)
 */

// Apply JWT verification to all inventory routes
router.use(verifyToken);

// Predictive analytics endpoint (must be declared before :id route)
router.get(
  '/analytics/predictive',
  authorizeRoles('Admin', 'Staff', 'Auditor'),
  inventoryController.getPredictiveAnalytics
);

// Get all inventory medicines
router.get(
  '/',
  authorizeRoles('Admin', 'Staff', 'Auditor'),
  inventoryController.getAllMedicines
);

// Get single medicine by ID
router.get(
  '/:id',
  authorizeRoles('Admin', 'Staff', 'Auditor'),
  inventoryController.getMedicineById
);

// Create new medicine record
router.post(
  '/',
  authorizeRoles('Admin', 'Staff'),
  medicineRules,
  validate,
  inventoryController.createMedicine
);

// Update medicine record
router.put(
  '/:id',
  authorizeRoles('Admin', 'Staff'),
  inventoryController.updateMedicine
);

// Delete medicine record (strictly Admin only)
router.delete(
  '/:id',
  authorizeRoles('Admin'),
  inventoryController.deleteMedicine
);

module.exports = router;
