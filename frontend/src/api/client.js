/**
 * API Client & Network Service
 * File: frontend/src/api/client.js
 * 
 * Function:
 * Centralized fetch client that automatically attaches the JWT Bearer token,
 * handles API responses and network errors, and provides method helpers
 * for Auth, Inventory, Suppliers, Transactions, and Security Audit trails.
 */

const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('vet_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // If token expired, clear storage
    if (response.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('vet_token');
      localStorage.removeItem('vet_user');
      window.location.href = '/login';
    }
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Authentication
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    getProfile: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Inventory Management
  inventory: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/inventory${query ? `?${query}` : ''}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/inventory/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getAnalytics: async () => {
      const res = await fetch(`${API_BASE}/inventory/analytics/predictive`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    create: async (medicineData) => {
      const res = await fetch(`${API_BASE}/inventory`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(medicineData)
      });
      return handleResponse(res);
    },
    update: async (id, updateData) => {
      const res = await fetch(`${API_BASE}/inventory/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/inventory/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Supplier Management
  suppliers: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/suppliers`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    create: async (supplierData) => {
      const res = await fetch(`${API_BASE}/suppliers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(supplierData)
      });
      return handleResponse(res);
    },
    update: async (id, supplierData) => {
      const res = await fetch(`${API_BASE}/suppliers/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(supplierData)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/suppliers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // Sales & Purchases Transactions
  transactions: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/transactions${query ? `?${query}` : ''}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    record: async (txData) => {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(txData)
      });
      return handleResponse(res);
    }
  },

  // Security Audit & Intrusion Alerts
  audit: {
    getLogs: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/audit/logs${query ? `?${query}` : ''}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    getAlerts: async (params = {}) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/audit/alerts${query ? `?${query}` : ''}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    },
    resolveAlert: async (id) => {
      const res = await fetch(`${API_BASE}/audit/alerts/${id}/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      return handleResponse(res);
    }
  }
};
