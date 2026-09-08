const db = require('../config/db');
const logAudit = require('../middleware/auditLogger');

/**
 * Get All Suppliers
 * Route: GET /api/suppliers
 */
const getAllSuppliers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, COUNT(m.id) AS total_supplied_medicines
       FROM suppliers s
       LEFT JOIN medicines m ON s.id = m.supplier_id
       GROUP BY s.id
       ORDER BY s.name ASC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Fetch Suppliers Error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving suppliers list.' });
  }
};

/**
 * Create Supplier
 * Route: POST /api/suppliers
 * Access: Admin, Staff
 */
const createSupplier = async (req, res) => {
  const { name, contact_person, phone, email, address } = req.body;
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  try {
    const result = await db.query(
      `INSERT INTO suppliers (name, contact_person, phone, email, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, contact_person || null, phone || null, email || null, address || null]
    );

    const newSupplier = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'SUPPLIER_CREATE',
      resource: `/api/suppliers/${newSupplier.id}`,
      details: `Added new supplier: ${name}`,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'Supplier registered successfully.',
      data: newSupplier
    });
  } catch (error) {
    console.error('Create Supplier Error:', error);
    res.status(500).json({ success: false, message: 'Server error creating supplier.' });
  }
};

/**
 * Update Supplier
 * Route: PUT /api/suppliers/:id
 * Access: Admin, Staff
 */
const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { name, contact_person, phone, email, address } = req.body;

  try {
    const check = await db.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }

    const old = check.rows[0];
    const result = await db.query(
      `UPDATE suppliers
       SET name = $1, contact_person = $2, phone = $3, email = $4, address = $5
       WHERE id = $6
       RETURNING *`,
      [
        name || old.name,
        contact_person !== undefined ? contact_person : old.contact_person,
        phone !== undefined ? phone : old.phone,
        email !== undefined ? email : old.email,
        address !== undefined ? address : old.address,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Supplier details updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating supplier.' });
  }
};

/**
 * Delete Supplier
 * Route: DELETE /api/suppliers/:id
 * Access: Admin ONLY
 */
const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    const check = await db.query('SELECT name FROM suppliers WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }

    await db.query('DELETE FROM suppliers WHERE id = $1', [id]);

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'SUPPLIER_DELETE',
      resource: `/api/suppliers/${id}`,
      details: `Deleted supplier: ${check.rows[0].name}`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, message: 'Supplier removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting supplier.' });
  }
};

module.exports = {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
