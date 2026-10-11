import { AddToBagButton } from "@/features/cart/AddToBagButton";
import { ItemDetails } from "./ItemDetails";
import type { Item } from "./types";

/** What customers and signed-out visitors see. */
export function ItemReadView({ item }: { item: Item }) {
  return (
    <div className="pt-10">
      <ItemDetails item={item}>
        <div className="mt-auto border-t border-border pt-5">
          <AddToBagButton item={item} />
        </div>
      </ItemDetails>
    </div>
  );
}
