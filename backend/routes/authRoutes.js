const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/security');
const { validate, registerRules, loginRules } = require('../middleware/validate');

/**
 * Authentication Routes Module
 * File: backend/routes/authRoutes.js
 * 
 * Functions:
 * 1. POST /api/auth/register - Register a new user with input validation (escape, length, role check)
 * 2. POST /api/auth/login    - Secure login with rate limiting (10 attempts/15min) and 5-attempt account lockout
 * 3. GET  /api/auth/me       - Retrieve current authenticated user profile using Bearer JWT
 */

// @route   POST /api/auth/register
// @desc    Register a new user (Admin, Staff, or Auditor)
// @access  Public
router.post('/register', registerRules, validate, authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & return JWT token
// @access  Public (Rate-limited)
router.post('/login', loginLimiter, loginRules, validate, authController.login);

// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
// @access  Private (JWT Protected)
router.get('/me', verifyToken, authController.getProfile);

module.exports = router;
