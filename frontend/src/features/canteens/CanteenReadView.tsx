import { useState } from "react";
import { Pagination } from "@/components/shared/Pagination";
import { ItemGrid } from "@/features/menu/ItemGrid";
import { useItems } from "@/features/menu/useItems";
import { CanteenHeader } from "./CanteenHeader";
import type { Canteen } from "./types";

/** What customers and signed-out visitors see. */
export function CanteenReadView({ canteen }: { canteen: Canteen }) {
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useItems({ canteenId: canteen.id, page, size: 12 });

  return (
    <div className="space-y-12 pt-10">
      <CanteenHeader canteen={canteen} />

      <section>
        <div className="mb-6">
          <p className="text-xs font-bold tracking-widest text-olive">MENU</p>
          <h2 className="mt-2 text-4xl font-medium">What's cooking at {canteen.name}</h2>
        </div>
        <ItemGrid items={data?.content ?? []} isLoading={isLoading} isError={isError} showCanteen={false}
          emptyText="This canteen has not added any dishes yet." />
        <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={setPage} />
      </section>
    </div>
  );
}
