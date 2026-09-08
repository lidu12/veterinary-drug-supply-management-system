const db = require('../config/db');
const logAudit = require('../middleware/auditLogger');

/**
 * Get All Medicines with Supplier Info, Expiry Badges, and Low-Stock Badges
 * Route: GET /api/inventory
 * Access: Admin, Staff, Auditor
 */
const getAllMedicines = async (req, res) => {
  try {
    const { category, search, alert_status } = req.query;

    let queryText = `
      SELECT m.*, s.name AS supplier_name,
        CASE
          WHEN m.expiry_date < CURRENT_DATE THEN 'EXPIRED'
          WHEN m.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'EXPIRING_SOON'
          ELSE 'GOOD'
        END AS expiry_status,
        CASE
          WHEN m.quantity <= m.reorder_level THEN 'LOW_STOCK'
          ELSE 'NORMAL'
        END AS stock_status
      FROM medicines m
      LEFT JOIN suppliers s ON m.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category);
      queryText += ` AND m.category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      queryText += ` AND (m.name ILIKE $${params.length} OR m.code ILIKE $${params.length})`;
    }

    if (alert_status === 'low_stock') {
      queryText += ` AND m.quantity <= m.reorder_level`;
    } else if (alert_status === 'expiring') {
      queryText += ` AND m.expiry_date <= CURRENT_DATE + INTERVAL '30 days'`;
    } else if (alert_status === 'expired') {
      queryText += ` AND m.expiry_date < CURRENT_DATE`;
    }

    queryText += ` ORDER BY m.id DESC`;

    const result = await db.query(queryText, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Fetch Inventory Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving inventory items.' });
  }
};

/**
 * Get Single Medicine Details
 * Route: GET /api/inventory/:id
 */
const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT m.*, s.name AS supplier_name, s.email AS supplier_email
       FROM medicines m
       LEFT JOIN suppliers s ON m.supplier_id = s.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching medicine details.' });
  }
};

/**
 * Create New Medicine Record
 * Route: POST /api/inventory
 * Access: Admin, Staff
 */
const createMedicine = async (req, res) => {
  const { code, name, category, quantity, unit_price, expiry_date, reorder_level, supplier_id } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  try {
    // Uniqueness check for medicine SKU code
    const codeCheck = await db.query('SELECT id FROM medicines WHERE code = $1', [code]);
    if (codeCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Medicine product code already exists.' });
    }

    const result = await db.query(
      `INSERT INTO medicines (code, name, category, quantity, unit_price, expiry_date, reorder_level, supplier_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [code, name, category, quantity, unit_price, expiry_date, reorder_level || 20, supplier_id || null]
    );

    const newMedicine = result.rows[0];

    // Non-Repudiation Audit Log
    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'MEDICINE_CREATE',
      resource: `/api/inventory/${newMedicine.id}`,
      details: `Added new medicine: ${newMedicine.name} (${newMedicine.code}), Stock: ${newMedicine.quantity}`,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'Medicine item added successfully.',
      data: newMedicine
    });
  } catch (error) {
    console.error('Create Medicine Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating medicine.' });
  }
};

/**
 * Update Medicine Record
 * Route: PUT /api/inventory/:id
 * Access: Admin, Staff
 */
const updateMedicine = async (req, res) => {
  const { id } = req.params;
  const { name, category, quantity, unit_price, expiry_date, reorder_level, supplier_id } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  try {
    const check = await db.query('SELECT * FROM medicines WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    const oldData = check.rows[0];

    const result = await db.query(
      `UPDATE medicines
       SET name = $1, category = $2, quantity = $3, unit_price = $4, expiry_date = $5, reorder_level = $6, supplier_id = $7
       WHERE id = $8
       RETURNING *`,
      [
        name || oldData.name,
        category || oldData.category,
        quantity !== undefined ? quantity : oldData.quantity,
        unit_price !== undefined ? unit_price : oldData.unit_price,
        expiry_date || oldData.expiry_date,
        reorder_level !== undefined ? reorder_level : oldData.reorder_level,
        supplier_id !== undefined ? supplier_id : oldData.supplier_id,
        id
      ]
    );

    const updated = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'MEDICINE_UPDATE',
      resource: `/api/inventory/${id}`,
      details: `Updated medicine ${updated.name}. Stock changed from ${oldData.quantity} to ${updated.quantity}`,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Medicine updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('Update Medicine Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating medicine.' });
  }
};

/**
 * Delete Medicine Record
 * Route: DELETE /api/inventory/:id
 * Access: Admin ONLY
 */
const deleteMedicine = async (req, res) => {
  const { id } = req.params;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  try {
    const check = await db.query('SELECT name, code FROM medicines WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    const medName = check.rows[0].name;

    await db.query('DELETE FROM medicines WHERE id = $1', [id]);

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'MEDICINE_DELETE',
      resource: `/api/inventory/${id}`,
      details: `Deleted medicine record: ${medName} (ID: ${id})`,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: `Medicine '${medName}' deleted successfully.`
    });
  } catch (error) {
    console.error('Delete Medicine Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting medicine.' });
  }
};

/**
 * Predictive Low Stock & Expiry Forecasting Analytics
 * Route: GET /api/inventory/analytics/predictive
 * Access: Admin, Staff, Auditor
 */
const getPredictiveAnalytics = async (req, res) => {
  try {
    // 1. Calculate 30-day sales velocity and estimate stockout dates
    const velocityResult = await db.query(`
      SELECT 
        m.id, m.code, m.name, m.category, m.quantity, m.reorder_level,
        COALESCE(SUM(t.quantity), 0) AS total_sold_30_days,
        ROUND(COALESCE(SUM(t.quantity), 0) / 30.0, 2) AS daily_burn_rate,
        CASE 
          WHEN COALESCE(SUM(t.quantity), 0) > 0 
          THEN ROUND(m.quantity / (SUM(t.quantity) / 30.0), 1)
          ELSE 999 
        END AS estimated_days_until_stockout
      FROM medicines m
      LEFT JOIN transactions t ON m.id = t.medicine_id 
        AND t.transaction_type = 'SALE'
        AND t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY m.id, m.code, m.name, m.category, m.quantity, m.reorder_level
      HAVING m.quantity <= m.reorder_level OR (COALESCE(SUM(t.quantity), 0) > 0 AND (m.quantity / (SUM(t.quantity) / 30.0)) <= 30)
      ORDER BY estimated_days_until_stockout ASC
      LIMIT 10
    `);

    // 2. Summary Counters
    const countsResult = await db.query(`
      SELECT 
        COUNT(*) AS total_medicines,
        SUM(quantity) AS total_stock_units,
        SUM(quantity * unit_price) AS total_inventory_value,
        COUNT(CASE WHEN quantity <= reorder_level THEN 1 END) AS low_stock_count,
        COUNT(CASE WHEN expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND expiry_date >= CURRENT_DATE THEN 1 END) AS expiring_count,
        COUNT(CASE WHEN expiry_date < CURRENT_DATE THEN 1 END) AS expired_count
      FROM medicines
    `);

    res.json({
      success: true,
      data: {
        summary: countsResult.rows[0],
        predicted_stockouts: velocityResult.rows
      }
    });
  } catch (error) {
    console.error('Predictive Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Error generating inventory forecasts.' });
  }
};

module.exports = {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getPredictiveAnalytics
};
