const db = require('../config/db');

/**
 * Get Audit Trail Logs
 * Route: GET /api/audit/logs
 * Access: Admin, Auditor
 */
const getAuditLogs = async (req, res) => {
  try {
    const { action, status, search, limit = 100 } = req.query;

    let queryText = `
      SELECT a.*, u.username
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      params.push(action);
      queryText += ` AND a.action = $${params.length}`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND a.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (a.user_email ILIKE $${params.length} OR a.details ILIKE $${params.length} OR a.resource ILIKE $${params.length})`;
    }

    params.push(parseInt(limit));
    queryText += ` ORDER BY a.timestamp DESC LIMIT $${params.length}`;

    const result = await db.query(queryText, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Fetch Audit Logs Error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving security audit logs.' });
  }
};

/**
 * Get Security Intrusion Alerts
 * Route: GET /api/audit/alerts
 * Access: Admin, Auditor
 */
const getSecurityAlerts = async (req, res) => {
  try {
    const { is_resolved } = req.query;

    let queryText = `
      SELECT s.*, u.username, u.email
      FROM security_alerts s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (is_resolved !== undefined) {
      params.push(is_resolved === 'true');
      queryText += ` AND s.is_resolved = $${params.length}`;
    }

    queryText += ` ORDER BY s.created_at DESC LIMIT 100`;

    const result = await db.query(queryText, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching security alerts.' });
  }
};

/**
 * Resolve Security Alert
 * Route: PUT /api/audit/alerts/:id/resolve
 * Access: Admin, Auditor
 */
const resolveSecurityAlert = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `UPDATE security_alerts SET is_resolved = TRUE WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Security alert not found.' });
    }

    res.json({
      success: true,
      message: 'Security alert marked as resolved.',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resolving alert.' });
  }
};

module.exports = {
  getAuditLogs,
  getSecurityAlerts,
  resolveSecurityAlert
};
