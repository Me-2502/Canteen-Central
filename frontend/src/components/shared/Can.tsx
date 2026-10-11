import { useAuthStore } from "@/features/auth/authStore";
import type { Role } from "@/features/auth/types";

export function Can({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const role = useAuthStore((s) => s.user?.role);
  return role && roles.includes(role) ? <>{children}</> : null;
}
