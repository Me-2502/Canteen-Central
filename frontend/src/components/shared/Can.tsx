import { useAuthStore } from "@/features/auth/authStore";
import type { Role } from "@/features/auth/types";

export function Can({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const userRoles = useAuthStore((s) => s.user?.roles);
  return userRoles?.some((r) => roles.includes(r)) ? <>{children}</> : null;
}
