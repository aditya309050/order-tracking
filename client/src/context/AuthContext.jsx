import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, fetchCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vanguard_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vanguard_token'));
  const [loading, setLoading] = useState(true);

  // Validate session on boot
  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await fetchCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('vanguard_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid, clearing:', err);
          logout();
        }
      }
      setLoading(false);
    }

    verifySession();
  }, [token]);

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
        isClient
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
