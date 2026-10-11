import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PageResponse } from "@/lib/api";
import type { Item, ItemFilters, ItemInput } from "./types";

// Everything item-related lives under ["items"] so a single invalidation refreshes it all
export const itemKeys = {
  all: ["items"] as const,
  list: (filters: ItemFilters) => ["items", "list", filters] as const,
  detail: (id: string) => ["items", "detail", id] as const,
};

export function useItems({ canteenId, ...params }: ItemFilters) {
  const url = canteenId ? `/public/canteens/${canteenId}/items` : "/public/items";
  return useQuery({
    queryKey: itemKeys.list({ canteenId, ...params }),
    queryFn: async () => (await api.get<ApiResponse<PageResponse<Item>>>(url, { params })).data.data,
    placeholderData: keepPreviousData,
  });
}

export function useItem(itemId: string) {
  return useQuery({
    queryKey: itemKeys.detail(itemId),
    queryFn: async () => (await api.get<ApiResponse<Item>>(`/public/items/${itemId}`)).data.data,
    enabled: !!itemId,
  });
}

export function useCreateItem(canteenId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ItemInput) => api.post(`/canteens/${canteenId}/items`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.all }),
  });
}

export function useUpdateItem(canteenId: string, itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ItemInput) => api.put(`/canteens/${canteenId}/items/${itemId}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.all }),
  });
}

export function useDeleteItem(canteenId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.delete(`/canteens/${canteenId}/items/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: itemKeys.all }),
  });
}
