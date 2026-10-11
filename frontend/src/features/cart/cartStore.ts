import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem } from "@/features/menu/types";

export interface CartLine { item: MenuItem; qty: number }

interface CartState {
  items: CartLine[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: MenuItem) => void;
  updateQty: (id: number, delta: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (item) =>
        set((s) => {
          const found = s.items.find((l) => l.item.id === item.id);
          return {
            items: found
              ? s.items.map((l) => (l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l))
              : [...s.items, { item, qty: 1 }],
          };
        }),
      updateQty: (id, delta) =>
        set((s) => ({
          items: s.items
            .map((l) => (l.item.id === id ? { ...l, qty: l.qty + delta } : l))
            .filter((l) => l.qty > 0),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, l) => sum + l.item.price * l.qty, 0),
    }),
    { name: "canteen-bag", partialize: (s) => ({ items: s.items }) }
  )
);
