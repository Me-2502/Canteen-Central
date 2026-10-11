import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { CanteenAnalytics } from "./types";

export const analyticsKeys = {
  canteen: (canteenId: string, days: number) => ["owner", "analytics", canteenId, days] as const,
};

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

/** Analytics for one owned canteen, bucketed by day in the browser's time zone. */
export function useCanteenAnalytics(canteenId: string | undefined, days: number) {
  return useQuery({
    queryKey: analyticsKeys.canteen(canteenId ?? "", days),
    queryFn: async () =>
      (await api.get<ApiResponse<CanteenAnalytics>>(`/owner/canteens/${canteenId}/analytics`, {
        params: { days, tz: timeZone },
      })).data.data,
    enabled: !!canteenId,
    placeholderData: keepPreviousData,
  });
}
