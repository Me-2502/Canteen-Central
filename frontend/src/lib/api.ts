import axios from "axios";
import { useAuthStore } from "@/features/auth/authStore";

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
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);
