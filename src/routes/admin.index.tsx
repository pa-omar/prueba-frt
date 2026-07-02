import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui-kit";
import { ShoppingBag, DollarSign, Package, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [top, setTop] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/reports/dashboard").then(r => r.data).catch(() => ({})),
      api.get("/admin/reports/top-products").then(r => r.data).catch(() => []),
    ]).then(([s, t]) => { setStats(s); setTop(t.items || t || []); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8"><Spinner /></div>;

  const cards = [
    { label: "Pedidos hoy", value: stats?.ordersToday ?? 0, icon: ShoppingBag, color: "bg-primary/10 text-primary" },
    { label: "Ventas del mes", value: `S/ ${Number(stats?.monthlySales ?? 0).toFixed(2)}`, icon: DollarSign, color: "bg-amber/15 text-amber-foreground" },
    { label: "Productos activos", value: stats?.activeProducts ?? 0, icon: Package, color: "bg-blue-500/10 text-blue-600" },
    { label: "Stock bajo", value: stats?.lowStock ?? 0, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general de tu farmacia</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <div className={`grid h-9 w-9 place-items-center rounded-lg ${c.color}`}><c.icon className="h-4 w-4" /></div>
            </div>
            <div className="mt-3 text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-3">Top productos vendidos</h2>
          {top.length === 0 ? <p className="text-sm text-muted-foreground">Sin datos aún.</p> : (
            <ul className="divide-y">
              {top.slice(0, 6).map((p: any, i: number) => (
                <li key={p.id || i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">{i + 1}</span>
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{p.sold ?? p.quantity ?? 0} uds</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-3">Resumen general</h2>
          <dl className="divide-y text-sm">
            {Object.entries(stats || {}).slice(0, 8).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2">
                <dt className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</dt>
                <dd className="font-medium">{String(v)}</dd>
              </div>
            ))}
            {!stats || Object.keys(stats).length === 0 && <p className="text-sm text-muted-foreground">Sin datos</p>}
          </dl>
        </div>
      </div>
    </div>
  );
}
