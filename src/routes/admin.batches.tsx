import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyState, Badge, Modal, Field, inputCls } from "@/components/ui-kit";
import { Layers, Plus } from "lucide-react";

type Batch = { id: string; productName: string; batchNumber: string; quantity: number; manufacturingDate: string; expirationDate: string };

export const Route = createFileRoute("/admin/batches")({ component: AdminBatches });

function AdminBatches() {
  const [list, setList] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ productId: "", batchNumber: "", quantity: 1, manufacturingDate: "", expirationDate: "" });

  useEffect(() => { refresh(); }, []);
  function refresh() {
    setLoading(true);
    api.get("/admin/batches").then(r => setList(r.data.items || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try { await api.post("/admin/batches", form); setModal(false); refresh(); }
    catch { alert("No se pudo guardar"); }
  }
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });
  function statusFor(b: Batch) {
    const now = new Date(); const exp = new Date(b.expirationDate);
    const days = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (days < 0) return { variant: "red", label: "Vencido", color: "text-destructive" };
    if (days < 30) return { variant: "yellow", label: "Por vencer", color: "text-amber-foreground" };
    return { variant: "green", label: "Vigente", color: "" };
  }

  return (
    <div className="p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Lotes</h1>
        <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Nuevo lote</button>
      </div>
      {loading ? <Spinner /> : list.length === 0 ? <EmptyState icon={Layers} title="Sin lotes" /> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>{["Producto", "N° Lote", "Cantidad", "Fabricación", "Vencimiento", "Estado"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {list.map(b => {
                const st = statusFor(b);
                return (
                  <tr key={b.id} className="hover:bg-accent/40">
                    <td className="px-4 py-3 font-medium">{b.productName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{b.batchNumber}</td>
                    <td className="px-4 py-3">{b.quantity}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(b.manufacturingDate).toLocaleDateString("es-PE")}</td>
                    <td className={`px-4 py-3 ${st.color}`}>{new Date(b.expirationDate).toLocaleDateString("es-PE")}</td>
                    <td className="px-4 py-3"><Badge variant={st.variant as any}>{st.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Nuevo lote">
        <form onSubmit={save} className="space-y-4">
          <Field label="Producto (ID)"><input required value={form.productId} onChange={set("productId")} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Número de lote"><input required value={form.batchNumber} onChange={set("batchNumber")} className={inputCls} /></Field>
            <Field label="Cantidad"><input required type="number" min={1} value={form.quantity} onChange={set("quantity")} className={inputCls} /></Field>
            <Field label="Fabricación"><input required type="date" value={form.manufacturingDate} onChange={set("manufacturingDate")} className={inputCls} /></Field>
            <Field label="Vencimiento"><input required type="date" value={form.expirationDate} onChange={set("expirationDate")} className={inputCls} /></Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
