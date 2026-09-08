const db = require('../config/db');

/**
 * Log user action to audit_logs table for non-repudiation tracking
 */
const logAudit = async ({
  userId = null,
  userEmail = 'Anonymous',
  userRole = 'Guest',
  action,
  resource,
  details = '',
  ipAddress = '127.0.0.1',
  userAgent = '',
  status = 'SUCCESS'
}) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, user_email, user_role, action, resource, details, ip_address, user_agent, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        userEmail,
        userRole,
        action,
        resource,
        details,
        ipAddress,
        userAgent,
        status
      ]
    );
  } catch (error) {
    console.error('Audit Log Error:', error.message);
  }
};

module.exports = logAudit;
