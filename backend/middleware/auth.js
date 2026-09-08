const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Middleware: Verify Bearer JWT Token
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Missing or malformed authentication token.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is missing.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tropical_vet_secret');

    // Attach decoded user identity to request object
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid token signature. Authentication failed.'
    });
  }
};

/**
 * Middleware: Role-Based Access Control (RBAC)
 * Allowed Roles: 'Admin', 'Staff', 'Auditor'
 */
const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Unidentified user identity.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Log privilege escalation attempt to security_alerts
      const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      try {
        await db.query(
          `INSERT INTO security_alerts (alert_type, severity, description, user_id, ip_address)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            'UNAUTHORIZED_ACCESS_ATTEMPT',
            'HIGH',
            `User ${req.user.email} (${req.user.role}) attempted unauthorized access to: ${req.method} ${req.originalUrl}`,
            req.user.id,
            clientIp
          ]
        );
      } catch (logErr) {
        console.error('Failed to record security violation alert:', logErr);
      }

      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized for this action.`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
