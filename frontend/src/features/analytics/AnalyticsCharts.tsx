import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import { cn, formatPrice } from "@/lib/utils";
import { formatCompactPrice, formatDay, formatHour, ORDER_TYPE_LABELS, STATUS_LABELS } from "./format";
import type { CanteenAnalytics, OrderStatus } from "./types";

/** Tooltip row for money values; the default row prints raw numbers. */
const moneyRow = (value: unknown, label: React.ReactNode, colorVar: string) => (
  <>
    <span className="size-2.5 shrink-0 rounded-[2px]" style={{ background: `var(${colorVar})` }} />
    <span className="text-muted-foreground">{label}</span>
    <span className="ml-auto font-mono font-medium text-foreground tabular-nums">{formatPrice(Number(value))}</span>
  </>
);

function ChartCard({ title, description, action, className, children }: {
  title: string; description: string; action?: React.ReactNode; className?: string; children: React.ReactNode;
}) {
  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1.5">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const EmptyChart = ({ message = "No orders in this period yet." }: { message?: string }) => (
  <div className="grid h-[240px] place-items-center rounded-xl bg-muted/50 text-sm text-muted-foreground">{message}</div>
);

const trendConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-2)" },
} satisfies ChartConfig;

type TrendMetric = keyof typeof trendConfig;

