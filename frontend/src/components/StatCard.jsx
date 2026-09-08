import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'emerald', subtext, badge }) => {
  const colorMap = {
    emerald: {
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.2)'
    },
    blue: {
      bg: 'rgba(59, 130, 246, 0.15)',
      color: '#60a5fa',
      glow: 'rgba(59, 130, 246, 0.2)'
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.2)'
    },
    red: {
      bg: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.2)'
    },
    purple: {
      bg: 'rgba(139, 92, 246, 0.15)',
      color: '#a78bfa',
      glow: 'rgba(139, 92, 246, 0.2)'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="stat-card" style={{ '--glow-color': scheme.glow }}>
      <div 
        className="stat-icon" 
        style={{ backgroundColor: scheme.bg, color: scheme.color }}
      >
        <Icon size={24} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="stat-label">{title}</span>
          {badge && <span className={`badge ${badge.type}`}>{badge.text}</span>}
        </div>
        <div className="stat-value">{value}</div>
        {subtext && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
