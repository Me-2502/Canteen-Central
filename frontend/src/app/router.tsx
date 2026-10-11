import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { BagSheet } from "@/features/cart/BagSheet";
import { RoleRoute } from "@/routes/guards";
import HomePage from "@/pages/HomePage";
import MenuPage from "@/pages/MenuPage";
import AuthPage from "@/pages/AuthPage";
import AdminPage from "@/features/admin/AdminPage";
import OwnerPage from "@/features/owner/OwnerPage";

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
      {
        element: <RoleRoute allow={["ADMIN", "OWNER"]} />,
        children: [{ path: "/admin", element: <AdminPage /> }],
      },
      {
        element: <RoleRoute allow={["OWNER"]} />,
        children: [{ path: "/owner", element: <OwnerPage /> }],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
