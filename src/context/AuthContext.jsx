'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, fetchCurrentUser } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount (client-only, avoids SSR mismatch).
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('vanguard_user');
      const savedToken = localStorage.getItem('vanguard_token');
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedToken) setToken(savedToken);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('vanguard_token', res.token);
      localStorage.setItem('vanguard_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error('Login failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vanguard_token');
    localStorage.removeItem('vanguard_user');
  };

  const isOfficeAdmin = user?.role === 'OFFICE_ADMIN';
  const isWarehouseAdmin = user?.role === 'WAREHOUSE_ADMIN';
  const isClient = user?.role === 'CLIENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isOfficeAdmin,
        isWarehouseAdmin,
        isClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
