'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, AuthState, LoginRequest, RegisterRequest } from '../types/auth';
import { apiClient } from '../api-client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
          // Try to decode user from token or validate it
          // For now, we'll assume the token is valid if it exists
          // In a real app, you might want to validate the token with the server
          setState({
            user: null, // We'll need to decode this from JWT or fetch user profile
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await apiClient.login(credentials);
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      router.push('/');
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await apiClient.register(userData);

      setState(prev => ({ ...prev, isLoading: false }));

      return response.data;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    router.push('/auth/login');
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.refreshToken({ refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout(); // Logout if refresh fails
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}