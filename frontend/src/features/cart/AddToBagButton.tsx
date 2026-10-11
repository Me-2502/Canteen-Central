import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Item } from "@/features/menu/types";
import { useCartStore } from "./cartStore";

export function AddToBagButton({ item }: { item: Item }) {
  const add = useCartStore((s) => s.add);

  const onClick = () => {
    add(item);
    toast.success(`${item.name} added to bag`);
  };

  return (
    <motion.button whileTap={{ scale: 0.92 }} onClick={onClick}
      className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-bold text-olive">
      Add to bag <span className="grid size-8 place-items-center rounded-full bg-olive text-primary-foreground"><Plus size={16} /></span>
    </motion.button>
  );
}
