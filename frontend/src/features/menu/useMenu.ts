import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MenuItem } from "./types";

const mock: MenuItem[] = [
  { id: 1, name: "Garden grain bowl", description: "Herbed rice, greens, chickpeas, corn and house dressing.", price: 8.5, category: "Lunch", rating: 4.8, vegetarian: true, offer: "10% OFF", prepTime: "8–12 min" },
  { id: 2, name: "Roasted veg sandwich", description: "Toasted sourdough, seasonal vegetables and basil spread.", price: 6.75, category: "Snacks", rating: 4.6, vegetarian: true, offer: "15% OFF", prepTime: "8–12 min" },
  { id: 3, name: "Rustic tomato pasta", description: "Slow-cooked tomato sauce, parmesan and fresh garden herbs.", price: 9.25, category: "Lunch", rating: 4.9, vegetarian: true, offer: "COMBO DEAL", prepTime: "8–12 min" },
  { id: 4, name: "Iced coffee", description: "Cold brew over ice with a splash of milk.", price: 3.5, category: "Beverages", rating: 4.5, vegetarian: true, prepTime: "2–4 min" },
];

export const useMenu = () =>
  useQuery({
    queryKey: ["menu"],
    queryFn: async () =>
      import.meta.env.VITE_USE_MOCK === "true" ? mock : (await api.get<MenuItem[]>("/menu")).data,
  });
