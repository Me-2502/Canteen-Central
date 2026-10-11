import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { ItemImage, PriceTag, RatingBadge } from "./ItemMeta";
import { ITEM_TYPE_LABELS, type Item } from "./types";

/** Picture, name, price and description of an item. Shared by the read and manage views. */
export function ItemDetails({ item, children }: { item: Item; children?: React.ReactNode }) {
  return (
    <section className="grid gap-10 md:grid-cols-2">
      <ItemImage item={item} className="aspect-square rounded-[2.5rem]" />

      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-bold tracking-widest text-olive">{ITEM_TYPE_LABELS[item.type].toUpperCase()}</p>
          <h1 className="mt-2 text-5xl font-medium">{item.name}</h1>
          <Link to={`/canteens/${item.canteenId}`}
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <Store size={14} /> {item.canteenName}
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xl">
          <PriceTag item={item} />
          <RatingBadge rating={item.rating} count={item.ratingCount} />
        </div>

        {item.description && <p className="text-muted-foreground">{item.description}</p>}

        <dl className="grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
          <div><dt className="text-muted-foreground">Serving size</dt><dd className="font-semibold">{item.measure}</dd></div>
          <div><dt className="text-muted-foreground">Times ordered</dt><dd className="font-semibold">{item.orderCount}</dd></div>
        </dl>

        {children}
      </div>
    </section>
  );
}
