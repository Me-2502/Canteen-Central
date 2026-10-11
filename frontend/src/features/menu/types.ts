export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  rating: number;
  vegetarian: boolean;
  offer?: string;
  prepTime?: string;
}

export const CATEGORIES = [
  "All", "Breakfast", "Snacks", "Fast Food", "Lunch", "Dessert", "Global Cuisine", "South Indian", "Beverages",
];
