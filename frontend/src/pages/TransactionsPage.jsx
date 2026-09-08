import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  ShieldAlert, 
  Calendar, 
  DollarSign, 
  Pill, 
  User,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const TransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterAnomalous, setFilterAnomalous] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    transaction_type: 'SALE',
    medicine_id: '',
    quantity: 10,
    notes: ''
  });
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTransactions();
    loadMedicines();
  }, [filterType, filterAnomalous]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType) params.type = filterType;
      if (filterAnomalous) params.is_anomalous = filterAnomalous;

      const res = await api.transactions.getAll(params);
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMedicines = async () => {
    try {
      const res = await api.inventory.getAll();
      if (res.success) {
        setMedicines(res.data);
        if (res.data.length > 0 && !formData.medicine_id) {
          setFormData(prev => ({ ...prev, medicine_id: res.data[0].id }));
          setSelectedMedicine(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load medicines:', err);
    }
  };

  const handleMedicineChange = (e) => {
    const medId = parseInt(e.target.value);
    const med = medicines.find(m => m.id === medId);
    setFormData({ ...formData, medicine_id: medId });
    setSelectedMedicine(med || null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await api.transactions.record(formData);
      setIsModalOpen(false);
      loadTransactions();
      loadMedicines(); // Refresh inventory stock levels
    } catch (err) {
      setFormError(err.message || 'Transaction execution failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedTotal = selectedMedicine
    ? (parseFloat(selectedMedicine.unit_price) * (parseInt(formData.quantity) || 0)).toFixed(2)
    : '0.00';

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ArrowLeftRight size={28} color="var(--primary-500)" />
            Sales & Purchases Log
          </h1>
          <p className="page-subtitle">
            Audited stock ledger with automated balance adjustments and high-volume anomaly detection.
          </p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Staff') && (
          <button 
            onClick={() => {
              setFormError('');
              setIsModalOpen(true);
            }} 
            className="btn btn-primary"
          >
            <Plus size={18} /> Record New Transaction
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="filter-bar card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Transaction Types</option>
          <option value="SALE">Outgoing Sales</option>
          <option value="PURCHASE">Incoming Purchases (Restock)</option>
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={filterAnomalous}
          onChange={(e) => setFilterAnomalous(e.target.value)}
        >
          <option value="">All Anomaly Statuses</option>
          <option value="true">⚠️ High-Volume Anomalies Only</option>
        </select>

        <button onClick={loadTransactions} className="btn btn-secondary btn-sm">
          Refresh Ledger
        </button>
      </div>

      {/* Transactions Table */}
      <div className="card" style={{ padding: '0' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Medicine / SKU</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Logged By</th>
                <th>Timestamp</th>
                <th>Notes / Destination</th>
                <th>Security Flag</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading transaction records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No transactions recorded matching the selected filter.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isSale = tx.transaction_type === 'SALE';
                  return (
                    <tr key={tx.id}>
                      <td>
                        <span className={`badge ${isSale ? 'badge-success' : 'badge-info'}`}>
                          {isSale ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td>
                        <strong>{tx.medicine_name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.medicine_code}</div>
                      </td>
                      <td style={{ fontWeight: '700' }}>
                        {isSale ? `-${tx.quantity}` : `+${tx.quantity}`}
                      </td>
                      <td>${parseFloat(tx.unit_price).toFixed(2)}</td>
                      <td style={{ fontWeight: '700', color: 'var(--primary-200)', fontFamily: 'var(--font-mono)' }}>
                        ${parseFloat(tx.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                          <User size={13} />
                          {tx.performed_by_username || 'System Admin'}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(tx.transaction_date).toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {tx.notes || '—'}
                      </td>
                      <td>
                        {tx.is_anomalous ? (
                          <span className="badge badge-danger">
                            <ShieldAlert size={12} /> High-Volume Anomaly
                          </span>
                        ) : (
                          <span className="badge badge-success" style={{ opacity: 0.8 }}>
                            Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Inventory Transaction"
      >
        {formError && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <div>{formError}</div>
          </div>
        )}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <select
              className="form-select"
              value={formData.transaction_type}
              onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
            >
              <option value="SALE">SALE (Dispense / Outgoing Distribution)</option>
              <option value="PURCHASE">PURCHASE (Restock / Import Batch)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Medicine</label>
            <select
              className="form-select"
              required
              value={formData.medicine_id}
              onChange={handleMedicineChange}
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code}) — Current Stock: {m.quantity} | Unit: ${parseFloat(m.unit_price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                className="form-input"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Calculated Total ($ USD)</label>
              <input
                type="text"
                className="form-input"
                disabled
                value={`$${calculatedTotal}`}
                style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--primary-200)' }}
              />
            </div>
          </div>

          {parseInt(formData.quantity) >= 100 && formData.transaction_type === 'SALE' && (
            <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={16} />
              <span>Note: Sales &ge; 100 units trigger an automated high-volume anomaly alert.</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Reference Notes / Destination Clinic</label>
            <textarea
              rows="2"
              className="form-textarea"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Dispatched to Pastoral Veterinary Clinic, Batch #TX-891"
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
              disabled={submitting}
            >
              {submitting ? 'Executing Atomic Transaction...' : 'Commit Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
