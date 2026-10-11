/** Mirrors ItemType on the backend. */
export type ItemType = "FOOD" | "SNACK" | "BEVERAGE" | "COMBO" | "OTHER";

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  FOOD: "Food",
  SNACK: "Snacks",
  BEVERAGE: "Beverages",
  COMBO: "Combos",
  OTHER: "Other",
};

export const ITEM_TYPES = Object.keys(ITEM_TYPE_LABELS) as ItemType[];

/** Mirrors ItemSortType on the backend. */
export type ItemSort = "POPULAR" | "RATING" | "PRICE_LOW_TO_HIGH" | "PRICE_HIGH_TO_LOW" | "NEWEST";

export const SORT_LABELS: Record<ItemSort, string> = {
  POPULAR: "Most popular",
  RATING: "Top rated",
  PRICE_LOW_TO_HIGH: "Price: low to high",
  PRICE_HIGH_TO_LOW: "Price: high to low",
  NEWEST: "Newest",
};

/** Item as returned by the /public endpoints. `discount` is an amount, not a percentage. */
export interface Item {
  id: string;
  name: string;
  description: string | null;
  type: ItemType;
  measure: number;
  imageUrl: string | null;
  unitPrice: number;
  discount: number;
  finalPrice: number;
  rating: number;
  ratingCount: number;
  orderCount: number;
  canteenId: string;
  canteenName: string;
}

/** Body for creating or updating an item (ItemDto on the backend). */
export interface ItemInput {
  name: string;
  description?: string;
  type: ItemType;
  measure: number;
  imageUrl?: string;
  unitPrice: number;
  discount: number;
}

export interface ItemFilters {
  canteenId?: string;
  keyword?: string;
  type?: ItemType;
  sort?: ItemSort;
  page?: number;
  size?: number;
}
