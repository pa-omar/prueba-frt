import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyState, Badge, Modal, inputCls } from "@/components/ui-kit";
import { Eye, ShoppingBag } from "lucide-react";

type Order = { id: string; customerName?: string; createdAt: string; total: number; status: string; items?: any[] };

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const statusEs: any = { Pending: "Pendiente", Processing: "Procesando", Shipped: "Enviado", Delivered: "Entregado", Cancelled: "Cancelado" };
const variant = (s: string): any => ({ Pending: "yellow", Processing: "blue", Shipped: "blue", Delivered: "green", Cancelled: "red" }[s]) || "gray";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

function AdminOrders() {
  const [list, setList] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);

  useEffect(() => { refresh(); }, []);
  function refresh() {
    setLoading(true);
    api.get("/admin/orders").then(r => setList(r.data.items || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }
  async function updateStatus(o: Order, status: string) {
    setList(list.map(x => x.id === o.id ? { ...x, status } : x));
    try { await api.put(`/admin/orders/${o.id}/status`, { status }); } catch {}
  }
  const filtered = filter ? list.filter(o => o.status === filter) : list;

  return (
    <div className="p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`${inputCls} max-w-xs`}>
          <option value="">Todos</option>
          {STATUSES.map(s => <option key={s} value={s}>{statusEs[s]}</option>)}
        </select>
      </div>
      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState icon={ShoppingBag} title="Sin pedidos" /> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>{["ID", "Cliente", "Fecha", "Total", "Estado", "Cambiar", ""].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3 font-mono text-xs">{String(o.id).slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">{o.customerName || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("es-PE")}</td>
                  <td className="px-4 py-3 font-semibold">S/ {Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge variant={variant(o.status)}>{statusEs[o.status] || o.status}</Badge></td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={(e) => updateStatus(o, e.target.value)} className="rounded-md border px-2 py-1 text-xs">
                      {STATUSES.map(s => <option key={s} value={s}>{statusEs[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDetail(o)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-accent"><Eye className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Pedido ${detail ? String(detail.id).slice(0, 8).toUpperCase() : ""}`} size="lg">
        {detail && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Cliente:</span> {detail.customerName || "—"}</div>
              <div><span className="text-muted-foreground">Fecha:</span> {new Date(detail.createdAt).toLocaleString("es-PE")}</div>
              <div><span className="text-muted-foreground">Estado:</span> <Badge variant={variant(detail.status)}>{statusEs[detail.status]}</Badge></div>
              <div><span className="text-muted-foreground">Total:</span> <span className="font-semibold">S/ {Number(detail.total).toFixed(2)}</span></div>
            </div>
            {detail.items && (
              <table className="w-full text-sm border-t pt-2">
                <thead className="text-xs uppercase text-muted-foreground"><tr><th className="text-left py-2">Producto</th><th className="text-right">Cant.</th><th className="text-right">Precio</th></tr></thead>
                <tbody className="divide-y">
                  {detail.items.map((it: any, i: number) => (
                    <tr key={i}><td className="py-2">{it.name}</td><td className="text-right">{it.quantity}</td><td className="text-right">S/ {Number(it.price).toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
