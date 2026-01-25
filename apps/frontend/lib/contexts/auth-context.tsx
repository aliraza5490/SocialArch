'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  AuthContextType,
  AuthState,
  LoginRequest,
  RegisterRequest,
} from '../types/auth';
import { getValidAccessToken, setTokens, clearTokens } from '../utils/jwt';
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
        const tokenPayload = getValidAccessToken();

        if (tokenPayload) {
          // Token is valid, fetch full user data from /me endpoint
          try {
            const response = await apiClient.axiosInstance.get('/auth/me');
            setState({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            console.error('Failed to fetch user data:', error);
            // Fallback: use JWT payload if /me endpoint fails
            const user =
              tokenPayload.email && tokenPayload.ID
                ? {
                    ID: tokenPayload.ID,
                    email: tokenPayload.email,
                    firstName: '',
                    lastName: '',
                    isEmailVerified: true,
                    createdAt: '',
                    updatedAt: '',
                  }
                : null;

            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          }
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
      setState((prev) => ({ ...prev, isLoading: true }));

      const response = await apiClient.login(credentials);
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens using utility function
      setTokens(accessToken, refreshToken);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      router.push('/');
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const response = await apiClient.register(userData);

      setState((prev) => ({ ...prev, isLoading: false }));

      return response.data;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    // Clear tokens using utility function
    clearTokens();

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

      setState((prev) => ({
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
