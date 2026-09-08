const { validationResult, body } = require('express-validator');

// Handle Express Validator Validation Errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error: Payload fails security criteria.',
      errors: errors.array()
    });
  }
  next();
};

// Auth Payload Validation Rules
const registerRules = [
  body('username').trim().isLength({ min: 3, max: 30 }).escape().withMessage('Username must be 3-30 characters.'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email address required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').isIn(['Admin', 'Staff', 'Auditor']).withMessage('Role must be Admin, Staff, or Auditor.')
];

const loginRules = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email address required.'),
  body('password').notEmpty().withMessage('Password is required.')
];

// Medicine Payload Rules
const medicineRules = [
  body('code').trim().notEmpty().escape().withMessage('Medicine code is required.'),
  body('name').trim().notEmpty().escape().withMessage('Medicine name is required.'),
  body('category').trim().notEmpty().escape().withMessage('Category is required.'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative integer.'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Unit price must be non-negative number.'),
  body('expiry_date').isISO8601().toDate().withMessage('Valid expiry date required (YYYY-MM-DD).')
];

// Supplier Rules
const supplierRules = [
  body('name').trim().notEmpty().escape().withMessage('Supplier company name required.'),
  body('email').optional().trim().isEmail().withMessage('Valid email required.')
];

// Transaction Rules
const transactionRules = [
  body('transaction_type').isIn(['PURCHASE', 'SALE']).withMessage('Type must be PURCHASE or SALE.'),
  body('medicine_id').isInt({ min: 1 }).withMessage('Valid medicine ID required.'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.')
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  medicineRules,
  supplierRules,
  transactionRules
};
