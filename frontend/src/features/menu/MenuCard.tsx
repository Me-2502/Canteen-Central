import { motion } from "motion/react";
import { Plus, Pencil, Percent, Star } from "lucide-react";
import { toast } from "sonner";
import type { MenuItem } from "./types";
import { useCartStore } from "@/features/cart/cartStore";
import { Can } from "@/components/shared/Can";

export function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  const add = useCartStore((s) => s.add);

  return (
    <motion.article layout
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="flex flex-col rounded-[2rem] border border-sage/60 bg-white p-4 shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sage/40">
        {item.image && <img src={item.image} alt={item.name} className="size-full object-cover" loading="lazy" />}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold tracking-wider">{item.category.toUpperCase()}</span>
          {item.vegetarian && <span className="grid size-6 place-items-center rounded-full bg-sage text-[11px] font-bold">V</span>}
        </div>
        {item.offer && (
          <div className="absolute bottom-0 left-0 flex items-center gap-2 rounded-tr-3xl bg-forest py-3 pl-3 pr-8 text-sm font-bold text-white">
            <span className="grid size-7 place-items-center rounded-full bg-sage text-forest"><Percent size={14} /></span>
            {item.offer}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-medium">{item.name}</h3>
          <span className="flex items-center gap-1 rounded-lg bg-forest px-2 py-1 text-xs font-bold text-white">
            {item.rating} <Star size={11} fill="currentColor" />
          </span>
        </div>
        <div className="mt-2 flex justify-between gap-4 text-sm text-neutral-600">
          <p>{item.description}</p>
          <span className="font-bold text-forest">${item.price.toFixed(2)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-sage/60 pt-4 text-xs font-semibold text-neutral-600">
          <span>{item.prepTime ? `Ready in ${item.prepTime}` : ""}</span>
          <div className="flex items-center gap-3">
            <Can roles={["ADMIN", "OWNER"]}>
              <a href="/admin" className="flex items-center gap-1 text-sm font-bold text-forest"><Pencil size={14} /> Edit</a>
            </Can>
            <motion.button whileTap={{ scale: 0.92 }}
              onClick={() => { add(item); toast.success(`${item.name} added to bag`); }}
              className="flex items-center gap-2 text-sm font-bold text-olive">
              Add to bag <span className="grid size-8 place-items-center rounded-full bg-olive text-white"><Plus size={16} /></span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
