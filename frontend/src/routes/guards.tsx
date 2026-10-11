import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/authStore";
import type { Role } from "@/features/auth/types";

export function RoleRoute({ allow }: { allow: Role[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/auth" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
