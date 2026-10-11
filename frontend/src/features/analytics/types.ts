import type { ItemType } from "@/features/menu/types";

import type { OrderStatus, OrderType } from "@/features/orders/types";

export type { OrderStatus, OrderType };

/** Mirrors OwnerAnalyticsDto. Revenue and order figures exclude cancelled orders. */
export interface CanteenAnalytics {
  canteenId: string;
  canteenName: string;
  days: number;
  summary: {
    revenue: number;
    previousRevenue: number;
    orders: number;
    previousOrders: number;
    averageOrderValue: number;
    previousAverageOrderValue: number;
    itemsSold: number;
    uniqueCustomers: number;
    cancelledOrders: number;
    menuItems: number;
    menuItemsSold: number;
    rating: number;
    ratingCount: number;
  };
  daily: { date: string; revenue: number; orders: number }[];
  hourly: { hour: number; orders: number }[];
  statuses: { status: OrderStatus; count: number }[];
  orderTypes: { type: OrderType; orders: number; revenue: number }[];
  topItems: { itemId: string; name: string; type: ItemType | null; quantity: number; revenue: number }[];
  recentOrders: {
    id: string;
    receiverName: string | null;
    status: OrderStatus;
    type: OrderType;
    itemCount: number;
    total: number;
    createdAt: string;
  }[];
}
