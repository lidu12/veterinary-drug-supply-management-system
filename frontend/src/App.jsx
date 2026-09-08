import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

const MainApp = () => {
  const { user, token, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-secondary)'
      }}>
        Initializing Security Environment...
      </div>
    );
  }

  // If not logged in, show Auth screens
  if (!token || !user) {
    return authView === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // Render Authenticated Shell
  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Navbar />
        <main style={{ flex: 1 }}>
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'inventory' && <InventoryPage />}
          {activeTab === 'suppliers' && <SuppliersPage />}
          {activeTab === 'transactions' && <TransactionsPage />}
          {activeTab === 'audit' && (
            user?.role === 'Admin' || user?.role === 'Auditor' ? (
              <AuditLogsPage />
            ) : (
              <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Access Restricted</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Your role ({user?.role}) does not have clearance to view audit and security logs.
                </p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
