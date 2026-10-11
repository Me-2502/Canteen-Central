import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api";
import { usePermissions } from "@/features/auth/usePermissions";
import { ItemDetails } from "./ItemDetails";
import { ItemForm, toItemFormValues } from "./ItemForm";
import { useDeleteItem, useUpdateItem } from "./useItems";
import type { Item, ItemInput } from "./types";

/** What admins and the owner of the item's canteen see. Editing the item itself needs menu:write. */
export function ItemManageView({ item }: { item: Item }) {
  const { canWriteMenu } = usePermissions(item.canteenId);
  const navigate = useNavigate();
  const updateItem = useUpdateItem(item.canteenId, item.id);
  const deleteItem = useDeleteItem(item.canteenId);

  const onSave = (values: ItemInput) =>
    updateItem.mutate(values, {
      onSuccess: () => toast.success("Item updated"),
      onError: (e) => toast.error(getErrorMessage(e, "Could not update the item.")),
    });

  const onDelete = () => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    deleteItem.mutate(item.id, {
      onSuccess: () => {
        toast.success("Item deleted");
        navigate(`/canteens/${item.canteenId}`, { replace: true });
      },
      onError: (e) => toast.error(getErrorMessage(e, "Could not delete the item.")),
    });
  };

  return (
    <div className="space-y-12 pt-10">
      <p className="inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-bold tracking-widest">MANAGER VIEW</p>

      <ItemDetails item={item} />

      {canWriteMenu ? (
        <section className="rounded-[2rem] border border-border p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-3xl font-medium">Edit item</h2>
            <Button variant="outline" onClick={onDelete} disabled={deleteItem.isPending}
              className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10">
              <Trash2 size={14} /> {deleteItem.isPending ? "Deleting..." : "Delete item"}
            </Button>
          </div>
          {/* key resets the form when navigating to another item */}
          <ItemForm key={item.id} defaultValues={toItemFormValues(item)}
            submitLabel="Save changes" isPending={updateItem.isPending} onSubmit={onSave} />
        </section>
      ) : (
        <p className="rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
          You can manage this canteen, but you do not have permission to edit menu items.
        </p>
      )}
    </div>
  );
}
