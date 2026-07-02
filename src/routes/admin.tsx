import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { getToken, getRole } from "@/lib/auth";
import { SpinnerOverlay } from "@/components/ui-kit";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") { setReady(true); return; }
    if (!getToken() || getRole() !== "admin") {
      navigate({ to: "/admin/login" });
    } else {
      setReady(true);
    }
  }, [navigate, pathname]);

  if (pathname === "/admin/login") return <Outlet />;
  if (!ready) return <SpinnerOverlay />;

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
