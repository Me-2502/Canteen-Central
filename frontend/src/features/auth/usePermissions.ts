import { useOwnedCanteens } from "@/features/canteens/useCanteens";
import { useAuthStore } from "./authStore";

/**
 * Write permissions for one canteen, deciding which view of a canteen or item page is shown.
 * Admins can manage every canteen; owners only the canteens they own (the backend enforces the same rule).
 * Anyone else (including signed-out visitors) gets the read-only view.
 */
export function usePermissions(canteenId: string | undefined) {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.roles.includes("ADMIN") ?? false;
  const isOwner = user?.roles.includes("OWNER") ?? false;
  const owned = useOwnedCanteens(isOwner && !isAdmin);

  const ownsCanteen = !!canteenId && (owned.data?.some((c) => c.id === canteenId) ?? false);
  const canAccess = isAdmin || ownsCanteen;
  const canWriteCanteen = canAccess && (user?.permissions.includes("canteen:write") ?? false);
  const canWriteMenu = canAccess && (user?.permissions.includes("menu:write") ?? false);

  return {
    canWriteCanteen,
    canWriteMenu,
    canManage: canWriteCanteen || canWriteMenu,
    // True while an owner's canteen list is loading, so pages don't flash the read-only view
    isLoading: owned.isLoading,
  };
}
