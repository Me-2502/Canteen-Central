import { useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/Pagination";
import { SegmentedSwitch } from "@/components/shared/SegmentedSwitch";
import { useAuthStore } from "@/features/auth/authStore";
import { OrderCard } from "@/features/orders/OrderCard";
import { useCanteenOrders, useManagedCanteens, useMyOrders, type OrderScope } from "@/features/orders/useOrders";
import type { ManagedCanteen, Order } from "@/features/orders/types";
import type { PageResponse } from "@/lib/api";

type Section = "mine" | "canteen";

const SCOPE_OPTIONS: { value: OrderScope; label: string }[] = [
  { value: "current", label: "Current" },
  { value: "previous", label: "Previous" },
];

/**
 * Every signed-in user sees their own orders. Canteen staff (owners, chefs, waiters, admins)
 * also get a switch to the orders of the canteens they work on.
 */
export default function OrdersPage() {
  const roles = useAuthStore((s) => s.user?.roles ?? []);
  const isPureCustomer = roles.every((r) => r === "CUSTOMER");
  const managed = useManagedCanteens(!isPureCustomer);
  const canteens = managed.data ?? [];
  const [section, setSection] = useState<Section>("mine");
  const showCanteenOrders = section === "canteen" && canteens.length > 0;

  return (
    <div className="space-y-8 pt-10">
      <div>
        <p className="text-xs font-bold tracking-widest text-olive">ORDERS</p>
        <h1 className="mt-2 text-5xl font-medium">{showCanteenOrders ? "Canteen orders" : "Your orders"}</h1>
      </div>

      {canteens.length > 0 && (
        <SegmentedSwitch id="orders-section" value={section} onChange={setSection} options={[
          { value: "mine", label: "My orders" },
          { value: "canteen", label: "Canteen orders" },
        ]} />
      )}

      {showCanteenOrders ? <CanteenOrders canteens={canteens} /> : <MyOrders />}
    </div>
  );
}

function MyOrders() {
  const [scope, setScope] = useState<OrderScope>("current");
  const [page, setPage] = useState(0);
  const query = useMyOrders(scope, page);

  return (
    <section className="space-y-6">
      <ScopeSwitch scope={scope} onChange={(s) => { setScope(s); setPage(0); }} />
      <OrderList query={query} view="customer" page={page} onPageChange={setPage}
        emptyText={scope === "current"
          ? <>No orders in progress. <Link to="/menu" className="font-semibold underline">Browse the menu</Link></>
          : "No previous orders yet."} />
    </section>
  );
}

function CanteenOrders({ canteens }: { canteens: ManagedCanteen[] }) {
  const [canteenId, setCanteenId] = useState(canteens[0].id);
  const [scope, setScope] = useState<OrderScope>("current");
  const [page, setPage] = useState(0);
  const query = useCanteenOrders(canteenId, scope, page);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        {canteens.length > 1 && (
          <select value={canteenId} onChange={(e) => { setCanteenId(e.target.value); setPage(0); }}
            aria-label="Canteen" className="h-10 rounded-full border border-border bg-card px-4 text-sm font-semibold">
            {canteens.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <ScopeSwitch scope={scope} onChange={(s) => { setScope(s); setPage(0); }} className="min-w-64 flex-1" />
      </div>
      <OrderList query={query} view="staff" page={page} onPageChange={setPage}
        emptyText={scope === "current" ? "No orders to work on right now." : "No previous orders."} />
    </section>
  );
}

function ScopeSwitch({ scope, onChange, className = "max-w-sm" }: { scope: OrderScope; onChange: (s: OrderScope) => void; className?: string }) {
  return <SegmentedSwitch id="orders-scope" options={SCOPE_OPTIONS} value={scope} onChange={onChange} className={className} />;
}

interface OrderListProps {
  query: { data?: PageResponse<Order>; isLoading: boolean; isError: boolean };
  view: "customer" | "staff";
  page: number;
  onPageChange: (page: number) => void;
  emptyText: React.ReactNode;
}

function OrderList({ query: { data, isLoading, isError }, view, page, onPageChange, emptyText }: OrderListProps) {
  if (isError) return <p className="text-destructive">Could not load the orders. Please try again.</p>;
  if (isLoading) {
    return <div className="grid gap-6 md:grid-cols-2">{[0, 1].map((i) => <Skeleton key={i} className="h-64 rounded-[2rem]" />)}</div>;
  }

  const orders = data?.content ?? [];
  if (orders.length === 0) return <p className="py-16 text-center text-muted-foreground">{emptyText}</p>;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {orders.map((o) => <OrderCard key={o.id} order={o} view={view} />)}
      </div>
      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={onPageChange} />
    </>
  );
}
