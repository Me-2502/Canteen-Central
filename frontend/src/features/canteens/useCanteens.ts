import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PageResponse } from "@/lib/api";
import { itemKeys } from "@/features/menu/useItems";
import type { Canteen, CanteenInput, OwnedCanteen } from "./types";

export const canteenKeys = {
  all: ["canteens"] as const,
  list: (keyword: string, page: number) => ["canteens", "list", keyword, page] as const,
  detail: (id: string) => ["canteens", "detail", id] as const,
  owned: ["canteens", "owned"] as const,
};

export function useCanteens(keyword = "", page = 0) {
  return useQuery({
    queryKey: canteenKeys.list(keyword, page),
    queryFn: async () =>
      (await api.get<ApiResponse<PageResponse<Canteen>>>("/public/canteens", {
        params: { keyword: keyword || undefined, page, size: 12 },
      })).data.data,
    placeholderData: keepPreviousData,
  });
}

export function useCanteen(canteenId: string) {
  return useQuery({
    queryKey: canteenKeys.detail(canteenId),
    queryFn: async () => (await api.get<ApiResponse<Canteen>>(`/public/canteens/${canteenId}`)).data.data,
    enabled: !!canteenId,
  });
}

/** Canteens owned by the signed-in user. Pass enabled=false for users without the OWNER role. */
export function useOwnedCanteens(enabled = true) {
  return useQuery({
    queryKey: canteenKeys.owned,
    queryFn: async () => (await api.get<ApiResponse<OwnedCanteen[]>>("/owner/canteens")).data.data,
    enabled,
  });
}

export function useUpdateCanteen(canteenId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CanteenInput) => api.put(`/canteens/${canteenId}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: canteenKeys.all });
      // items carry the canteen name, so refresh them too
      qc.invalidateQueries({ queryKey: itemKeys.all });
    },
  });
}
