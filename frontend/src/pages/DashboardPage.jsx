import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  DollarSign, 
  AlertTriangle, 
  Calendar, 
  TrendingDown, 
  ShieldAlert, 
  Plus, 
  ArrowLeftRight,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { StatCard } from '../components/StatCard';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.inventory.getAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      }

      // If user has access to alerts, fetch unresolved security alerts
      if (user?.role === 'Admin' || user?.role === 'Auditor') {
        const alertsRes = await api.audit.getAlerts({ is_resolved: 'false' });
        if (alertsRes.success) {
          setSecurityAlerts(alertsRes.data.slice(0, 3));
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const summary = analytics?.summary || {
    total_medicines: 0,
    total_stock_units: 0,
    total_inventory_value: 0,
    low_stock_count: 0,
    expiring_count: 0,
    expired_count: 0
  };

  const predictions = analytics?.predicted_stockouts || [];

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Pill size={28} color="var(--primary-500)" />
            Clinical Inventory Dashboard
          </h1>
          <p className="page-subtitle">
            Tropical Veterinary Import & Distribution Operations Overview
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {(user?.role === 'Admin' || user?.role === 'Staff') && (
            <>
              <button 
                onClick={() => setActiveTab('transactions')} 
                className="btn btn-primary"
              >
                <ArrowLeftRight size={16} /> Record Transaction
              </button>
              <button 
                onClick={() => setActiveTab('inventory')} 
                className="btn btn-secondary"
              >
                <Plus size={16} /> Add Medicine
              </button>
            </>
          )}
        </div>
      </div>

      {/* Security Threat Alert Ribbon if threats exist */}
      {securityAlerts.length > 0 && (
        <div className="security-alert-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <ShieldAlert size={24} color="var(--status-danger)" />
            <div>
              <div style={{ fontWeight: '700', color: '#fca5a5', fontSize: '0.9rem' }}>
                Active Security Threat Alerts Detected ({securityAlerts.length})
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {securityAlerts[0].description}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('audit')} 
            className="btn btn-danger btn-sm"
          >
            Investigate in Audit Center
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid-stats">
        <StatCard
          title="Total Drug Catalog"
          value={summary.total_medicines}
          icon={Pill}
          color="emerald"
          subtext={`${summary.total_stock_units || 0} total units in stock`}
        />
        <StatCard
          title="Inventory Value"
          value={`$${parseFloat(summary.total_inventory_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="blue"
          subtext="Total capital valuation"
        />
        <StatCard
          title="Low Stock Alerts"
          value={summary.low_stock_count}
          icon={AlertTriangle}
          color="amber"
          badge={{ text: 'Reorder Needed', type: 'badge-warning' }}
        />
        <StatCard
          title="Expiring / Expired"
          value={`${summary.expiring_count} / ${summary.expired_count}`}
          icon={Calendar}
          color="red"
          badge={{ text: 'Bio-Safety Alert', type: 'badge-danger' }}
        />
      </div>

      {/* Main Content Grid: Predictive Stockout Engine & Quick Overview */}
      <div className="grid-two-col">
        {/* Predictive AI Forecasting Card */}
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--primary-500)" />
              Predictive Stockout & Burn-Rate Forecast
            </span>
            <span className="badge badge-success">Automated Velocity Model</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Calculates 30-day historical consumption velocity to project the exact number of days before medicine supplies are depleted.
          </p>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Drug Name</th>
                  <th>Current Stock</th>
                  <th>Daily Burn</th>
                  <th>Estimated Depletion</th>
                  <th>Urgency Status</th>
                </tr>
              </thead>
              <tbody>
                {predictions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      All medicine inventories are healthy with no imminent stockout risks.
                    </td>
                  </tr>
                ) : (
                  predictions.map((p) => {
                    const days = parseFloat(p.estimated_days_until_stockout);
                    let badgeClass = 'badge-success';
                    let statusLabel = 'Adequate';

                    if (days <= 7 || p.quantity === 0) {
                      badgeClass = 'badge-danger';
                      statusLabel = 'Critical Stockout';
                    } else if (days <= 20 || p.quantity <= p.reorder_level) {
                      badgeClass = 'badge-warning';
                      statusLabel = 'Low Supply';
                    }

                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.code}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '600' }}>{p.quantity} units</span>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Threshold: {p.reorder_level}</div>
                        </td>
                        <td>{p.daily_burn_rate} / day</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                          {days === 999 ? 'No recent sales' : `~${days} days`}
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`}>{statusLabel}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & System Integrity Health Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="var(--primary-500)" />
                Security Integrity
              </span>
              <span className="badge badge-info">Hardened Defense</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>5-Attempt Lockout Defense</span>
                <span className="badge badge-success">Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Parameterized SQL Protection</span>
                <span className="badge badge-success">Enforced</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rapid Intrusion Filter (&lt;150ms)</span>
                <span className="badge badge-success">Monitoring</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Transaction Stock Isolation</span>
                <span className="badge badge-success">Atomic FOR UPDATE</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-200)' }}>
              Logged in as {user?.username} ({user?.role})
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              All actions are stamped with your user ID and IP address into immutable audit logs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
