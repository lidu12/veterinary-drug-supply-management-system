import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Lock, 
  Terminal, 
  Eye, 
  Activity,
  Globe
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const AuditLogsPage = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('alerts'); // 'alerts' or 'logs'
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter logs
  const [logSearch, setLogSearch] = useState('');
  const [logAction, setLogAction] = useState('');
  const [alertFilter, setAlertFilter] = useState('');

  useEffect(() => {
    if (activeSubTab === 'alerts') {
      loadAlerts();
    } else {
      loadLogs();
    }
  }, [activeSubTab, logAction, alertFilter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (alertFilter) params.is_resolved = alertFilter;
      const res = await api.audit.getAlerts(params);
      if (res.success) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.error('Failed to load security alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (logAction) params.action = logAction;
      if (logSearch) params.search = logSearch;
      const res = await api.audit.getLogs(params);
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await api.audit.resolveAlert(id);
      loadAlerts();
    } catch (err) {
      alert(err.message || 'Failed to resolve alert.');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShieldAlert size={28} color="var(--primary-500)" />
            Security & Audit Compliance Center
          </h1>
          <p className="page-subtitle">
            Enterprise non-repudiation audit trails, intrusion detection, and anomaly response center.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveSubTab('alerts')}
            className={`btn ${activeSubTab === 'alerts' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ShieldAlert size={16} /> Security Alerts ({alerts.filter(a => !a.is_resolved).length})
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`btn ${activeSubTab === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Terminal size={16} /> Full Audit Trail
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Security Alerts & Intrusion Detection */}
      {activeSubTab === 'alerts' && (
        <>
          <div className="filter-bar card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '180px' }}
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
            >
              <option value="">All Alerts (Resolved & Active)</option>
              <option value="false">🚨 Active Threat Alerts Only</option>
              <option value="true">✅ Resolved Alerts</option>
            </select>
            <button onClick={loadAlerts} className="btn btn-secondary btn-sm">
              Refresh Alerts
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Scanning security logs...
              </div>
            ) : alerts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={48} color="var(--primary-500)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                <h3>No Security Alerts Found</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  No security threats or anomalous intrusions currently detected.
                </p>
              </div>
            ) : (
              alerts.map((alertItem) => {
                const isCritical = alertItem.severity === 'CRITICAL' || alertItem.severity === 'HIGH';
                return (
                  <div
                    key={alertItem.id}
                    className="card"
                    style={{
                      borderLeft: `4px solid ${
                        alertItem.is_resolved
                          ? 'var(--status-success)'
                          : isCritical
                          ? 'var(--status-danger)'
                          : 'var(--status-warning)'
                      }`,
                      background: alertItem.is_resolved ? 'var(--bg-card)' : 'rgba(239, 68, 68, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <span className={`badge ${
                            alertItem.severity === 'HIGH' || alertItem.severity === 'CRITICAL'
                              ? 'badge-danger'
                              : alertItem.severity === 'MEDIUM'
                              ? 'badge-warning'
                              : 'badge-info'
                          }`}>
                            {alertItem.severity} SEVERITY
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            TYPE: {alertItem.alert_type}
                          </span>
                          {alertItem.is_resolved ? (
                            <span className="badge badge-success">Resolved</span>
                          ) : (
                            <span className="badge badge-danger">Unresolved</span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                          {alertItem.description}
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Globe size={13} /> IP: {alertItem.ip_address || '127.0.0.1'}
                          </div>
                          <div>
                            Detected at: {new Date(alertItem.created_at).toLocaleString()}
                          </div>
                          {alertItem.email && (
                            <div>Associated Account: <strong style={{ color: 'var(--text-secondary)' }}>{alertItem.email}</strong></div>
                          )}
                        </div>
                      </div>

                      {!alertItem.is_resolved && (
                        <button
                          onClick={() => handleResolveAlert(alertItem.id)}
                          className="btn btn-sm btn-primary"
                        >
                          <CheckCircle size={14} /> Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Sub-tab 2: Non-Repudiation Audit Trail Logs */}
      {activeSubTab === 'logs' && (
        <>
          <div className="filter-bar card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                className="form-input"
                placeholder="Search audit trail by user email, resource, or details..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '180px' }}
              value={logAction}
              onChange={(e) => setLogAction(e.target.value)}
            >
              <option value="">All Audit Actions</option>
              <option value="AUTH_LOGIN">AUTH_LOGIN</option>
              <option value="AUTH_LOGIN_FAILED">AUTH_LOGIN_FAILED</option>
              <option value="AUTH_ACCOUNT_LOCKED">AUTH_ACCOUNT_LOCKED</option>
              <option value="MEDICINE_CREATE">MEDICINE_CREATE</option>
              <option value="MEDICINE_UPDATE">MEDICINE_UPDATE</option>
              <option value="MEDICINE_DELETE">MEDICINE_DELETE</option>
              <option value="TRANSACTION_SALE">TRANSACTION_SALE</option>
              <option value="TRANSACTION_PURCHASE">TRANSACTION_PURCHASE</option>
            </select>

            <button onClick={loadLogs} className="btn btn-secondary btn-sm">
              Filter Trail
            </button>
          </div>

          <div className="card" style={{ padding: '0' }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>User / Role</th>
                    <th>Resource Target</th>
                    <th>Details & Description</th>
                    <th>IP Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Loading audit trail logs...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No audit records found.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{log.user_email || 'Anonymous'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Role: {log.user_role}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {log.resource}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{log.details}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {log.ip_address}
                        </td>
                        <td>
                          <span className={`badge ${
                            log.status === 'SUCCESS' ? 'badge-success' : log.status === 'BLOCKED' ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
