import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenu } from "@/features/menu/useMenu";
import { MenuCard } from "@/features/menu/MenuCard";
import { CATEGORIES } from "@/features/menu/types";

export default function MenuPage() {
  const { data, isLoading, isError } = useMenu();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "All";
  const q = params.get("q") ?? "";
  const [text, setText] = useState(q);

  // debounce the search box into the URL
  useEffect(() => {
    const t = setTimeout(() => {
      setParams((p) => { text ? p.set("q", text) : p.delete("q"); return p; }, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [text, setParams]);

  const setCategory = (c: string) =>
    setParams((p) => { c === "All" ? p.delete("category") : p.set("category", c); return p; });

  const items = useMemo(
    () => (data ?? []).filter((i) =>
      (category === "All" || i.category === category) &&
      `${i.name} ${i.description} ${i.category}`.toLowerCase().includes(q.toLowerCase())),
    [data, category, q]
  );

  return (
    <div className="space-y-12 pt-10">
      <section className="space-y-5 rounded-[2.5rem] bg-forest p-8">
        <div className="relative">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search dishes or cuisines"
            className="h-14 w-full rounded-full bg-white pl-12 pr-5 outline-none focus-visible:ring-2 focus-visible:ring-sage" />
        </div>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`rounded-full border px-5 py-2 text-sm font-bold transition-colors ${
                category === c ? "border-sage bg-sage text-forest" : "border-sage/40 text-white hover:bg-white/10"}`}>
              {c}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-olive">FULL MENU</p>
            <h2 className="mt-2 text-4xl font-medium">All food and drinks</h2>
          </div>
          <span className="rounded-full border border-sage px-4 py-2 text-xs font-bold">{items.length} items</span>
        </div>

        {isError && <p className="text-red-600">Could not load the menu. Check that the backend is running.</p>}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-[2rem]" />)}
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => <MenuCard key={item.id} item={item} index={i} />)}
          </AnimatePresence>
        </div>

        {!isLoading && !isError && items.length === 0 && (
          <p className="py-16 text-center text-neutral-600">No dishes match your search. Try another category.</p>
        )}
      </section>
    </div>
  );
}
