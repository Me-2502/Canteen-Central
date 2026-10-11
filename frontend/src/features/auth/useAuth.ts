import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthStore } from "./authStore";
import type { AuthResponse } from "./types";

function useAuthMutation<T>(endpoint: string) {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: T) => (await api.post<AuthResponse>(endpoint, data)).data,
    onSuccess: ({ token, user }) => {
      setSession(token, user);
      navigate(user.role === "CUSTOMER" ? "/menu" : "/admin");
    },
  });
}

export const useLogin = () => useAuthMutation<{ email: string; password: string }>("/auth/login");
export const useSignup = () =>
  useAuthMutation<{ username: string; email: string; password: string }>("/auth/signup");

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  return () => { clearSession(); navigate("/auth"); };
}
