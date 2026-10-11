import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Percent, Store } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AddToBagButton } from "@/features/cart/AddToBagButton";
import { ItemImage, PriceTag, RatingBadge } from "./ItemMeta";
import { ITEM_TYPE_LABELS, type Item } from "./types";

interface MenuCardProps {
  item: Item;
  index: number;
  /** Hide the canteen link when the card is already shown on that canteen's page. */
  showCanteen?: boolean;
}

export function MenuCard({ item, index, showCanteen = true }: MenuCardProps) {
  return (
    <motion.article layout
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="flex min-w-0 flex-col beige-surface rounded-[2rem] border border-border p-3 shadow-sm sm:p-4">
      <Link to={`/items/${item.id}`} className="relative block">
        <ItemImage item={item} className="aspect-[4/3] rounded-3xl" />
        <span className="absolute left-3 top-3 rounded-full bg-card px-3 py-1 text-[11px] font-bold tracking-wider">
          {ITEM_TYPE_LABELS[item.type].toUpperCase()}
        </span>
        {item.discount > 0 && (
          <div className="absolute bottom-0 left-0 flex items-center gap-2 rounded-tr-3xl bg-forest py-2 pl-2 pr-6 text-xs font-bold text-white sm:py-3 sm:pl-3 sm:pr-8 sm:text-sm">
            <span className="grid size-7 place-items-center rounded-full bg-sage text-forest"><Percent size={14} /></span>
            {formatPrice(item.discount)} OFF
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col px-1 pt-4 sm:px-2 sm:pt-5">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/items/${item.id}`} className="min-w-0 break-words text-xl font-medium hover:underline sm:text-2xl">{item.name}</Link>
          <RatingBadge rating={item.rating} count={item.ratingCount} />
        </div>
        <div className="mt-2 flex justify-between gap-4 text-sm text-muted-foreground">
          <p className="line-clamp-2 min-w-0">{item.description}</p>
          <PriceTag item={item} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
          {showCanteen ? (
            <Link to={`/canteens/${item.canteenId}`} className="flex min-w-0 items-center gap-1 hover:text-foreground">
              <Store size={14} className="shrink-0" /><span className="truncate">{item.canteenName}</span>
            </Link>
          ) : <span />}
          <AddToBagButton item={item} />
        </div>
      </div>
    </motion.article>
  );
}
