import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ITEM_TYPE_LABELS } from "@/features/menu/types";
import { formatPrice } from "@/lib/utils";
import { formatDateTime, ORDER_TYPE_LABELS, STATUS_LABELS } from "./format";
import type { CanteenAnalytics, OrderStatus } from "./types";

const statusVariant: Record<OrderStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  PLACED: "outline",
  CONFIRMED: "outline",
  PREPARING: "secondary",
  READY: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

function TableCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-xl bg-muted/50 py-10 text-center text-sm text-muted-foreground">{children}</p>
);

/** Units, revenue and share of total revenue for the best-selling items. */
export function TopItemsTable({ data }: { data: CanteenAnalytics }) {
  const revenue = data.summary.revenue;
  return (
    <TableCard title="Item performance" description="Units sold and share of revenue">
      {data.topItems.length === 0 ? <Empty>No items sold in this period yet.</Empty> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="w-32">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.topItems.map((item) => {
              const share = revenue === 0 ? 0 : (item.revenue / revenue) * 100;
              return (
                <TableRow key={item.itemId}>
                  <TableCell>
                    <span className="block font-medium">{item.name}</span>
                    {item.type && <span className="text-xs text-muted-foreground">{ITEM_TYPE_LABELS[item.type]}</span>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{item.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(item.revenue)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-chart-2" style={{ width: `${share}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{share.toFixed(0)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </TableCard>
  );
}

/** Latest orders in the period, newest first. */
export function RecentOrdersTable({ data }: { data: CanteenAnalytics }) {
  return (
    <TableCard title="Recent orders" description="The latest orders in this period">
      {data.recentOrders.length === 0 ? <Empty>No orders in this period yet.</Empty> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.recentOrders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.receiverName || "Guest"}</TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(o.createdAt)}</TableCell>
                <TableCell>{ORDER_TYPE_LABELS[o.type]}</TableCell>
                <TableCell><Badge variant={statusVariant[o.status]}>{STATUS_LABELS[o.status]}</Badge></TableCell>
                <TableCell className="text-right tabular-nums">{o.itemCount}</TableCell>
                <TableCell className="text-right tabular-nums">{formatPrice(o.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableCard>
  );
}
