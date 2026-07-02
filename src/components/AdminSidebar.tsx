import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Package, ShoppingBag, Boxes, Layers,
  Tag, FileText, Bell, LogOut, ExternalLink, Pill,
} from "lucide-react";
import { useAuth, clearAuth } from "@/lib/auth";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Productos", icon: Package },
  { to: "/admin/orders", label: "Pedidos", icon: ShoppingBag },
  { to: "/admin/inventory", label: "Inventario", icon: Boxes },
  { to: "/admin/batches", label: "Lotes", icon: Layers },
  { to: "/admin/promotions", label: "Promociones", icon: Tag },
  { to: "/admin/prescriptions", label: "Recetas", icon: FileText },
  { to: "/admin/notifications", label: "Notificaciones", icon: Bell },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-admin-sidebar text-admin-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Pill className="h-5 w-5" />
        </div>
        <div>
          <div className="text-lg font-bold leading-tight">FarmaCorp</div>
          <div className="text-xs text-white/60">Panel admin</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-primary text-primary-foreground" : "text-white/80 hover:bg-white/5"
              }`}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5"
        >
          <ExternalLink className="h-4 w-4" /> Ver tienda
        </Link>
        <div className="rounded-md bg-white/5 px-3 py-2">
          <div className="text-sm font-medium truncate">{user?.name || "Admin"}</div>
          <div className="text-xs text-white/60 truncate">{user?.email}</div>
        </div>
        <button
          onClick={() => { clearAuth(); navigate({ to: "/admin/login" }); }}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
