import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/authStore";
import { useCartStore } from "./cartStore";

export function BagSheet() {
  const { items, open, setOpen, updateQty, clear, total } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const checkout = useMutation({
    mutationFn: () =>
      api.post("/orders", { items: items.map((l) => ({ menuItemId: l.item.id, quantity: l.qty })) }),
    onSuccess: () => { toast.success("Order placed"); clear(); setOpen(false); },
    onError: () => toast.error("Could not place the order. Please try again."),
  });

  const onCheckout = () => {
    if (!user) { setOpen(false); navigate("/auth"); return; }
    checkout.mutate(); // the server recalculates the price
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex flex-col bg-cream">
        <SheetHeader><SheetTitle>Your bag</SheetTitle></SheetHeader>

        {items.length === 0 ? (
          <p className="px-4 text-neutral-600">Your bag is empty. Add something from the menu.</p>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-4">
              {items.map(({ item, qty }) => (
                <li key={item.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-neutral-600">${(item.price * qty).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-sage bg-white px-2 py-1">
                    <button aria-label="Decrease" onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                    <span className="w-5 text-center text-sm">{qty}</span>
                    <button aria-label="Increase" onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-sage p-4">
              <div className="flex justify-between font-bold"><span>Total</span><span>${total().toFixed(2)}</span></div>
              <Button onClick={onCheckout} disabled={checkout.isPending}
                className="h-12 w-full rounded-full bg-forest text-white hover:bg-forest/90">
                {checkout.isPending ? "Placing order..." : "Place order"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
