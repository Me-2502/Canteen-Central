import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  BarChart3, ChevronsUpDown, House, LogIn, LogOut, Menu, Moon, ReceiptText, ShoppingBag, Soup, Store, Sun, UserPlus, UserRound,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/features/auth/authStore";
import { useLogout } from "@/features/auth/useAuth";
import type { Role } from "@/features/auth/types";
import { useCartStore } from "@/features/cart/cartStore";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { useThemeStore } from "@/features/theme/themeStore";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** Only shown to users with one of these roles. */
  roles?: Role[];
  /** Only shown to signed-in users, whatever their role. */
  signedIn?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/orders", label: "Orders", icon: ReceiptText, signedIn: true },
  { to: "/canteens", label: "Canteens", icon: Store, roles: ["ADMIN", "OWNER"] },
  { to: "/analytics", label: "Analytics", icon: BarChart3, roles: ["OWNER"] },
];

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 pb-1 text-sm font-semibold ${isActive ? "border-foreground" : "border-transparent"}`;

const mobileLink = ({ isActive }: { isActive: boolean }) =>
  cn("flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
    isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted");

function useNavItems() {
  const roles = useAuthStore((s) => s.user?.roles);
  return NAV_ITEMS.filter((item) =>
    (!item.signedIn || !!roles) && (!item.roles || roles?.some((r) => item.roles!.includes(r))));
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground lg:size-12"><Soup size={22} /></span>
      <span className="leading-tight">
        <span className="block font-bold tracking-wide">CANTEEN</span>
        <span className="block text-xs tracking-[0.25em] text-olive">CENTRAL</span>
      </span>
    </Link>
  );
}

function BagButton() {
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const openBag = useCartStore((s) => s.setOpen);
  return (
    <motion.button key={count} animate={{ scale: [1, 1.2, 1] }} onClick={() => openBag(true)}
      aria-label="Open bag" className="relative grid size-11 place-items-center rounded-full border border-border bg-card">
      <ShoppingBag size={18} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground">{count}</span>
      )}
    </motion.button>
  );
}

function UserBadge({ className }: { className?: string }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  if (!user) return null;
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border border-border bg-card py-1.5 pl-2 pr-3", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
        {user.email.slice(0, 2).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-semibold">{user.email}</span>
        <span className="block text-xs capitalize text-muted-foreground">{user.roles.join(", ").toLowerCase()}</span>
      </span>
      <button onClick={logout} aria-label="Log out"><LogOut size={16} /></button>
    </div>
  );
}

/**
 * Account card pinned to the bottom of the mobile nav. Opens a menu with the theme switch and sign out,
 * or log in / sign up for guests.
 */
function AccountMenu({ onNavigate }: { onNavigate: () => void }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2 text-left transition-colors hover:bg-muted data-[state=open]:bg-muted">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
            {user ? user.email.slice(0, 2).toUpperCase() : <UserRound size={18} />}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold">{user ? user.email : "Guest"}</span>
            <span className="block truncate text-xs capitalize text-muted-foreground">
              {user ? user.roles.join(", ").toLowerCase() : "Log in or sign up"}
            </span>
          </span>
          <ChevronsUpDown size={16} className="shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" sideOffset={8}
        className="w-(--radix-dropdown-menu-trigger-width) rounded-xl p-1.5">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
          {user ? user.email : "You're not signed in"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Keep the menu open so the change is visible */}
        <DropdownMenuItem className="py-2" onSelect={(e) => { e.preventDefault(); toggleTheme(); }}>
          {isDark ? <Sun /> : <Moon />}{isDark ? "Light theme" : "Dark theme"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem variant="destructive" className="py-2" onSelect={() => { onNavigate(); logout(); }}>
            <LogOut />Sign out
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem asChild className="py-2">
              <Link to="/auth" onClick={onNavigate}><LogIn />Log in</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="py-2">
              <Link to="/auth?mode=signup" onClick={onNavigate}><UserPlus />Sign up</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Vertical navigation in a slide-out sheet, used below the lg breakpoint. */
function MobileNav() {
  const [open, setOpen] = useState(false);
  const items = useNavItems();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button onClick={() => setOpen(true)} aria-label="Open navigation"
        className="grid size-11 place-items-center rounded-full border border-border bg-card lg:hidden">
        <Menu size={18} />
      </button>
      <SheetContent side="left" className="h-dvh w-72 gap-0 border-border bg-background p-0">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle asChild><div><Logo onClick={close} /></div></SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>

        {/* Plain onClick rather than SheetClose asChild: Slot would stringify NavLink's className function */}
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Main">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={close} className={mobileLink}>
              <Icon size={18} className="shrink-0" />{label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <AccountMenu onNavigate={close} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const items = useNavItems();

  return (
    <header className="bg-muted">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 lg:h-24">
        <div className="flex items-center gap-3">
          <MobileNav />
          <Logo />
        </div>

        <nav className="hidden gap-8 lg:flex" aria-label="Main">
          {items.map(({ to, label, end }) => <NavLink key={to} to={to} end={end} className={desktopLink}>{label}</NavLink>)}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden lg:grid" />
          <BagButton />
          {user ? <UserBadge className="hidden lg:flex" /> : (
            <Link to="/auth" className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground sm:block">Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
