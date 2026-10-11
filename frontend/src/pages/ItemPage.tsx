import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusMessage } from "@/components/shared/StatusMessage";
import { usePermissions } from "@/features/auth/usePermissions";
import { useItem } from "@/features/menu/useItems";
import { ItemReadView } from "@/features/menu/ItemReadView";
import { ItemManageView } from "@/features/menu/ItemManageView";

export default function ItemPage() {
  const { itemId = "" } = useParams();
  const { data: item, isLoading, isError } = useItem(itemId);
  const { canManage, isLoading: permissionsLoading } = usePermissions(item?.canteenId);

  if (isLoading || permissionsLoading) return <Skeleton className="mt-10 aspect-[2/1] rounded-[2.5rem]" />;
  if (isError || !item) {
    return <StatusMessage title="Dish not found">It may have been removed from the menu.</StatusMessage>;
  }

  return canManage ? <ItemManageView item={item} /> : <ItemReadView item={item} />;
}
