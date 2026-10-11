import { ArrowDownRight, ArrowUpRight, Clock, CalendarDays, Star, UtensilsCrossed, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatPrice } from "@/lib/utils";
import { formatDay, formatHour, percentChange } from "./format";
import type { CanteenAnalytics } from "./types";

function Delta({ current, previous, days }: { current: number; previous: number; days: number }) {
  const change = percentChange(current, previous);
  if (change === null) {
    return <p className="text-xs text-muted-foreground">No data for the previous {days} days</p>;
  }
  const up = change >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <span className={cn("inline-flex items-center font-semibold", up ? "text-olive" : "text-destructive")}>
        <Icon size={14} />{Math.abs(change).toFixed(1)}%
      </span>
      vs previous {days} days
    </p>
  );
}

function Kpi({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <Card className="gap-2 rounded-2xl">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-medium tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** Headline numbers with change against the previous period of the same length. */
export function KpiCards({ data }: { data: CanteenAnalytics }) {
  const s = data.summary;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi label="Revenue" value={formatPrice(s.revenue)}>
        <Delta current={s.revenue} previous={s.previousRevenue} days={data.days} />
      </Kpi>
      <Kpi label="Orders" value={s.orders.toLocaleString()}>
        <Delta current={s.orders} previous={s.previousOrders} days={data.days} />
      </Kpi>
      <Kpi label="Average order value" value={formatPrice(s.averageOrderValue)}>
        <Delta current={s.averageOrderValue} previous={s.previousAverageOrderValue} days={data.days} />
      </Kpi>
      <Kpi label="Customers" value={s.uniqueCustomers.toLocaleString()}>
        <p className="text-xs text-muted-foreground">{s.itemsSold.toLocaleString()} items sold</p>
      </Kpi>
    </div>
  );
}

function Insight({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

/** Derived, plain-language takeaways: when it's busy, what's not selling, how customers rate it. */
export function InsightStrip({ data }: { data: CanteenAnalytics }) {
  const s = data.summary;
  const busiest = data.hourly.reduce((best, h) => (h.orders > best.orders ? h : best), data.hourly[0]);
  const bestDay = data.daily.reduce((best, d) => (d.revenue > best.revenue ? d : best), data.daily[0]);
  const allOrders = s.orders + s.cancelledOrders;
  const cancelRate = allOrders === 0 ? 0 : (s.cancelledOrders / allOrders) * 100;
  const unsold = Math.max(s.menuItems - s.menuItemsSold, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Insight icon={Clock} label="Busiest hour"
        value={busiest && busiest.orders > 0 ? `${formatHour(busiest.hour)} – ${formatHour((busiest.hour + 1) % 24)}` : "—"}
        hint={busiest && busiest.orders > 0 ? `${busiest.orders} orders` : "No orders yet"} />
      <Insight icon={CalendarDays} label="Best day"
        value={bestDay && bestDay.revenue > 0 ? formatDay(bestDay.date) : "—"}
        hint={bestDay && bestDay.revenue > 0 ? `${formatPrice(bestDay.revenue)} revenue` : "No sales yet"} />
      <Insight icon={XCircle} label="Cancellation rate" value={`${cancelRate.toFixed(1)}%`}
        hint={`${s.cancelledOrders} of ${allOrders} orders`} />
      <Insight icon={UtensilsCrossed} label="Menu items sold" value={`${s.menuItemsSold} of ${s.menuItems}`}
        hint={unsold > 0 ? `${unsold} had no sales` : "Every item sold"} />
      <Insight icon={Star} label="Rating" value={s.ratingCount > 0 ? s.rating.toFixed(1) : "—"}
        hint={`${s.ratingCount} ${s.ratingCount === 1 ? "rating" : "ratings"} all time`} />
    </div>
  );
}
