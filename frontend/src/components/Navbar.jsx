import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'rgba(9, 14, 26, 0.7)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Organization: <strong style={{ color: 'var(--text-primary)' }}>Tropical Veterinary Importers PLC</strong>
        </span>
        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
          Enterprise Security Active
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
          <Clock size={14} />
          {time}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${
            user?.role === 'Admin' ? 'badge-danger' : user?.role === 'Staff' ? 'badge-info' : 'badge-purple'
          }`}>
            {user?.role || 'Guest'}
          </span>
        </div>
      </div>
    </header>
  );
};
