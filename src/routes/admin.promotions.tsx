import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyState, Badge, Modal, Field, inputCls } from "@/components/ui-kit";
import { Tag, Plus } from "lucide-react";

type Promotion = {
  id: string; name: string; code: string; type: string; value: number;
  startDate: string; endDate: string; usageCount?: number; isActive?: boolean;
};

export const Route = createFileRoute("/admin/promotions")({ component: AdminPromotions });

function AdminPromotions() {
  const [list, setList] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const blank = { name: "", code: "", type: "Percentage", value: 0, startDate: "", endDate: "", minPurchase: 0, maxUses: 100, isActive: true };
  const [form, setForm] = useState<any>(blank);

  useEffect(() => { refresh(); }, []);
  function refresh() {
    setLoading(true);
    api.get("/admin/promotions").then(r => setList(r.data.items || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    try { await api.post("/admin/promotions", form); setModal(false); setForm(blank); refresh(); }
    catch { alert("No se pudo guardar"); }
  }
  const set = (k: string) => (e: any) => {
    const v = e.target.type === "checkbox" ? e.target.checked : k === "code" ? e.target.value.toUpperCase() : e.target.value;
    setForm({ ...form, [k]: v });
  };

  return (
    <div className="p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Promociones</h1>
        <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Nueva promoción</button>
      </div>
      {loading ? <Spinner /> : list.length === 0 ? <EmptyState icon={Tag} title="Sin promociones" /> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>{["Nombre", "Código", "Tipo", "Descuento", "Vigencia", "Usos", "Estado"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {list.map(p => (
                <tr key={p.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3"><span className="inline-flex rounded-md bg-amber/15 px-2 py-1 font-mono text-xs font-semibold text-amber-foreground">{p.code}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                  <td className="px-4 py-3 font-semibold">{p.type === "Percentage" ? `${p.value}%` : `S/ ${Number(p.value).toFixed(2)}`}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.startDate).toLocaleDateString("es-PE")} → {new Date(p.endDate).toLocaleDateString("es-PE")}</td>
                  <td className="px-4 py-3">{p.usageCount ?? 0}</td>
                  <td className="px-4 py-3">{p.isActive ? <Badge variant="green">Activa</Badge> : <Badge variant="gray">Inactiva</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Nueva promoción" size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre"><input required value={form.name} onChange={set("name")} className={inputCls} /></Field>
            <Field label="Código"><input required value={form.code} onChange={set("code")} className={`${inputCls} font-mono uppercase`} /></Field>
            <Field label="Tipo">
              <select value={form.type} onChange={set("type")} className={inputCls}>
                <option value="Percentage">Porcentaje</option>
                <option value="FixedAmount">Monto fijo</option>
                <option value="BuyXGetY">Compra X lleva Y</option>
              </select>
            </Field>
            <Field label="Valor"><input required type="number" step="0.01" value={form.value} onChange={set("value")} className={inputCls} /></Field>
            <Field label="Fecha inicio"><input required type="date" value={form.startDate} onChange={set("startDate")} className={inputCls} /></Field>
            <Field label="Fecha fin"><input required type="date" value={form.endDate} onChange={set("endDate")} className={inputCls} /></Field>
            <Field label="Compra mínima (S/)"><input type="number" step="0.01" value={form.minPurchase} onChange={set("minPurchase")} className={inputCls} /></Field>
            <Field label="Usos máximos"><input type="number" min={1} value={form.maxUses} onChange={set("maxUses")} className={inputCls} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={set("isActive")} /> Activa</label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
