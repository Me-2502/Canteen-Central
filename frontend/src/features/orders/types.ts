/** Mirrors OrderStatus on the backend. */
export type OrderStatus = "PLACED" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
export type OrderType = "PICKUP" | "DELIVERY" | "DINE_IN";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  DINE_IN: "Dine-in",
  PICKUP: "Pickup",
  DELIVERY: "Delivery",
};

/** The normal path of an order; CANCELLED can branch off from any step before COMPLETED. */
export const STATUS_FLOW: OrderStatus[] = ["PLACED", "CONFIRMED", "PREPARING", "READY", "COMPLETED"];

/** Mirrors OrderItemDto. Prices are per line (finalPrice already includes quantity and discount). */
export interface OrderItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  finalPrice: number;
}

/** Mirrors OrderDto. */
export interface Order {
  id: string;
  customerId: string;
  canteenId: string;
  canteenName: string;
  status: OrderStatus;
  receiverName: string | null;
  type: OrderType;
  selectedTimeRange: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

/** Canteen the signed-in user works on orders for (only id and name are filled in). */
export interface ManagedCanteen {
  id: string;
  name: string;
}
