import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('vet_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vet_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate current token session on startup
    const checkAuth = async () => {
      if (token) {
        try {
          const profile = await api.auth.getProfile();
          setUser(profile.data);
          localStorage.setItem('vet_user', JSON.stringify(profile.data));
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('vet_token', res.data.token);
      localStorage.setItem('vet_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const register = async (userData) => {
    return await api.auth.register(userData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vet_token');
    localStorage.removeItem('vet_user');
  };

  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
