import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Pagination } from "@/components/shared/Pagination";
import { useItems } from "@/features/menu/useItems";
import { ItemGrid } from "@/features/menu/ItemGrid";
import { ITEM_TYPES, ITEM_TYPE_LABELS, SORT_LABELS, type ItemSort, type ItemType } from "@/features/menu/types";

const PAGE_SIZE = 12;

const chip = (active: boolean) =>
  `shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition-colors sm:px-5 ${
    active ? "border-transparent bg-sage text-forest" : "border-sage/40 text-white hover:bg-white/10"}`;

export default function MenuPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const type = (params.get("type") as ItemType | null) ?? undefined;
  const sort = (params.get("sort") as ItemSort | null) ?? "POPULAR";
  const page = Number(params.get("page") ?? 0);
  const [text, setText] = useState(q);

  const { data, isLoading, isError } = useItems({ keyword: q || undefined, type, sort, page, size: PAGE_SIZE });
  const items = data?.content ?? [];

  // Updates one filter in the URL; any filter change sends the user back to the first page
  const updateParam = (key: string, value?: string) =>
    setParams((p) => {
      if (value) p.set(key, value); else p.delete(key);
      if (key !== "page") p.delete("page");
      return p;
    });

  // debounce the search box into the URL
  useEffect(() => {
    const t = setTimeout(() => {
      setParams((p) => {
        if ((p.get("q") ?? "") === text) return p;
        if (text) p.set("q", text); else p.delete("q");
        p.delete("page");
        return p;
      }, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [text, setParams]);

  return (
    <div className="space-y-8 pt-6 sm:space-y-12 sm:pt-10">
      <section className="space-y-4 rounded-3xl bg-forest p-4 sm:space-y-5 sm:rounded-[2.5rem] sm:p-8">
        <div className="beige-surface relative rounded-full">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search dishes"
            className="h-12 w-full rounded-full bg-transparent pl-12 pr-5 sm:h-14 placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-sage" />
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0">
          <button onClick={() => updateParam("type")} className={chip(!type)}>All</button>
          {ITEM_TYPES.map((t) => (
            <button key={t} onClick={() => updateParam("type", t)} className={chip(type === t)}>
              {ITEM_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-olive">FULL MENU</p>
            <h2 className="mt-2 text-3xl font-medium sm:text-4xl">All food and drinks</h2>
          </div>
          <div className="flex items-center gap-3">
            <select value={sort} onChange={(e) => updateParam("sort", e.target.value)} aria-label="Sort dishes"
              className="h-10 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-sm font-semibold sm:flex-none">
              {Object.entries(SORT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <span className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-bold">{data?.totalElements ?? 0} items</span>
          </div>
        </div>

        <ItemGrid items={items} isLoading={isLoading} isError={isError}
          emptyText="No dishes match your search. Try another category." />
        <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={(p) => updateParam("page", String(p))} />
      </section>
    </div>
  );
}
