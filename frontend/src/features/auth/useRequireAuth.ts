import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "./authStore";

/** Login page URL that sends the user back to `from` after they sign in. */
export const loginPath = (from: string) => `/auth?redirect=${encodeURIComponent(from)}`;

/** Only allow same-site paths, so a crafted ?redirect= link cannot send users to another site. */
export function safeRedirect(value: string | null, fallback = "/menu") {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

/**
 * Wraps actions that need a signed-in user (placing an order, rating, ...).
 * Guests are sent to the login page and brought back to the current page afterwards.
 */
export function useRequireAuth() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  return (action: () => void, message = "Please log in to continue.") => {
    if (user) return action();
    toast.info(message);
    navigate(loginPath(location.pathname + location.search));
  };
}
