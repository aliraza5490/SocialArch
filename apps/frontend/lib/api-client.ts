import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./utils/jwt";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

        // If error is not 401 or request has already been retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }

        // Check if it's a refresh token error - if so, logout immediately
        if (
          error.response.data?.message?.includes("Invalid refresh token") ||
          error.response.data?.message?.includes("Refresh token expired") ||
          originalRequest.url?.includes("/auth/refresh")
        ) {
          clearTokens();
          window.location.href = "/auth/login";
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          // Use a single refresh promise to prevent concurrent refresh requests
          if (!this.refreshPromise) {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              clearTokens();
              window.location.href = "/auth/login";
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
          window.location.href = "/auth/login";
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
  async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.axiosInstance.get(url, config);
  }

  async post(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    return this.axiosInstance.post(url, data, config);
  }

  async put(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    return this.axiosInstance.put(url, data, config);
  }

  async patch(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    return this.axiosInstance.patch(url, data, config);
  }

  async delete(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    return this.axiosInstance.delete(url, config);
  }
}

export const apiClient = new ApiClient();
