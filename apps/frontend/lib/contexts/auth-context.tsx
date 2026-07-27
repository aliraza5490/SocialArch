"use client";

import { ReactNode, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AxiosError, AxiosResponse } from "axios";
import { create } from "zustand";
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

interface AuthStore extends AuthState {
  initializeAuth: () => Promise<void>;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => void;
}

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const useAuthStore = create<AuthStore>((set) => ({
  ...initialAuthState,

  initializeAuth: async (): Promise<void> => {
    try {
      let tokenPayload: JWTPayload | null = getValidAccessToken();

      // If access token is expired but refresh token exists, try to refresh.
      if (!tokenPayload && isTokenExpiredButRefreshable()) {
        try {
          const refreshTokenValue = getRefreshToken();
          if (refreshTokenValue) {
            const response: AxiosResponse<RefreshTokenResponse> =
              await apiClient.refreshToken({
                refreshToken: refreshTokenValue,
              });
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            setTokens(accessToken, newRefreshToken);
            tokenPayload = getValidAccessToken();
          }
        } catch (refreshError) {
          console.error("Failed to refresh token during init:", refreshError);
          clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }
      }

      if (tokenPayload) {
        // Token is valid, fetch full user data from /me endpoint.
        try {
          const response = await apiClient.axiosInstance.get<User>("/auth/me");
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          // Fallback: use JWT payload if /me endpoint fails.
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

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (credentials: LoginRequest): Promise<void> => {
    try {
      set((prev) => ({ ...prev, isLoading: true }));

      const response: AxiosResponse<LoginResponse> = await apiClient.login(
        credentials,
      );
      const { accessToken, refreshToken, user } = response.data;

      setTokens(accessToken, refreshToken);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<AuthErrorResponse>;
      const rawMessage = axiosError?.response?.data?.message;
      const message = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage || "Login failed. Please try again.";

      set((prev) => ({ ...prev, isLoading: false }));
      throw new Error(message);
    }
  },

  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
      set((prev) => ({ ...prev, isLoading: true }));

      const response: AxiosResponse<RegisterResponse> = await apiClient.register(
        userData,
      );

      set((prev) => ({ ...prev, isLoading: false }));
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<AuthErrorResponse>;
      const message =
        axiosError?.response?.data?.message ||
        "Registration failed. Please try again.";

      set((prev) => ({ ...prev, isLoading: false }));
      throw new Error(message);
    }
  },

  logout: () => {
    clearTokens();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;
    void initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}

export function useAuth(): AuthContextType {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeLogin = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const storeLogout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      await storeLogin(credentials);
      router.push("/dashboard");
    },
    [storeLogin, router],
  );

  const logout = useCallback(() => {
    storeLogout();
    router.push("/login");
  }, [storeLogout, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
}
