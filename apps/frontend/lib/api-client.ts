import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './utils/jwt';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
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
      }
    );

    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = getRefreshToken();
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data;
              setTokens(accessToken, newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            clearTokens();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management methods now use JWT utility functions

  // Auth endpoints
  async login(data: { email: string; password: string; rememberMe: boolean }): Promise<AxiosResponse> {
    return this.axiosInstance.post('/auth/login', data);
  }

  async register(data: { firstName: string; lastName: string; email: string; password: string }): Promise<AxiosResponse> {
    return this.axiosInstance.post('/auth/register', data);
  }

  async requestPasswordReset(data: { email: string }): Promise<AxiosResponse> {
    return this.axiosInstance.get('/auth/request-reset-password', { params: data });
  }

  async resetPassword(data: { password: string; token: string }): Promise<AxiosResponse> {
    return this.axiosInstance.post('/auth/reset-password', data);
  }

  async validateEmail(data: { email: string }): Promise<AxiosResponse> {
    return this.axiosInstance.get('/auth/validate-email', { params: data });
  }

  async verifyEmail(data: { token: string }): Promise<AxiosResponse> {
    return this.axiosInstance.get('/auth/verify-email', { params: data });
  }

  async sendEmailVerification(data: { email: string }): Promise<AxiosResponse> {
    return this.axiosInstance.get('/auth/send-email-verification', { params: data });
  }

  async refreshToken(data: { refreshToken: string }): Promise<AxiosResponse> {
    return this.axiosInstance.post('/auth/refresh', data);
  }

  // Generic methods for future use
  async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.axiosInstance.get(url, config);
  }

  async post(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.axiosInstance.post(url, data, config);
  }

  async put(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.axiosInstance.put(url, data, config);
  }

  async delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.axiosInstance.delete(url, config);
  }
}

export const apiClient = new ApiClient();