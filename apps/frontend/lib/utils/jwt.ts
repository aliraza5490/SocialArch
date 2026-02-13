/**
 * JWT Token Utility Functions
 * Handles decoding, validation, and expiration checking of JWT tokens
 */

export interface JWTPayload {
  email?: string;
  ID?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Decode a JWT token and return its payload
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT has 3 parts separated by dots: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // JWT payload is base64url encoded, need to convert to base64 first
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = atob(base64);

    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * @param token - JWT token string
 * @returns true if expired, false if valid
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) {
      return true; // Consider invalid tokens as expired
    }

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Failed to check token expiration:", error);
    return true; // Consider errors as expired
  }
}

/**
 * Get and validate access token from localStorage
 * @returns Decoded token payload or null if invalid/expired/not found
 */
export function getValidAccessToken(): JWTPayload | null {
  try {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    if (isTokenExpired(token)) {
      // Don't clear tokens here - let the refresh logic handle it
      return null;
    }

    return decodeJWT(token);
  } catch (error) {
    console.error("Failed to get valid access token:", error);
    return null;
  }
}

/**
 * Check if access token exists but is expired (needs refresh)
 * @returns true if token exists but expired, false otherwise
 */
export function isTokenExpiredButRefreshable(): boolean {
  try {
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token || !refreshToken) return false;

    return isTokenExpired(token);
  } catch (error) {
    console.error("Failed to check if token is refreshable:", error);
    return false;
  }
}

/**
 * Get access token string from localStorage
 * @returns Token string or null if not found
 */
export function getAccessToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  } catch (error) {
    console.error("Failed to get access token:", error);
    return null;
  }
}

/**
 * Get refresh token string from localStorage
 * @returns Token string or null if not found
 */
export function getRefreshToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  } catch (error) {
    console.error("Failed to get refresh token:", error);
    return null;
  }
}

/**
 * Store tokens in localStorage
 * @param accessToken - Access token string
 * @param refreshToken - Refresh token string (optional)
 */
export function setTokens(accessToken: string, refreshToken?: string): void {
  try {
    if (typeof window === "undefined") return;

    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  } catch (error) {
    console.error("Failed to set tokens:", error);
  }
}

/**
 * Clear all auth tokens from localStorage
 */
export function clearTokens(): void {
  try {
    if (typeof window === "undefined") return;

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch (error) {
    console.error("Failed to clear tokens:", error);
  }
}

/**
 * Check if user is authenticated based on valid access token
 * @returns true if authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  return getValidAccessToken() !== null;
}
