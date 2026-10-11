import { useState } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "@/components/shared/Pagination";
import { useAuthStore } from "@/features/auth/authStore";
import { useCanteens, useOwnedCanteens } from "@/features/canteens/useCanteens";

/** Entry point for managers: pick a canteen to open its manager view. Admins see every canteen, owners only their own. */
export default function AdminPage() {
  const isAdmin = useAuthStore((s) => s.user?.roles.includes("ADMIN") ?? false);
  const [page, setPage] = useState(0);
  const all = useCanteens("", page);
  const owned = useOwnedCanteens(!isAdmin);

  const { isLoading, isError } = isAdmin ? all : owned;
  const canteens = isAdmin ? all.data?.content : owned.data;

  return (
    <div className="pt-10">
      <h1 className="mb-6 text-4xl font-medium">{isAdmin ? "Manage canteens" : "Your canteens"}</h1>
      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-destructive">Could not load the canteens.</p>}
      {!isLoading && !isError && canteens?.length === 0 && (
        <p className="text-muted-foreground">You don't own any canteens yet.</p>
      )}

      {!!canteens?.length && <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
        {canteens.map((c) => (
          <li key={c.id}>
            <Link to={`/canteens/${c.id}`} className="flex items-center justify-between p-4 hover:bg-muted">
              <span className="font-semibold">{c.name}</span>
              <span className="text-sm text-muted-foreground">{c.address}</span>
            </Link>
          </li>
        ))}
      </ul>}
      {isAdmin && <Pagination page={page} totalPages={all.data?.totalPages ?? 0} onChange={setPage} />}
    </div>
  );
}
