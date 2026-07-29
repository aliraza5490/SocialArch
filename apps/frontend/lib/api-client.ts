import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./utils/jwt";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  axiosInstance: AxiosInstance;
  private refreshPromise: Promise<AxiosResponse> | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        const status = error.response?.status;
        const isAuthError = status === 401 || status === 498;

        // If error is not 401/498 or request has already been retried, reject
        if (!isAuthError || originalRequest?._retry) {
          return Promise.reject(error);
        }

        // Don't attempt token refresh or redirect for public auth endpoints
        const publicAuthEndpoints = [
          "/auth/login",
          "/auth/register",
          "/auth/request-reset-password",
          "/auth/reset-password",
          "/auth/validate-email",
          "/auth/verify-email",
          "/auth/send-email-verification",
        ];

        const isPublicAuthEndpoint = publicAuthEndpoints.some((endpoint) =>
          originalRequest?.url?.includes(endpoint),
        );

        if (isPublicAuthEndpoint) {
          return Promise.reject(error);
        }

        // Check if it's a refresh token error - if so, logout immediately
        if (
          error.response?.data?.message?.includes("Invalid refresh token") ||
          error.response?.data?.message?.includes("Refresh token expired") ||
          error.response?.data?.message?.includes("Invalid Token") ||
          originalRequest?.url?.includes("/auth/refresh")
        ) {
          clearTokens();
          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/login"
          ) {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          // Use a single refresh promise to prevent concurrent refresh requests
          if (!this.refreshPromise) {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              clearTokens();
              if (
                typeof window !== "undefined" &&
                window.location.pathname !== "/login"
              ) {
                window.location.href = "/login";
              }
              return Promise.reject(error);
            }

            this.refreshPromise = axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });
          }

          const response = await this.refreshPromise;
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          setTokens(accessToken, newRefreshToken);
          this.refreshPromise = null;

          // Update the failed request with new token and retry
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return this.axiosInstance(originalRequest);
        } catch (refreshError: any) {
          this.refreshPromise = null;
          clearTokens();
          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/login"
          ) {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      },
    );
  }

  // Token management methods now use JWT utility functions

  // Auth endpoints
  async login(data: {
    email: string;
    password: string;
    rememberMe: boolean;
  }): Promise<AxiosResponse> {
    return this.axiosInstance.post("/auth/login", data);
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<AxiosResponse> {
    return this.axiosInstance.post("/auth/register", data);
  }

  async requestPasswordReset(data: { email: string }): Promise<AxiosResponse> {
    return this.axiosInstance.get("/auth/request-reset-password", {
      params: data,
    });
  }

  async resetPassword(data: {
    password: string;
    token: string;
  }): Promise<AxiosResponse> {
    return this.axiosInstance.post("/auth/reset-password", data);
  }

  async validateEmail(data: { email: string }): Promise<AxiosResponse> {
    return this.axiosInstance.get("/auth/validate-email", { params: data });
  }

  async verifyEmail(data: { token: string }): Promise<AxiosResponse> {
    return this.axiosInstance.get("/auth/verify-email", { params: data });
  }

  async sendEmailVerification(data: { email: string }): Promise<AxiosResponse> {
    return this.axiosInstance.get("/auth/send-email-verification", {
      params: data,
    });
  }

  async refreshToken(data: { refreshToken: string }): Promise<AxiosResponse> {
    // Use a plain axios instance to avoid interceptor loops
    return axios.post(`${API_BASE_URL}/auth/refresh`, data);
  }

  // Generic methods for future use
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
