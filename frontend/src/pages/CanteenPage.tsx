import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusMessage } from "@/components/shared/StatusMessage";
import { usePermissions } from "@/features/auth/usePermissions";
import { useCanteen } from "@/features/canteens/useCanteens";
import { CanteenReadView } from "@/features/canteens/CanteenReadView";
import { CanteenManageView } from "@/features/canteens/CanteenManageView";

export default function CanteenPage() {
  const { canteenId = "" } = useParams();
  const { canManage, isLoading: permissionsLoading } = usePermissions(canteenId);
  const { data: canteen, isLoading, isError } = useCanteen(canteenId);

  if (isLoading || permissionsLoading) return <Skeleton className="mt-10 h-80 rounded-[2.5rem]" />;
  if (isError || !canteen) {
    return <StatusMessage title="Canteen not found">It may have been closed or the link is wrong.</StatusMessage>;
  }

  return canManage ? <CanteenManageView canteen={canteen} /> : <CanteenReadView canteen={canteen} />;
}
