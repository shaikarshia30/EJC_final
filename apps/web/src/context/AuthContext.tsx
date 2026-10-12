import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRoleType } from '@ejc/types';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../services/api.js';

interface AuthContextType {
  user: any;
  role: UserRoleType | null;
  organizationName: string;
  isOnboardingCompleted: boolean;
  isLoading: boolean;
  isAssistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  toggleAssistant: () => void;
  login: (credentials: { email: string; password: string; organizationSlug?: string }) => Promise<any>;
  register: (data: { email: string; password: string; organizationName: string; firstName: string; lastName: string; role?: string }) => Promise<any>;
  registerUser: (data: { email: string; password: string; organizationSlug: string; firstName: string; lastName: string; jobTitle?: string }) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  error?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRoleType | null>(null);
  const [organizationName, setOrganizationName] = useState<string>('');
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAssistantOpen, setAssistantOpen] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.auth.me();
      setUser(data);
      setRole(data.role);
      setOrganizationName(data.organizationName || 'Organization');
      setIsOnboardingCompleted(data.employee?.isOnboardingCompleted ?? true);
    } catch (err) {
      console.warn('Failed to fetch authenticated user session:', err);
      removeAuthToken();
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials: { email: string; password: string; organizationSlug?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(credentials);
      setAuthToken(res.tokens.accessToken);
      setUser(res.user);
      setRole(res.user.role);
      setOrganizationName(res.user.organizationName || 'Organization');
      const onboarded = res.user.employee?.isOnboardingCompleted ?? true;
      setIsOnboardingCompleted(onboarded);
      return { success: true, role: res.user.role, isOnboardingCompleted: onboarded };
    } catch (err) {
      setIsLoading(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; organizationName: string; firstName: string; lastName: string; role?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      if (res.tokens?.accessToken) {
        setAuthToken(res.tokens.accessToken);
        setUser(res.user);
        setRole(res.user.role);
        setOrganizationName(res.user.organizationName || data.organizationName);
        const onboarded = res.user.employee?.isOnboardingCompleted ?? false;
        setIsOnboardingCompleted(onboarded);
      }
      return res;
    } catch (err) {
      setIsLoading(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (data: { email: string; password: string; organizationSlug: string; firstName: string; lastName: string; jobTitle?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.registerUser(data);
      return res;
    } catch (err) {
      setIsLoading(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setRole(null);
    setOrganizationName('');
    setIsOnboardingCompleted(false);
  };

  const toggleAssistant = () => setAssistantOpen((prev) => !prev);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        organizationName,
        isOnboardingCompleted,
        isLoading,
        isAssistantOpen,
        setAssistantOpen,
        toggleAssistant,
        login,
        register,
        registerUser,
        logout,
        refreshUser: fetchCurrentUser,
        error: null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
