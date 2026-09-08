const db = require('../config/db');
const logAudit = require('../middleware/auditLogger');

/**
 * Get All Transactions History with Filtering
 * Route: GET /api/transactions
 */
const getAllTransactions = async (req, res) => {
  try {
    const { type, is_anomalous } = req.query;

    let queryText = `
      SELECT t.*, m.name AS medicine_name, m.code AS medicine_code, u.username AS performed_by_username
      FROM transactions t
      JOIN medicines m ON t.medicine_id = m.id
      LEFT JOIN users u ON t.performed_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      params.push(type.toUpperCase());
      queryText += ` AND t.transaction_type = $${params.length}`;
    }

    if (is_anomalous === 'true') {
      queryText += ` AND t.is_anomalous = TRUE`;
    }

    queryText += ` ORDER BY t.transaction_date DESC LIMIT 100`;

    const result = await db.query(queryText, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Fetch Transactions Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving transaction logs.' });
  }
};

/**
 * Record New Transaction (PURCHASE or SALE) with Atomic DB Isolation & Anomaly Detection
 * Route: POST /api/transactions
 * Access: Admin, Staff
 */
const recordTransaction = async (req, res) => {
  const { transaction_type, medicine_id, quantity, notes } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const client = await db.getClient();

  try {
    // Start Atomic Transaction
    await client.query('BEGIN');

    // Fetch medicine details and lock row for update
    const medResult = await client.query(
      'SELECT id, name, code, quantity, unit_price FROM medicines WHERE id = $1 FOR UPDATE',
      [medicine_id]
    );

    if (medResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Selected medicine does not exist.' });
    }

    const medicine = medResult.rows[0];
    const unitPrice = parseFloat(medicine.unit_price);
    const totalPrice = unitPrice * parseInt(quantity);
    let isAnomalous = false;

    // Validate stock availability for Sales
    if (transaction_type === 'SALE') {
      if (medicine.quantity < quantity) {
        await client.query('ROLLBACK');

        await logAudit({
          userId: req.user.id,
          userEmail: req.user.email,
          userRole: req.user.role,
          action: 'TRANSACTION_DENIED_INSUFFICIENT_STOCK',
          resource: '/api/transactions',
          details: `Attempted to sell ${quantity} units of ${medicine.name}, but stock was only ${medicine.quantity}`,
          ipAddress: clientIp,
          status: 'WARNING'
        });

        return res.status(400).json({
          success: false,
          message: `Insufficient stock! Remaining stock for ${medicine.name} is ${medicine.quantity} units.`
        });
      }

      // Anomaly Detection Rule: Sale quantity >= 100 OR Total Price >= 5,000 USD
      if (quantity >= 100 || totalPrice >= 5000) {
        isAnomalous = true;
        await client.query(
          `INSERT INTO security_alerts (alert_type, severity, description, user_id, ip_address)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            'HIGH_VOLUME_SALE_ANOMALY',
            'HIGH',
            `Anomalous high-volume sale recorded: ${quantity} units of ${medicine.name} ($${totalPrice.toFixed(2)}) by ${req.user.email}`,
            req.user.id,
            clientIp
          ]
        );
      }
    }

    // Update stock count in medicines table
    const newStock = transaction_type === 'PURCHASE'
      ? medicine.quantity + parseInt(quantity)
      : medicine.quantity - parseInt(quantity);

    await client.query(
      'UPDATE medicines SET quantity = $1 WHERE id = $2',
      [newStock, medicine.id]
    );

    // Record transaction entry
    const transResult = await client.query(
      `INSERT INTO transactions (transaction_type, medicine_id, quantity, unit_price, total_price, performed_by, notes, is_anomalous)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [transaction_type, medicine_id, quantity, unitPrice, totalPrice, req.user.id, notes || '', isAnomalous]
    );

    // Commit Transaction
    await client.query('COMMIT');

    const transaction = transResult.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: `TRANSACTION_${transaction_type}`,
      resource: `/api/transactions/${transaction.id}`,
      details: `Recorded ${transaction_type} of ${quantity} units of ${medicine.name} (Total: $${totalPrice.toFixed(2)}). New Stock: ${newStock}`,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: `${transaction_type} recorded successfully. Updated stock level: ${newStock}`,
      data: {
        ...transaction,
        medicine_name: medicine.name,
        new_stock_level: newStock
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction Error:', error);
    res.status(500).json({ success: false, message: 'Transaction failed and database changes were rolled back.' });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllTransactions,
  recordTransaction
};
