import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/authStore";
import type { Role } from "@/features/auth/types";
import { loginPath } from "@/features/auth/useRequireAuth";

/** Requires a signed-in user; with `allow`, also one of those roles. */
export function RoleRoute({ allow }: { allow?: Role[] }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to={loginPath(location.pathname + location.search)} replace />;
  if (allow && !user.roles.some((r) => allow.includes(r))) return <Navigate to="/" replace />;
  return <Outlet />;
}
