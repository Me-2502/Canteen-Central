import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useMenu } from "@/features/menu/useMenu";

export default function AdminPage() {
  const { data = [], isLoading } = useMenu();
  const qc = useQueryClient();
  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/menu/${id}`),
    onSuccess: () => { toast.success("Item deleted"); qc.invalidateQueries({ queryKey: ["menu"] }); },
    onError: () => toast.error("Could not delete the item."),
  });

  return (
    <div className="pt-10">
      <h1 className="mb-6 text-4xl font-medium">Manage menu</h1>
      {isLoading && <p>Loading...</p>}
      <table className="w-full overflow-hidden rounded-2xl border border-sage text-left text-sm">
        <thead className="bg-cream"><tr>
          <th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3" />
        </tr></thead>
        <tbody>
          {data.map((i) => (
            <tr key={i.id} className="border-t border-sage/60">
              <td className="p-3 font-semibold">{i.name}</td>
              <td className="p-3">{i.category}</td>
              <td className="p-3">${i.price.toFixed(2)}</td>
              <td className="p-3 text-right">
                <button aria-label={`Delete ${i.name}`} onClick={() => remove.mutate(i.id)}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
