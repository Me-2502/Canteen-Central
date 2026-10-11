import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { BagSheet } from "@/features/cart/BagSheet";
import { RoleRoute } from "@/routes/guards";
import HomePage from "@/pages/HomePage";
import MenuPage from "@/pages/MenuPage";
import AuthPage from "@/pages/AuthPage";
import CanteenPage from "@/pages/CanteenPage";
import ItemPage from "@/pages/ItemPage";
import OrdersPage from "@/pages/OrdersPage";
import AdminPage from "@/features/admin/AdminPage";

function Layout() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20"><Outlet /></main>
      <BagSheet />
    </>
  );
}

const router = createBrowserRouter([
  { path: "/auth", element: <AuthPage /> },
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/menu", element: <MenuPage /> },
      { path: "/canteens/:canteenId", element: <CanteenPage /> },
      { path: "/items/:itemId", element: <ItemPage /> },
      {
        element: <RoleRoute />,
        children: [{ path: "/orders", element: <OrdersPage /> }],
      },
      {
        element: <RoleRoute allow={["ADMIN", "OWNER"]} />,
        children: [{ path: "/canteens", element: <AdminPage /> }],
      },
      {
        element: <RoleRoute allow={["OWNER"]} />,
        children: [
          // Lazy so recharts only downloads for owners
          { path: "/analytics", lazy: async () => ({ Component: (await import("@/pages/AnalyticsPage")).default }) },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
