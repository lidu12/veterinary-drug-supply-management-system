import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Building2,
  Pill
} from 'lucide-react';
import { api } from '../api/client';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const SuppliersPage = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.suppliers.getAll();
      if (res.success) {
        setSuppliers(res.data);
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      if (editingSupplier) {
        await api.suppliers.update(editingSupplier.id, formData);
      } else {
        await api.suppliers.create(formData);
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete supplier '${name}'?`)) {
      try {
        await api.suppliers.delete(id);
        loadSuppliers();
      } catch (err) {
        alert(err.message || 'Failed to delete supplier.');
      }
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Truck size={28} color="var(--primary-500)" />
            Pharmaceutical Supplier Management
          </h1>
          <p className="page-subtitle">
            Directory of international & local pharmaceutical manufacturers importing veterinary medicines.
          </p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Staff') && (
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} /> Register Supplier
          </button>
        )}
      </div>

      {/* Supplier Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading supplier companies...
          </div>
        ) : suppliers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No suppliers registered in the system yet.
          </div>
        ) : (
          suppliers.map((s) => (
            <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {s.name}
                    </h3>
                    <span className="badge badge-info" style={{ marginTop: '0.4rem' }}>
                      <Pill size={12} /> {s.total_supplied_medicines || 0} Medicines Supplied
                    </span>
                  </div>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa'
                  }}>
                    <Building2 size={20} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1.25rem' }}>
                  {s.contact_person && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={15} color="var(--primary-500)" />
                      <span>{s.contact_person}</span>
                    </div>
                  )}
                  {s.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={15} color="var(--primary-500)" />
                      <span>{s.email}</span>
                    </div>
                  )}
                  {s.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={15} color="var(--primary-500)" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <MapPin size={15} color="var(--primary-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{s.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {(user?.role === 'Admin' || user?.role === 'Staff') && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => openEditModal(s)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  {user?.role === 'Admin' && (
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Register New Import Supplier'}
      >
        {formError && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. AgriMed Global Solutions"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                className="form-input"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Dr. Samuel Vance"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+251-911-234567"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="orders@agrimed.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Headquarters / Warehouse Address</label>
            <textarea
              rows="3"
              className="form-textarea"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Bole Sub-city, Addis Ababa, Ethiopia"
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
              {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
