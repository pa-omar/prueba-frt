import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyState, Badge, Modal, Field, inputCls } from "@/components/ui-kit";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";

type Product = {
  id: string;
  productId?: number;
  name: string;
  slug?: string;
  laboratory?: string;
  laboratoryName?: string;
  laboratoryId?: string | number;
  price: number;
  stock?: number;
  categoryId?: string;
  categoryName?: string;
  requiresPrescription?: boolean;
  isActive?: boolean;
  description?: string;
};

type Category = { id: string; name: string };

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

function normalizeProduct(p: any): Product {
  return {
    id: String(p.id ?? p.productId ?? p.product_id),
    productId: p.productId ?? p.product_id,
    name: p.name,
    slug: p.slug,
    laboratory: p.laboratory ?? p.laboratoryName ?? p.laboratory_name,
    laboratoryName: p.laboratoryName ?? p.laboratory_name,
    laboratoryId: p.laboratoryId ?? p.laboratory_id,
    price: Number(p.price ?? 0),
    stock: p.stock,
    categoryId: String(p.categoryId ?? p.category_id ?? ""),
    categoryName: p.categoryName ?? p.category_name,
    requiresPrescription: p.requiresPrescription ?? p.requires_prescription,
    isActive: p.isActive ?? p.is_active ?? true,
    description: p.description ?? "",
  };
}

function normalizeCategory(c: any): Category {
  return {
    id: String(c.id ?? c.categoryId ?? c.category_id),
    name: c.name,
  };
}

function AdminProducts() {
  const [list, setList] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const blank: Product = { id: "", name: "", price: 0, laboratory: "", categoryId: "", description: "", requiresPrescription: false, isActive: true };
  const [form, setForm] = useState<Product>(blank);

  useEffect(() => {
    refresh();
    api.get("/categories")
      .then(r => setCats((r.data.items || r.data || []).map(normalizeCategory)))
      .catch(() => {});
  }, []);

  function refresh() {
    setLoading(true);
    api.get("/admin/products")
      .then(r => setList((r.data.items || r.data || []).map(normalizeProduct)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function openNew() { setEditing(null); setForm(blank); setModal(true); }
  function openEdit(p: Product) { setEditing(p); setForm({ ...blank, ...p }); setModal(true); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) await api.put(`/admin/products/${editing.id}`, form);
      else await api.post("/admin/products", form);
      setModal(false); refresh();
    } catch { alert("No se pudo guardar"); }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar producto?")) return;
    try { await api.delete(`/admin/products/${id}`); refresh(); } catch {}
  }

  const filtered = list.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const set = (k: keyof Product) => (e: any) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <div className="p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Productos</h1>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Nuevo producto</button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className={`${inputCls} pl-9`} />
      </div>
      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState icon={Package} title="Sin productos" /> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>{["Nombre", "Laboratorio", "Precio", "Receta", "Estado", ""].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-accent/40">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.laboratory || "—"}</td>
                  <td className="px-4 py-3 font-semibold">S/ {Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{p.requiresPrescription ? <Badge variant="yellow">Sí</Badge> : <Badge variant="gray">No</Badge>}</td>
                  <td className="px-4 py-3">{p.isActive !== false ? <Badge variant="green">Activo</Badge> : <Badge variant="gray">Inactivo</Badge>}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)} className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(p.id)} className="inline-grid h-8 w-8 place-items-center rounded-md text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar producto" : "Nuevo producto"} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre"><input required value={form.name} onChange={set("name")} className={inputCls} /></Field>
            <Field label="Precio (S/)"><input required type="number" step="0.01" value={form.price} onChange={set("price")} className={inputCls} /></Field>
            <Field label="Laboratorio"><input value={form.laboratory || ""} onChange={set("laboratory")} className={inputCls} /></Field>
            <Field label="Categoría">
              <select value={form.categoryId || ""} onChange={set("categoryId")} className={inputCls}>
                <option value="">— Selecciona —</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Descripción"><textarea rows={3} value={form.description || ""} onChange={set("description")} className={inputCls} /></Field>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.requiresPrescription} onChange={set("requiresPrescription")} /> Requiere receta</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive !== false} onChange={set("isActive")} /> Activo</label>
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
