import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, RoleType } from '../types';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  switchRoleQuick: (role: RoleType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (getAuthToken()) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid token');
          clearAuthToken();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password = 'Kumbh@123') => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const switchRoleQuick = async (role: RoleType) => {
    const emailMap: Record<RoleType, string> = {
      CONTROL_ROOM: 'control@kumbhrakshak.gov.in',
      FIELD_STAFF: 'field@kumbhrakshak.gov.in',
      EMERGENCY_SERVICES: 'emergency@kumbhrakshak.gov.in',
      PILGRIM: 'pilgrim@kumbhrakshak.gov.in',
      ADMIN: 'admin@kumbhrakshak.gov.in',
    };
    await login(emailMap[role], 'Kumbh@123');
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchRoleQuick }}>
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
