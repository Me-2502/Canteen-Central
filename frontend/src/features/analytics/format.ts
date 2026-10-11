export { ORDER_TYPE_LABELS, STATUS_LABELS } from "@/features/orders/types";

export const RANGE_OPTIONS = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
] as const;

const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });

/** Short currency for chart axes, e.g. $1.2K. */
export const formatCompactPrice = (amount: number) => `$${compact.format(amount)}`;

/** The backend sends days as yyyy-MM-dd in the owner's time zone; parse them as local dates. */
export const parseDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const formatDay = (day: string) =>
  parseDay(day).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export const formatHour = (hour: number) => {
  const h = hour % 12 || 12;
  return `${h}${hour < 12 ? "am" : "pm"}`;
};

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** Percentage change from the previous period, or null when there is nothing to compare against. */
export const percentChange = (current: number, previous: number) =>
  previous === 0 ? null : ((current - previous) / previous) * 100;
