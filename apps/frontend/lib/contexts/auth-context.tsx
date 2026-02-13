"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AxiosError, AxiosResponse } from "axios";
import {
  AuthContextType,
  AuthState,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  User,
} from "../types/auth";
import {
  getValidAccessToken,
  setTokens,
  clearTokens,
  getRefreshToken,
  isTokenExpiredButRefreshable,
  JWTPayload,
} from "../utils/jwt";
import { apiClient } from "../api-client";

type AuthErrorResponse = {
  message?: string;
};

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
    const initializeAuth = async (): Promise<void> => {
      try {
        let tokenPayload: JWTPayload | null = getValidAccessToken();

        // If access token is expired but refresh token exists, try to refresh
        if (!tokenPayload && isTokenExpiredButRefreshable()) {
          try {
            const refreshTokenValue = getRefreshToken();
            if (refreshTokenValue) {
              const response: AxiosResponse<RefreshTokenResponse> =
                await apiClient.refreshToken({
                  refreshToken: refreshTokenValue,
                });
              const { accessToken, refreshToken: newRefreshToken } =
                response.data;
              setTokens(accessToken, newRefreshToken);
              tokenPayload = getValidAccessToken();
            }
          } catch (refreshError) {
            console.error("Failed to refresh token during init:", refreshError);
            clearTokens();
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }
        }

        if (tokenPayload) {
          // Token is valid, fetch full user data from /me endpoint
          try {
            const response = await apiClient.axiosInstance.get<User>(
              "/auth/me",
            );
            setState({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            console.error("Failed to fetch user data:", error);
            // Fallback: use JWT payload if /me endpoint fails
            const user: User | null =
              tokenPayload.email && tokenPayload.ID
                ? {
                    ID: tokenPayload.ID,
                    email: tokenPayload.email,
                    firstName: "",
                    lastName: "",
                    isEmailVerified: true,
                    createdAt: "",
                    updatedAt: "",
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
        console.error("Failed to initialize auth:", error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const response: AxiosResponse<LoginResponse> = await apiClient.login(
        credentials,
      );
      const { accessToken, refreshToken, user } = response.data;

      setTokens(accessToken, refreshToken);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      router.push("/dashboard");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<AuthErrorResponse>;
      const message =
        axiosError?.response?.data?.message ||
        "Login failed. Please try again.";
      setState((prev) => ({ ...prev, isLoading: false }));
      throw new Error(message);
    }
  };

  const register = async (
    userData: RegisterRequest,
  ): Promise<RegisterResponse> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const response: AxiosResponse<RegisterResponse> = await apiClient.register(
        userData,
      );

      setState((prev) => ({ ...prev, isLoading: false }));

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<AuthErrorResponse>;
      const message =
        axiosError?.response?.data?.message ||
        "Registration failed. Please try again.";
      setState((prev) => ({ ...prev, isLoading: false }));
      throw new Error(message);
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

    router.push("/auth/login");
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
