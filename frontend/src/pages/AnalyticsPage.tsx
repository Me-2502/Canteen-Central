import { useSearchParams } from "react-router-dom";
import { Store } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api";
import { HourlyChart, OrderTypeChart, StatusChart, TopItemsChart, TrendChart } from "@/features/analytics/AnalyticsCharts";
import { RecentOrdersTable, TopItemsTable } from "@/features/analytics/AnalyticsTables";
import { InsightStrip, KpiCards } from "@/features/analytics/SummaryCards";
import { RANGE_OPTIONS } from "@/features/analytics/format";
import { useCanteenAnalytics } from "@/features/analytics/useAnalytics";
import { useOwnedCanteens } from "@/features/canteens/useCanteens";

const DEFAULT_DAYS = 30;

/** Sales analytics for the canteens the signed-in owner owns. Selection lives in the URL so it survives reloads. */
export default function AnalyticsPage() {
  const [params, setParams] = useSearchParams();
  const canteens = useOwnedCanteens();

  const requestedDays = Number(params.get("days"));
  const days = RANGE_OPTIONS.some((o) => o.days === requestedDays) ? requestedDays : DEFAULT_DAYS;
  const requestedId = params.get("canteen");
  const canteen = canteens.data?.find((c) => c.id === requestedId) ?? canteens.data?.[0];

  const analytics = useCanteenAnalytics(canteen?.id, days);

  const update = (key: "canteen" | "days", value: string) =>
    setParams((p) => { p.set(key, value); return p; }, { replace: true });

  if (canteens.isLoading) return <PageSkeleton />;
  if (canteens.isError) {
    return <Message title="Could not load your canteens">{getErrorMessage(canteens.error)}</Message>;
  }
  if (!canteen) {
    return <Message title="No canteens yet">Analytics will appear here once a canteen is assigned to you.</Message>;
  }

  return (
    <div className="space-y-6 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium">Analytics</h1>
          <p className="mt-2 text-muted-foreground">How {canteen.name} is doing, and where to focus next.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canteens.data!.length > 1 && (
            <Select value={canteen.id} onValueChange={(v) => update("canteen", v)}>
              <SelectTrigger className="h-10 min-w-48 rounded-full border-border bg-card px-4" aria-label="Canteen">
                <Store size={16} /><SelectValue />
              </SelectTrigger>
              <SelectContent>
                {canteens.data!.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Select value={String(days)} onValueChange={(v) => update("days", v)}>
            <SelectTrigger className="h-10 rounded-full border-border bg-card px-4" aria-label="Date range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((o) => <SelectItem key={o.days} value={String(o.days)}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {analytics.isError && <p className="text-destructive">{getErrorMessage(analytics.error, "Could not load analytics.")}</p>}
      {!analytics.data ? (analytics.isLoading && <DashboardSkeleton />) : (
        <div className={analytics.isPlaceholderData ? "space-y-6 opacity-60 transition-opacity" : "space-y-6 transition-opacity"}>
          <KpiCards data={analytics.data} />
          <TrendChart data={analytics.data} />
          <InsightStrip data={analytics.data} />
          <div className="grid gap-6 lg:grid-cols-3">
            <HourlyChart data={analytics.data} />
            <OrderTypeChart data={analytics.data} />
            <StatusChart data={analytics.data} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <TopItemsChart data={analytics.data} />
            <TopItemsTable data={analytics.data} />
          </div>
          <RecentOrdersTable data={analytics.data} />
        </div>
      )}
    </div>
  );
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-24 text-center">
      <h1 className="text-4xl font-medium">{title}</h1>
      <p className="mt-3 text-muted-foreground">{children}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6 pt-10">
      <Skeleton className="h-10 w-48" />
      <DashboardSkeleton />
    </div>
  );
}
