import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Spinner, EmptyState, Badge } from "@/components/ui-kit";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Package, ChevronDown } from "lucide-react";

type Order = {
  id: string; createdAt: string; total: number; status: string;
  items?: { name: string; quantity: number; price: number }[];
};

const statusVariant = (s: string): any => {
  const k = s.toLowerCase();
  if (k.includes("entreg")) return "green";
  if (k.includes("envia") || k.includes("ship")) return "blue";
  if (k.includes("proces")) return "yellow";
  if (k.includes("cancel")) return "red";
  return "gray";
};
const statusEs = (s: string) => ({ Pending: "Pendiente", Processing: "Procesando", Shipped: "Enviado", Delivered: "Entregado", Cancelled: "Cancelado" } as any)[s] || s;

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) { navigate({ to: "/login" }); return; }
    api.get("/orders").then(r => setOrders(r.data.items || r.data || [])).catch(() => setOrders([])).finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mis pedidos</h1>
        {loading ? <Spinner /> : orders.length === 0 ? (
          <EmptyState icon={Package} title="No tienes pedidos aún" message="Cuando realices tu primera compra aparecerá aquí." />
        ) : (
          <div className="rounded-xl border bg-card divide-y overflow-hidden">
            {orders.map((o) => (
              <div key={o.id}>
                <button onClick={() => setOpen(open === o.id ? null : o.id)} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-accent/40">
                  <span className="font-mono text-sm font-semibold">{String(o.id).slice(0, 8).toUpperCase()}</span>
                  <span className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("es-PE")}</span>
                  <span className="ml-auto font-semibold">S/ {Number(o.total).toFixed(2)}</span>
                  <Badge variant={statusVariant(o.status)}>{statusEs(o.status)}</Badge>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open === o.id ? "rotate-180" : ""}`} />
                </button>
                {open === o.id && o.items && (
                  <div className="bg-muted/30 px-5 py-4">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-muted-foreground uppercase">
                        <tr><th className="text-left py-1">Producto</th><th className="text-right">Cant.</th><th className="text-right">Precio</th></tr>
                      </thead>
                      <tbody className="divide-y">
                        {o.items.map((it, i) => (
                          <tr key={i}><td className="py-2">{it.name}</td><td className="text-right">{it.quantity}</td><td className="text-right">S/ {Number(it.price).toFixed(2)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
