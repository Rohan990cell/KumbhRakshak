import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, RoleType } from '../types';
import { api, setAuthToken, clearAuthToken, getAuthToken, IS_DEMO_MODE } from '../services/api';
import { mockStore } from '../services/mockStore';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => void;
  switchRoleQuick: (role: RoleType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (IS_DEMO_MODE) {
      return mockStore.getCurrentUser();
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(!IS_DEMO_MODE);

  useEffect(() => {
    if (IS_DEMO_MODE) {
      const demoUser = mockStore.getCurrentUser();
      setUser(demoUser);
      setToken('demo-token-active');
      setLoading(false);
      return;
    }

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

  const login = async (email: string = 'control@kumbhrakshak.gov.in', _password = '') => {
    setLoading(true);
    try {
      if (IS_DEMO_MODE) {
        const res = mockStore.loginUser(email);
        setAuthToken(res.token);
        setToken(res.token);
        setUser(res.user);
      } else {
        const res = await api.post('/auth/login', { email, password: _password });
        setAuthToken(res.token);
        setToken(res.token);
        setUser(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchRoleQuick = async (role: RoleType) => {
    if (IS_DEMO_MODE) {
      const newUser = mockStore.switchRole(role);
      setUser(newUser);
      setToken(`demo-token-${role}`);
      setAuthToken(`demo-token-${role}`);
    } else {
      const emailMap: Record<RoleType, string> = {
        CONTROL_ROOM: 'control@kumbhrakshak.gov.in',
        FIELD_STAFF: 'field@kumbhrakshak.gov.in',
        EMERGENCY_SERVICES: 'emergency@kumbhrakshak.gov.in',
        PILGRIM: 'pilgrim@kumbhrakshak.gov.in',
        ADMIN: 'admin@kumbhrakshak.gov.in',
      };
      await login(emailMap[role], 'Kumbh@123');
    }
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
