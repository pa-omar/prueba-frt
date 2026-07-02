import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyState, Badge, Modal, Field, inputCls } from "@/components/ui-kit";
import { Boxes, Plus } from "lucide-react";

type Item = { id: string; productName: string; stock: number; minStock: number };

export const Route = createFileRoute("/admin/inventory")({ component: AdminInventory });

function AdminInventory() {
  const [list, setList] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ productId: "", type: "Entrada", quantity: 1, notes: "" });

  useEffect(() => { refresh(); }, []);
  function refresh() {
    setLoading(true);
    api.get("/admin/inventory").then(r => setList(r.data.items || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try { await api.post("/admin/inventory/movements", form); setModal(false); refresh(); }
    catch { alert("No se pudo registrar"); }
  }
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Registrar movimiento</button>
      </div>
      {loading ? <Spinner /> : list.length === 0 ? <EmptyState icon={Boxes} title="Sin productos en inventario" /> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>{["Producto", "Stock actual", "Stock mínimo", "Estado"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {list.map(it => {
                const low = it.stock <= it.minStock;
                return (
                  <tr key={it.id} className="hover:bg-accent/40">
                    <td className="px-4 py-3 font-medium">{it.productName}</td>
                    <td className="px-4 py-3"><span className="text-lg font-bold">{it.stock}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{it.minStock}</td>
                    <td className="px-4 py-3">{low ? <Badge variant="red">Stock bajo</Badge> : <Badge variant="green">OK</Badge>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Registrar movimiento">
        <form onSubmit={save} className="space-y-4">
          <Field label="Producto (ID)"><input required value={form.productId} onChange={set("productId")} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <select value={form.type} onChange={set("type")} className={inputCls}>
                <option>Entrada</option><option>Salida</option><option>Ajuste</option><option>Devolución</option>
              </select>
            </Field>
            <Field label="Cantidad"><input required type="number" min={1} value={form.quantity} onChange={set("quantity")} className={inputCls} /></Field>
          </div>
          <Field label="Notas"><textarea rows={2} value={form.notes} onChange={set("notes")} className={inputCls} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Registrar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
