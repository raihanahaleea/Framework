import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, LoginRequest, LoginResponse } from '../types';
import api from '../lib/api';
import { setTokens, clearTokens, getAccessToken, getStoredUser, setStoredUser } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!getAccessToken();

  const refreshUser = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const res = await api.get('/auth/me');
      setUser(res.data);
      setStoredUser(res.data);
    } catch {
      setUser(null);
      clearTokens();
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const token = getAccessToken();
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };
    init();
  }, [refreshUser]);

  const login = useCallback(async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<any>('/auth/login', data);
    const raw = res.data;
    const payload = (raw && raw.success === true && raw.data !== undefined) ? raw.data : raw;
    const accessToken = payload?.accessToken || payload?.access_token || '';
    const refreshToken = payload?.refreshToken || payload?.refresh_token || accessToken;
    const userData = payload?.user;

    if (accessToken && userData) {
      setTokens(accessToken, refreshToken);
      setUser(userData);
      setStoredUser(userData);
    }
    return { ...payload, accessToken, refreshToken, user: userData };
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      setUser(null);
      clearTokens();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
