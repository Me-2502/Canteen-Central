import { Link, NavLink } from "react-router-dom";
import { Soup, ShoppingBag, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useAuthStore } from "@/features/auth/authStore";
import { useLogout } from "@/features/auth/useAuth";
import { useCartStore } from "@/features/cart/cartStore";
import { Can } from "@/components/shared/Can";

const link = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 pb-1 text-sm font-semibold ${isActive ? "border-forest" : "border-transparent"}`;

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const openBag = useCartStore((s) => s.setOpen);

  return (
    <header className="bg-cream">
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-sage"><Soup size={22} /></span>
          <span className="leading-tight">
            <span className="block font-bold tracking-wide">CANTEEN</span>
            <span className="block text-xs tracking-[0.25em] text-olive">CENTRAL</span>
          </span>
        </Link>

        <nav className="flex gap-8">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/menu" className={link}>Our menu</NavLink>
          <Can roles={["ADMIN", "OWNER"]}><NavLink to="/admin" className={link}>Admin</NavLink></Can>
          <Can roles={["OWNER"]}><NavLink to="/owner" className={link}>Owner</NavLink></Can>
        </nav>

        <div className="flex items-center gap-3">
          <motion.button key={count} animate={{ scale: [1, 1.2, 1] }} onClick={() => openBag(true)}
            aria-label="Open bag" className="relative grid size-11 place-items-center rounded-full border border-sage bg-white">
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-forest text-[11px] text-white">{count}</span>
            )}
          </motion.button>

          {user ? (
            <div className="flex items-center gap-3 rounded-xl border border-sage bg-white py-1.5 pl-2 pr-3">
              <span className="grid size-9 place-items-center rounded-full bg-sage text-xs font-bold">
                {user.username.slice(0, 2).toUpperCase()}
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold">{user.username}</span>
                <span className="block text-xs capitalize text-neutral-500">{user.role.toLowerCase()}</span>
              </span>
              <button onClick={logout} aria-label="Log out"><LogOut size={16} /></button>
            </div>
          ) : (
            <Link to="/auth" className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white">Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
