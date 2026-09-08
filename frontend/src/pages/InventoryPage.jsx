import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Building2
} from 'lucide-react';
import { api } from '../api/client';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const InventoryPage = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [alertStatus, setAlertStatus] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Antibiotics',
    quantity: 50,
    unit_price: 10.00,
    expiry_date: '',
    reorder_level: 20,
    supplier_id: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadMedicines();
    loadSuppliers();
  }, [category, alertStatus]);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category) params.category = category;
      if (alertStatus) params.alert_status = alertStatus;
      if (search) params.search = search;

      const res = await api.inventory.getAll(params);
      if (res.success) {
        setMedicines(res.data);
      }
    } catch (err) {
      console.error('Failed to load medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await api.suppliers.getAll();
      if (res.success) {
        setSuppliers(res.data);
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMedicines();
  };

  const openAddModal = () => {
    setEditingMedicine(null);
    setFormData({
      code: `VET-${Date.now().toString().slice(-4)}`,
      name: '',
      category: 'Antibiotics',
      quantity: 50,
      unit_price: 15.00,
      expiry_date: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      reorder_level: 20,
      supplier_id: suppliers.length > 0 ? suppliers[0].id : ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (med) => {
    setEditingMedicine(med);
    setFormData({
      code: med.code,
      name: med.name,
      category: med.category,
      quantity: med.quantity,
      unit_price: med.unit_price,
      expiry_date: med.expiry_date ? med.expiry_date.split('T')[0] : '',
      reorder_level: med.reorder_level,
      supplier_id: med.supplier_id || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingMedicine) {
        await api.inventory.update(editingMedicine.id, formData);
      } else {
        await api.inventory.create(formData);
      }
      setIsModalOpen(false);
      loadMedicines();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete '${name}'? This action will be recorded in the security audit trail.`)) {
      try {
        await api.inventory.delete(id);
        loadMedicines();
      } catch (err) {
        alert(err.message || 'Failed to delete medicine.');
      }
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Pill size={28} color="var(--primary-500)" />
            Veterinary Drug Inventory
          </h1>
          <p className="page-subtitle">
            Manage animal pharmaceuticals, batch codes, expiration dates, and low-stock alerts.
          </p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Staff') && (
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} /> Add Medicine
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="form-input"
            placeholder="Search medicine name or SKU code (e.g. Penicillin, VET-ANT-001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <select 
          className="form-select" 
          style={{ width: 'auto', minWidth: '160px' }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Antibiotics">Antibiotics</option>
          <option value="Vaccines">Vaccines</option>
          <option value="Anti-parasitic">Anti-parasitic</option>
          <option value="Vitamins">Vitamins</option>
          <option value="Painkillers">Painkillers</option>
        </select>

        <select 
          className="form-select" 
          style={{ width: 'auto', minWidth: '160px' }}
          value={alertStatus}
          onChange={(e) => setAlertStatus(e.target.value)}
        >
          <option value="">All Alert Statuses</option>
          <option value="low_stock">⚠️ Low Stock Alerts</option>
          <option value="expiring">⏳ Expiring Soon (30 days)</option>
          <option value="expired">🚫 Expired Medicines</option>
        </select>

        <button onClick={loadMedicines} className="btn btn-secondary btn-sm">
          Apply Filter
        </button>
      </div>

      {/* Medicines Table */}
      <div className="card" style={{ padding: '0' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code / SKU</th>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Stock Quantity</th>
                <th>Unit Price</th>
                <th>Expiry Date</th>
                <th>Supplier</th>
                <th>Health Status</th>
                {(user?.role === 'Admin' || user?.role === 'Staff') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading medicines catalog...
                  </td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No medicines match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                medicines.map((med) => {
                  const isExpired = med.expiry_status === 'EXPIRED';
                  const isExpiring = med.expiry_status === 'EXPIRING_SOON';
                  const isLowStock = med.stock_status === 'LOW_STOCK';

                  return (
                    <tr key={med.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        {med.code}
                      </td>
                      <td>
                        <strong>{med.name}</strong>
                      </td>
                      <td>
                        <span className="badge badge-info">{med.category}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{med.quantity}</span>
                          {isLowStock && (
                            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                              Low (&le;{med.reorder_level})
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--primary-200)' }}>
                        ${parseFloat(med.unit_price).toFixed(2)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          <Calendar size={14} color={isExpired ? '#ef4444' : isExpiring ? '#f59e0b' : 'var(--text-muted)'} />
                          <span style={{ color: isExpired ? '#ef4444' : isExpiring ? '#f59e0b' : 'inherit' }}>
                            {med.expiry_date ? med.expiry_date.split('T')[0] : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {med.supplier_name || 'Direct Import'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {isExpired ? (
                            <span className="badge badge-danger">EXPIRED</span>
                          ) : isExpiring ? (
                            <span className="badge badge-warning">Expiring Soon</span>
                          ) : (
                            <span className="badge badge-success">Good</span>
                          )}
                        </div>
                      </td>
                      {(user?.role === 'Admin' || user?.role === 'Staff') && (
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => openEditModal(med)}
                              className="btn btn-secondary btn-sm"
                              title="Edit medicine"
                            >
                              <Edit size={14} />
                            </button>
                            {user?.role === 'Admin' && (
                              <button
                                onClick={() => handleDelete(med.id, med.name)}
                                className="btn btn-danger btn-sm"
                                title="Delete medicine (Admin only)"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMedicine ? `Edit Medicine: ${editingMedicine.name}` : 'Add New Veterinary Medicine'}
      >
        {formError && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">SKU Code</label>
              <input
                type="text"
                className="form-input"
                required
                disabled={!!editingMedicine}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="VET-ANT-003"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Medicine Name</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Amoxicillin 15% LA"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Antibiotics">Antibiotics</option>
                <option value="Vaccines">Vaccines</option>
                <option value="Anti-parasitic">Anti-parasitic</option>
                <option value="Vitamins">Vitamins</option>
                <option value="Painkillers">Painkillers</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Supplier Importer</label>
              <select
                className="form-select"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              >
                <option value="">-- Direct / Unassigned --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input
                type="number"
                min="0"
                className="form-input"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                required
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Level</label>
              <input
                type="number"
                min="1"
                className="form-input"
                required
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input
              type="date"
              className="form-input"
              required
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {editingMedicine ? 'Update Medicine' : 'Save to Inventory'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
