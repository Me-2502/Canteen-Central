import { AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { MenuCard } from "./MenuCard";
import type { Item } from "./types";

interface ItemGridProps {
  items: Item[];
  isLoading: boolean;
  isError: boolean;
  showCanteen?: boolean;
  emptyText?: string;
}

export function ItemGrid({ items, isLoading, isError, showCanteen, emptyText = "No dishes found." }: ItemGridProps) {
  if (isError) return <p className="text-destructive">Could not load the dishes. Check that the backend is running.</p>;

  if (!isLoading && items.length === 0) return <p className="py-16 text-center text-muted-foreground">{emptyText}</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-[2rem]" />)}
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => <MenuCard key={item.id} item={item} index={i} showCanteen={showCanteen} />)}
      </AnimatePresence>
    </div>
  );
}
