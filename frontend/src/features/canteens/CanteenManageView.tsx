import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { LayoutGrid, List, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/Pagination";
import { getErrorMessage } from "@/lib/api";
import { usePermissions } from "@/features/auth/usePermissions";
import { ItemForm } from "@/features/menu/ItemForm";
import { ItemGrid } from "@/features/menu/ItemGrid";
import { PriceTag } from "@/features/menu/ItemMeta";
import { useCreateItem, useDeleteItem, useItems } from "@/features/menu/useItems";
import { ITEM_TYPE_LABELS, type Item, type ItemInput } from "@/features/menu/types";
import { CanteenForm } from "./CanteenForm";
import { CanteenHeader } from "./CanteenHeader";
import { useUpdateCanteen } from "./useCanteens";
import type { Canteen, CanteenInput } from "./types";

/** What admins and this canteen's owner see. Each section is gated by its own permission. */
export function CanteenManageView({ canteen }: { canteen: Canteen }) {
  const { canWriteCanteen, canWriteMenu } = usePermissions(canteen.id);
  const [editingCanteen, setEditingCanteen] = useState(false);
  const updateCanteen = useUpdateCanteen(canteen.id);

  const onSaveCanteen = (values: CanteenInput) =>
    updateCanteen.mutate(values, {
      onSuccess: () => { toast.success("Canteen updated"); setEditingCanteen(false); },
      onError: (e) => toast.error(getErrorMessage(e, "Could not update the canteen.")),
    });

  return (
    <div className="space-y-12 pt-10">
      <p className="inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-bold tracking-widest">MANAGER VIEW</p>

      {editingCanteen ? (
        <section className="rounded-[2rem] border border-border p-8">
          <h2 className="mb-6 text-3xl font-medium">Edit canteen details</h2>
          <CanteenForm canteen={canteen} isPending={updateCanteen.isPending}
            onSubmit={onSaveCanteen} onCancel={() => setEditingCanteen(false)} />
        </section>
      ) : (
        <CanteenHeader canteen={canteen} actions={canWriteCanteen && (
          <Button onClick={() => setEditingCanteen(true)} className="rounded-full bg-sage text-forest hover:bg-sage/90">
            <Pencil size={14} /> Edit details
          </Button>
        )} />
      )}

      <ManageItems canteenId={canteen.id} canEdit={canWriteMenu} />
    </div>
  );
}

type ItemsView = "table" | "cards";

const viewButton = (active: boolean) =>
  `grid size-9 place-items-center rounded-full transition-colors ${active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`;

function ManageItems({ canteenId, canEdit }: { canteenId: string; canEdit: boolean }) {
  const [page, setPage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [view, setView] = useState<ItemsView>("table");
  const { data, isLoading, isError } = useItems({ canteenId, sort: "NEWEST", page, size: 50 });
  const createItem = useCreateItem(canteenId);
  const deleteItem = useDeleteItem(canteenId);

  const onCreate = (values: ItemInput) =>
    createItem.mutate(values, {
      onSuccess: () => { toast.success("Item added"); setAdding(false); },
      onError: (e) => toast.error(getErrorMessage(e, "Could not add the item.")),
    });

  const onDelete = (item: Item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    deleteItem.mutate(item.id, {
      onSuccess: () => toast.success("Item deleted"),
      onError: (e) => toast.error(getErrorMessage(e, "Could not delete the item.")),
    });
  };

  const items = data?.content ?? [];

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-olive">MENU</p>
          <h2 className="mt-2 text-4xl font-medium">Items ({data?.totalElements ?? 0})</h2>
        </div>
        <div className="flex items-center gap-3">
          <div role="group" aria-label="Items view" className="flex gap-1 rounded-full border border-border bg-card p-1">
            <button onClick={() => setView("table")} aria-pressed={view === "table"} aria-label="Table view" className={viewButton(view === "table")}>
              <List size={16} />
            </button>
            <button onClick={() => setView("cards")} aria-pressed={view === "cards"} aria-label="Card view" className={viewButton(view === "cards")}>
              <LayoutGrid size={16} />
            </button>
          </div>
          {canEdit && !adding && (
            <Button onClick={() => setAdding(true)} className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90">
              <Plus size={16} /> Add item
            </Button>
          )}
        </div>
      </div>

      {adding && (
        <div className="mb-8 rounded-[2rem] border border-border p-8">
          <h3 className="mb-6 text-2xl font-medium">New item</h3>
          <ItemForm submitLabel="Add item" isPending={createItem.isPending}
            onSubmit={onCreate} onCancel={() => setAdding(false)} />
        </div>
      )}

      {view === "cards" ? (
        <ItemGrid items={items} isLoading={isLoading} isError={isError} showCanteen={false} emptyText="No items yet." />
      ) : (
        <>
          {isLoading && <p>Loading items...</p>}
          {isError && <p className="text-destructive">Could not load the items.</p>}
          {!isLoading && !isError && items.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">No items yet.</p>
          )}
          {items.length > 0 && (
            <ItemsTable items={items} canEdit={canEdit} onDelete={onDelete} isDeleting={deleteItem.isPending} />
          )}
        </>
      )}
      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={setPage} />
    </section>
  );
}

interface ItemsTableProps {
  items: Item[];
  canEdit: boolean;
  onDelete: (item: Item) => void;
  isDeleting: boolean;
}

function ItemsTable({ items, canEdit, onDelete, isDeleting }: ItemsTableProps) {
  return (
    <div className="beige-surface overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted dark:bg-sage">
          <tr>
            <th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Price</th>
            <th className="p-3">Orders</th><th className="p-3">Rating</th>
            {canEdit && <th className="p-3" />}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-border">
              <td className="p-3 font-semibold">
                <Link to={`/items/${item.id}`} className="hover:underline">{item.name}</Link>
              </td>
              <td className="p-3">{ITEM_TYPE_LABELS[item.type]}</td>
              <td className="p-3"><PriceTag item={item} /></td>
              <td className="p-3">{item.orderCount}</td>
              <td className="p-3">{item.ratingCount > 0 ? `${item.rating.toFixed(1)} (${item.ratingCount})` : "—"}</td>
              {canEdit && (
                <td className="p-3">
                  <div className="flex justify-end gap-3">
                    <Link to={`/items/${item.id}`} aria-label={`Edit ${item.name}`}><Pencil size={16} /></Link>
                    <button onClick={() => onDelete(item)} disabled={isDeleting}
                      aria-label={`Delete ${item.name}`} className="text-destructive disabled:opacity-40">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
