import axios from "axios";
import { useAuthStore } from "@/features/auth/authStore";
import { loginPath } from "@/features/auth/useRequireAuth";

/** Envelope used by every backend endpoint except /auth. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const api = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url: string = error.config?.url ?? "";
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/signup");
    if (error.response?.status === 401 && !isAuthCall) {
      useAuthStore.getState().clearSession();
      // Session expired or missing: log in again, then come back to this page
      if (window.location.pathname !== "/auth") {
        window.location.href = loginPath(window.location.pathname + window.location.search);
      }
    }
    return Promise.reject(error);
  }
);

/** Reads the backend's error message, falling back to a generic one. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (axios.isAxiosError(error)) return error.response?.data?.message ?? fallback;
  return fallback;
}