/** Revenue or order count per day, switchable from the card header. */
export function TrendChart({ data }: { data: CanteenAnalytics }) {
  const [metric, setMetric] = useState<TrendMetric>("revenue");
  const totals = { revenue: formatPrice(data.summary.revenue), orders: data.summary.orders.toLocaleString() };

  return (
    <ChartCard title="Sales trend" description={`Daily ${metric} over the last ${data.days} days`}
      action={
        <div className="flex overflow-hidden rounded-xl border border-border">
          {(Object.keys(trendConfig) as TrendMetric[]).map((key) => (
            <button key={key} onClick={() => setMetric(key)} aria-pressed={metric === key}
              className={cn("px-4 py-2 text-left transition-colors", metric === key ? "bg-secondary text-secondary-foreground" : "hover:bg-muted")}>
              <span className="block text-xs text-muted-foreground">{trendConfig[key].label}</span>
              <span className="block font-semibold tabular-nums">{totals[key]}</span>
            </button>
          ))}
        </div>
      }>
      <ChartContainer config={trendConfig} className="aspect-auto h-[280px] w-full">
        <AreaChart data={data.daily} margin={{ left: 4, right: 12, top: 8 }}>
          <defs>
            <linearGradient id={`fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={`var(--color-${metric})`} stopOpacity={0.5} />
              <stop offset="95%" stopColor={`var(--color-${metric})`} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} tickFormatter={formatDay} />
          <YAxis width={48} tickLine={false} axisLine={false} allowDecimals={metric === "revenue"}
            tickFormatter={(v: number) => (metric === "revenue" ? formatCompactPrice(v) : v.toLocaleString())} />
          <ChartTooltip cursor={false}
            content={
              <ChartTooltipContent indicator="dot" labelFormatter={(_, payload) => formatDay(payload?.[0]?.payload?.date ?? "")}
                formatter={metric === "revenue" ? (v) => moneyRow(v, "Revenue", "--color-revenue") : undefined} />
            } />
          <Area dataKey={metric} type="monotone" stroke={`var(--color-${metric})`} strokeWidth={2} fill={`url(#fill-${metric})`} />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}

const hourlyConfig = { orders: { label: "Orders", color: "var(--chart-2)" } } satisfies ChartConfig;

/** Orders by hour of day, to plan staffing and prep around the rush. */
export function HourlyChart({ data }: { data: CanteenAnalytics }) {
  const hasOrders = data.hourly.some((h) => h.orders > 0);
  // Trim the quiet hours at either end so the busy part of the day is readable
  const first = data.hourly.findIndex((h) => h.orders > 0);
  const last = data.hourly.length - 1 - [...data.hourly].reverse().findIndex((h) => h.orders > 0);
  const hours = hasOrders ? data.hourly.slice(Math.max(first - 1, 0), Math.min(last + 2, 24)) : [];

  return (
    <ChartCard title="Peak hours" description="When orders come in">
      {hasOrders ? (
        <ChartContainer config={hourlyConfig} className="aspect-auto h-[240px] w-full">
          <BarChart data={hours} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={formatHour} />
            <YAxis width={32} tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip cursor={false}
              content={<ChartTooltipContent labelFormatter={(_, payload) => formatHour(payload?.[0]?.payload?.hour ?? 0)} />} />
            <Bar dataKey="orders" fill="var(--color-orders)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      ) : <EmptyChart />}
    </ChartCard>
  );
}

const typeConfig = {
  orders: { label: "Orders" },
  DINE_IN: { label: ORDER_TYPE_LABELS.DINE_IN, color: "var(--chart-1)" },
  PICKUP: { label: ORDER_TYPE_LABELS.PICKUP, color: "var(--chart-3)" },
  DELIVERY: { label: ORDER_TYPE_LABELS.DELIVERY, color: "var(--chart-4)" },
} satisfies ChartConfig;

/** Share of dine-in, pickup and delivery orders. */
export function OrderTypeChart({ data }: { data: CanteenAnalytics }) {
  const slices = data.orderTypes.map((t) => ({ ...t, fill: `var(--color-${t.type})` }));
  const total = data.summary.orders;

  return (
    <ChartCard title="Order types" description="How customers get their food">
      {total > 0 ? (
        <ChartContainer config={typeConfig} className="mx-auto aspect-square h-[240px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="type" hideLabel />} />
            <Pie data={slices} dataKey="orders" nameKey="type" innerRadius={62} strokeWidth={4} stroke="var(--card)">
              <Label content={({ viewBox }) =>
                viewBox && "cx" in viewBox && "cy" in viewBox ? (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-semibold">{total.toLocaleString()}</tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 22} className="fill-muted-foreground text-xs">orders</tspan>
                  </text>
                ) : null
              } />
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="type" />} />
          </PieChart>
        </ChartContainer>
      ) : <EmptyChart />}
    </ChartCard>
  );
}

const STATUS_ORDER: OrderStatus[] = ["PLACED", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

const statusConfig = {
  count: { label: "Orders" },
  PLACED: { label: STATUS_LABELS.PLACED, color: "var(--chart-3)" },
  CONFIRMED: { label: STATUS_LABELS.CONFIRMED, color: "var(--chart-3)" },
  PREPARING: { label: STATUS_LABELS.PREPARING, color: "var(--chart-2)" },
  READY: { label: STATUS_LABELS.READY, color: "var(--chart-2)" },
  COMPLETED: { label: STATUS_LABELS.COMPLETED, color: "var(--chart-1)" },
  CANCELLED: { label: STATUS_LABELS.CANCELLED, color: "var(--chart-5)" },
} satisfies ChartConfig;

/** Where orders currently stand, including cancellations. */
export function StatusChart({ data }: { data: CanteenAnalytics }) {
  const counts = new Map(data.statuses.map((s) => [s.status, s.count]));
  const rows = STATUS_ORDER.map((status) => ({ status, count: counts.get(status) ?? 0, fill: `var(--color-${status})` }));
  const hasOrders = rows.some((r) => r.count > 0);

  return (
    <ChartCard title="Order status" description="Current state of orders in this period">
      {hasOrders ? (
        <ChartContainer config={statusConfig} className="aspect-auto h-[240px] w-full">
          <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" dataKey="count" hide allowDecimals={false} />
            <YAxis type="category" dataKey="status" width={84} tickLine={false} axisLine={false}
              tickFormatter={(s: OrderStatus) => STATUS_LABELS[s]} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="status" hideLabel />} />
            <Bar dataKey="count" radius={6} />
          </BarChart>
        </ChartContainer>
      ) : <EmptyChart />}
    </ChartCard>
  );
}

const itemsConfig = { revenue: { label: "Revenue", color: "var(--chart-2)" } } satisfies ChartConfig;

/** Best sellers by revenue. */
export function TopItemsChart({ data }: { data: CanteenAnalytics }) {
  return (
    <ChartCard title="Best sellers" description="Top items by revenue">
      {data.topItems.length > 0 ? (
        <ChartContainer config={itemsConfig} className="aspect-auto h-[280px] w-full">
          <BarChart data={data.topItems} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" dataKey="revenue" tickLine={false} axisLine={false} tickFormatter={formatCompactPrice} />
            <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false}
              tickFormatter={(name: string) => (name.length > 14 ? `${name.slice(0, 13)}…` : name)} />
            <ChartTooltip cursor={false}
              content={<ChartTooltipContent formatter={(v) => moneyRow(v, "Revenue", "--color-revenue")} />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={6} />
          </BarChart>
        </ChartContainer>
      ) : <EmptyChart message="No items sold in this period yet." />}
    </ChartCard>
  );
}
