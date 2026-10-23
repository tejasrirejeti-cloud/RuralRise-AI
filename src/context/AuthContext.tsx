/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types/index.js';
import { api, getStoredToken } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, passwordPlain: string) => Promise<void>;
  register: (name: string, email: string, passwordPlain: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; emailDeliveryConfigured?: boolean; deliveryNotice?: string }>;
  resetPassword: (token: string, newPasswordPlain: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, passwordPlain: string) => {
    setIsLoading(true);
    try {
      await api.login(email, passwordPlain);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, passwordPlain: string) => {
    setIsLoading(true);
    try {
      await api.register(name, email, passwordPlain);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.deleteAccount();
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const requestPasswordReset = async (email: string) => {
    return api.requestPasswordReset(email);
  };

  const resetPassword = async (token: string, newPasswordPlain: string) => {
    return api.resetPassword(token, newPasswordPlain);
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await api.updateProfile(data);
    setProfile(res.profile);
    return res.profile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        login,
        register,
        logout,
        deleteAccount,
        requestPasswordReset,
        resetPassword,
        updateProfile,
        refreshUser
      }}
    >
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
