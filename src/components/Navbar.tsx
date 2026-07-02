import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, User, LogOut, Pill } from "lucide-react";
import { useAuth, clearAuth } from "@/lib/auth";

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const linkCls = (active: boolean) =>
    `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      active ? "text-primary" : "text-foreground/70 hover:text-primary"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Pill className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Farma<span className="text-primary">Corp</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/" className={linkCls(pathname === "/")}>Inicio</Link>
          <Link to="/products" className={linkCls(pathname.startsWith("/products"))}>Productos</Link>
          {user && <Link to="/orders" className={linkCls(pathname === "/orders")}>Mis pedidos</Link>}
          {user && <Link to="/prescriptions" className={linkCls(pathname === "/prescriptions")}>Recetas</Link>}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-md hover:bg-accent">
            <ShoppingCart className="h-5 w-5" />
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent md:flex">
                <User className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{user.name || user.email}</span>
              </Link>
              <button
                onClick={() => { clearAuth(); navigate({ to: "/" }); }}
                className="grid h-10 w-10 place-items-center rounded-md hover:bg-accent"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Ingresar</Link>
              <Link to="/register" className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
