import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/authStore";
import { formatDateTime } from "@/features/analytics/format";
import { useRateOrder, useUpdateOrderStatus } from "./useOrders";
import { ORDER_TYPE_LABELS, STATUS_FLOW, STATUS_LABELS, type Order, type OrderStatus } from "./types";

const statusVariant: Record<OrderStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  PLACED: "outline",
  CONFIRMED: "outline",
  PREPARING: "secondary",
  READY: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

const nextStatus = (status: OrderStatus) => STATUS_FLOW[STATUS_FLOW.indexOf(status) + 1] as OrderStatus | undefined;

interface OrderCardProps {
  order: Order;
  /** "staff" shows canteen-side controls; "customer" shows the customer's own actions. */
  view: "customer" | "staff";
}

export function OrderCard({ order, view }: OrderCardProps) {
  const total = order.orderItems.reduce((sum, i) => sum + i.finalPrice, 0);

  return (
    <article className="beige-surface rounded-[2rem] border border-border p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-widest text-olive">
            {view === "staff" ? `ORDER #${order.id.slice(0, 8).toUpperCase()}` : order.canteenName?.toUpperCase()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {ORDER_TYPE_LABELS[order.type]} · {order.selectedTimeRange} · Placed {formatDateTime(order.createdAt)}
          </p>
          {view === "staff" && order.receiverName && <p className="mt-1 text-sm font-semibold">For {order.receiverName}</p>}
        </div>
        <Badge variant={statusVariant[order.status]} className="rounded-full px-3 py-1">{STATUS_LABELS[order.status]}</Badge>
      </div>

      <ul className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
        {order.orderItems.map((i) => (
          <li key={i.id} className="flex justify-between gap-4">
            <span><span className="font-semibold">{i.quantity} ×</span> {i.itemName}</span>
            <span>{formatPrice(i.finalPrice)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <p className="font-bold">Total {formatPrice(total)}</p>
        {view === "staff" ? <StaffActions order={order} /> : <CustomerActions order={order} />}
      </div>
    </article>
  );
}

function useCanUpdateStatus() {
  return useAuthStore((s) => s.user?.permissions.includes("order:write") ?? false);
}

/** Canteen staff move the order to its next step, or cancel it before it is completed. */
function StaffActions({ order }: { order: Order }) {
  const canWrite = useCanUpdateStatus();
  const update = useUpdateOrderStatus();
  const next = nextStatus(order.status);

  if (!canWrite || order.status === "COMPLETED" || order.status === "CANCELLED") return null;

  const setStatus = (status: OrderStatus) =>
    update.mutate({ orderId: order.id, status }, {
      onSuccess: () => toast.success(`Order marked as ${STATUS_LABELS[status].toLowerCase()}`),
      onError: (e) => toast.error(getErrorMessage(e, "Could not update the order.")),
    });

  const onCancel = () => {
    if (window.confirm("Cancel this order?")) setStatus("CANCELLED");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={onCancel} disabled={update.isPending}
        className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10">
        Cancel order
      </Button>
      {next && (
        <Button onClick={() => setStatus(next)} disabled={update.isPending}
          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          Mark as {STATUS_LABELS[next].toLowerCase()}
        </Button>
      )}
    </div>
  );
}

/** Customers can cancel until the canteen confirms the order, and rate it once it is completed. */
function CustomerActions({ order }: { order: Order }) {
  const canWrite = useCanUpdateStatus();
  const canRate = useAuthStore((s) => s.user?.permissions.includes("rating:write") ?? false);
  const update = useUpdateOrderStatus();

  if (order.status === "PLACED" && canWrite) {
    const onCancel = () => {
      if (!window.confirm("Cancel this order?")) return;
      update.mutate({ orderId: order.id, status: "CANCELLED" }, {
        onSuccess: () => toast.success("Order cancelled"),
        onError: (e) => toast.error(getErrorMessage(e, "Could not cancel the order.")),
      });
    };
    return (
      <Button variant="outline" onClick={onCancel} disabled={update.isPending}
        className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10">
        {update.isPending ? "Cancelling..." : "Cancel order"}
      </Button>
    );
  }

  if (order.status === "COMPLETED" && canRate) return <RateOrder orderId={order.id} />;
  return null;
}

function RateOrder({ orderId }: { orderId: string }) {
  const rate = useRateOrder();
  const [hover, setHover] = useState(0);
  // The backend does not record who rated what yet, so this only hides the stars for this visit
  const [rated, setRated] = useState(0);

  if (rated) return <p className="text-sm font-semibold">Thanks! You rated this {rated}/5.</p>;

  const onRate = (rating: number) =>
    rate.mutate({ orderId, rating }, {
      onSuccess: () => { setRated(rating); toast.success("Thanks for your rating"); },
      onError: (e) => toast.error(getErrorMessage(e, "Could not save your rating.")),
    });

  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <span>Rate</span>
      <div className="flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => onRate(n)} onMouseEnter={() => setHover(n)} disabled={rate.isPending}
            aria-label={`Rate ${n} out of 5`} className="p-0.5 text-olive disabled:opacity-40">
            <Star size={18} fill={n <= hover ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
    </div>
  );
}
