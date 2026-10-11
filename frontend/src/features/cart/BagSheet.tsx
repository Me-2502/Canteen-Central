import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { api, getErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useRequireAuth } from "@/features/auth/useRequireAuth";
import { ORDER_TYPE_LABELS, type OrderType } from "@/features/orders/types";
import { orderKeys } from "@/features/orders/useOrders";
import { useCartStore } from "./cartStore";

const ORDER_TYPES: OrderType[] = ["PICKUP", "DINE_IN", "DELIVERY"];
const SLOT_MINUTES = 30;

const formatSlotTime = (d: Date) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/** The next few half-hour windows, starting from the next slot boundary. */
function upcomingSlots(count = 8) {
  const start = new Date();
  start.setSeconds(0, 0);
  start.setMinutes(Math.ceil((start.getMinutes() + 1) / SLOT_MINUTES) * SLOT_MINUTES);
  return Array.from({ length: count }, (_, i) => {
    const from = new Date(start.getTime() + i * SLOT_MINUTES * 60_000);
    const to = new Date(from.getTime() + SLOT_MINUTES * 60_000);
    return `${formatSlotTime(from)} – ${formatSlotTime(to)}`;
  });
}

const selectClass = "h-10 w-full rounded-full border border-border bg-card px-4 text-sm font-semibold";

export function BagSheet() {
  const { items, open, setOpen, updateQty, clear, total } = useCartStore();
  const requireAuth = useRequireAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [type, setType] = useState<OrderType>("PICKUP");
  // Recomputed on every render so the list never starts in the past
  const slots = upcomingSlots();
  const [slot, setSlot] = useState("");
  const selectedTimeRange = slots.includes(slot) ? slot : slots[0];

  const checkout = useMutation({
    mutationFn: () =>
      api.post("/orders", {
        type,
        selectedTimeRange,
        items: items.map((l) => ({ itemId: l.item.id, canteenId: l.item.canteenId, quantity: l.qty })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
      toast.success("Order placed", { action: { label: "View orders", onClick: () => navigate("/orders") } });
      clear();
      setOpen(false);
    },
    onError: (e) => toast.error(getErrorMessage(e, "Could not place the order. Please try again.")),
  });

  // Guests go to login; the bag stays open in the store, so it reappears when they come back
  const onCheckout = () =>
    requireAuth(() => checkout.mutate(), "Please log in to place your order."); // the server recalculates the price

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="h-dvh w-full gap-0 border-border sm:max-w-md">
        <SheetHeader className="border-b border-border pr-12"><SheetTitle>Your bag</SheetTitle></SheetHeader>

        {items.length === 0 ? (
          <p className="p-4 text-muted-foreground">Your bag is empty. Add something from the menu.</p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <ul className="flex-1 space-y-4 p-4">
              {items.map(({ item, qty }) => (
                <li key={item.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(item.finalPrice * qty)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-2 py-1">
                    <button aria-label="Decrease" onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                    <span className="w-5 text-center text-sm">{qty}</span>
                    <button aria-label="Increase" onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="sticky bottom-0 space-y-3 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <label className="block space-y-1.5 text-sm font-semibold">
                <span>Order type</span>
                <select value={type} onChange={(e) => setType(e.target.value as OrderType)} className={selectClass}>
                  {ORDER_TYPES.map((t) => <option key={t} value={t}>{ORDER_TYPE_LABELS[t]}</option>)}
                </select>
              </label>
              <label className="block space-y-1.5 text-sm font-semibold">
                <span>Time</span>
                <select value={selectedTimeRange} onChange={(e) => setSlot(e.target.value)} className={selectClass}>
                  {slots.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(total())}</span></div>
              <Button onClick={onCheckout} disabled={checkout.isPending}
                className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                {checkout.isPending ? "Placing order..." : "Place order"}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
