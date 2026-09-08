import React from 'react';
import { 
  LayoutDashboard, 
  Pill, 
  Truck, 
  ArrowLeftRight, 
  ShieldAlert, 
  LogOut, 
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Staff', 'Auditor'] },
    { id: 'inventory', label: 'Drug Inventory', icon: Pill, roles: ['Admin', 'Staff', 'Auditor'] },
    { id: 'suppliers', label: 'Suppliers', icon: Truck, roles: ['Admin', 'Staff', 'Auditor'] },
    { id: 'transactions', label: 'Sales & Purchases', icon: ArrowLeftRight, roles: ['Admin', 'Staff', 'Auditor'] },
    { id: 'audit', label: 'Audit & Security', icon: ShieldAlert, roles: ['Admin', 'Auditor'] }
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary-500), var(--accent-teal))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
        }}>
          <ShieldCheck size={24} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
            TROPICAL VET
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Supply Chain Sec
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems
          .filter(item => item.roles.includes(user?.role))
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: isActive ? 'var(--primary-200)' : 'var(--text-secondary)',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  borderLeft: isActive ? '3px solid var(--primary-500)' : '3px solid transparent'
                }}
              >
                <Icon size={19} color={isActive ? 'var(--primary-500)' : 'currentColor'} />
                {item.label}
              </button>
            );
          })}
      </nav>

      {/* User Session Info & Logout */}
      <div style={{
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: 'var(--primary-500)'
          }}>
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.username || 'User'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Role: <span style={{ color: 'var(--primary-500)', fontWeight: '600' }}>{user?.role}</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
