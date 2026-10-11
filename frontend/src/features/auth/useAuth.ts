import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthStore } from "./authStore";
import { safeRedirect } from "./useRequireAuth";
import type { LoginRequest, LoginResponse, SignupRequest } from "./types";

function useStartSession() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  return (email: string, { jwt, userId, roles, permissions }: LoginResponse) => {
    setSession(jwt, { id: userId, email, roles, permissions });
    navigate(safeRedirect(params.get("redirect")), { replace: true });
  };
}

const login = async (data: LoginRequest) => (await api.post<LoginResponse>("/auth/login", data)).data;

export function useLogin() {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: login,
    onSuccess: (res, vars) => startSession(vars.mailid, res),
  });
}

/** Signup does not return a token, so we log in straight after creating the account. */
export function useSignup() {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      await api.post("/auth/signup", { ...data, roles: ["CUSTOMER"] });
      return login({ mailid: data.mailid, password: data.password });
    },
    onSuccess: (res, vars) => startSession(vars.mailid, res),
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  return () => { clearSession(); navigate("/auth"); };
}
