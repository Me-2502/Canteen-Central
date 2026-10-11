import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PageResponse } from "@/lib/api";
import { canteenKeys } from "@/features/canteens/useCanteens";
import { itemKeys } from "@/features/menu/useItems";
import type { ManagedCanteen, Order, OrderStatus } from "./types";

/** "current" = still being worked on, "previous" = completed or cancelled. */
export type OrderScope = "current" | "previous";

const PAGE_SIZE = 10;

export const orderKeys = {
  all: ["orders"] as const,
  mine: (scope: OrderScope, page: number) => ["orders", "mine", scope, page] as const,
  canteen: (canteenId: string, scope: OrderScope, page: number) => ["orders", "canteen", canteenId, scope, page] as const,
  managedCanteens: ["orders", "managed-canteens"] as const,
};

const params = (scope: OrderScope, page: number) => ({ active: scope === "current", page, size: PAGE_SIZE });

export function useMyOrders(scope: OrderScope, page: number) {
  return useQuery({
    queryKey: orderKeys.mine(scope, page),
    queryFn: async () =>
      (await api.get<ApiResponse<PageResponse<Order>>>("/orders/my", { params: params(scope, page) })).data.data,
    placeholderData: keepPreviousData,
  });
}

/** Canteens whose orders the user works on. Pass enabled=false for pure customers, who have none. */
export function useManagedCanteens(enabled: boolean) {
  return useQuery({
    queryKey: orderKeys.managedCanteens,
    queryFn: async () => (await api.get<ApiResponse<ManagedCanteen[]>>("/orders/my/canteens")).data.data,
    enabled,
  });
}

export function useCanteenOrders(canteenId: string | undefined, scope: OrderScope, page: number) {
  return useQuery({
    queryKey: orderKeys.canteen(canteenId ?? "", scope, page),
    queryFn: async () =>
      (await api.get<ApiResponse<PageResponse<Order>>>(`/orders/canteen/${canteenId}`, { params: params(scope, page) })).data.data,
    enabled: !!canteenId,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      api.put(`/orders/${orderId}/status`, null, { params: { status } }),
    // A status change can move the order between the current and previous lists
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useRateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, rating }: { orderId: string; rating: number }) =>
      api.put(`/orders/${orderId}/rate`, null, { params: { rating } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
      // ratings feed into canteen and item scores
      qc.invalidateQueries({ queryKey: canteenKeys.all });
      qc.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}
