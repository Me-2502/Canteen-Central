import { Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Item } from "./types";

export function PriceTag({ item }: { item: Pick<Item, "unitPrice" | "finalPrice" | "discount"> }) {
  return (
    <span className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
      <span className="font-bold text-foreground">{formatPrice(item.finalPrice)}</span>
      {item.discount > 0 && <span className="text-xs text-muted-foreground line-through">{formatPrice(item.unitPrice)}</span>}
    </span>
  );
}

export function RatingBadge({ rating, count }: { rating: number; count: number }) {
  if (count === 0) return <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-muted-foreground">No ratings yet</span>;
  return (
    <span className="flex shrink-0 items-center gap-1 rounded-lg bg-forest px-2 py-1 text-xs font-bold text-white"
      title={`${count} ratings`}>
      {rating.toFixed(1)} <Star size={11} fill="currentColor" />
    </span>
  );
}

export function ItemImage({ item, className }: { item: Pick<Item, "imageUrl" | "name">; className?: string }) {
  return (
    <div className={`overflow-hidden bg-accent ${className ?? ""}`}>
      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="size-full object-cover" loading="lazy" />}
    </div>
  );
}
