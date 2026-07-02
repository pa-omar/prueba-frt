import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Spinner, EmptyState, Badge, Modal, Field, inputCls } from "@/components/ui-kit";
import { api } from "@/lib/api";
import { getToken, useAuth } from "@/lib/auth";
import { MapPin, Plus, Trash2, Star } from "lucide-react";

type Address = { id: string; street: string; district: string; city: string; postalCode?: string; references?: string; isDefault?: boolean };

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Address>({ id: "", street: "", district: "", city: "", postalCode: "", references: "" });

  useEffect(() => {
    if (!getToken()) { navigate({ to: "/login" }); return; }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refresh() {
    setLoading(true);
    api.get("/customer-addresses").then(r => setAddresses(r.data.items || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try { await api.post("/customer-addresses", form); setModal(false); setForm({ id: "", street: "", district: "", city: "", postalCode: "", references: "" }); refresh(); }
    catch { alert("No se pudo guardar"); }
  }
  async function remove(id: string) { try { await api.delete(`/customer-addresses/${id}`); refresh(); } catch {} }
  async function setDefault(id: string) { try { await api.put(`/customer-addresses/${id}/default`, {}); refresh(); } catch {} }

  const initials = (user?.name || user?.email || "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const set = (k: keyof Address) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">{initials}</div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name || "Usuario"}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Mis direcciones</h2>
          <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Agregar dirección</button>
        </div>

        {loading ? <Spinner /> : addresses.length === 0 ? (
          <EmptyState icon={MapPin} title="Sin direcciones" message="Agrega una dirección para recibir tus pedidos." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((a) => (
              <div key={a.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{a.street}</h3>
                  </div>
                  {a.isDefault && <Badge variant="green">Principal</Badge>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{a.district}, {a.city}{a.postalCode && ` · CP ${a.postalCode}`}</p>
                {a.references && <p className="mt-1 text-xs text-muted-foreground italic">{a.references}</p>}
                <div className="mt-4 flex gap-2">
                  {!a.isDefault && (
                    <button onClick={() => setDefault(a.id)} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"><Star className="h-3.5 w-3.5" /> Establecer como principal</button>
                  )}
                  <button onClick={() => remove(a.id)} className="ml-auto inline-flex items-center gap-1 text-xs text-destructive hover:underline"><Trash2 className="h-3.5 w-3.5" /> Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Nueva dirección">
        <form onSubmit={save} className="space-y-4">
          <Field label="Calle y número"><input required value={form.street} onChange={set("street")} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Distrito"><input required value={form.district} onChange={set("district")} className={inputCls} /></Field>
            <Field label="Ciudad"><input required value={form.city} onChange={set("city")} className={inputCls} /></Field>
          </div>
          <Field label="Código postal"><input value={form.postalCode} onChange={set("postalCode")} className={inputCls} /></Field>
          <Field label="Referencias"><textarea value={form.references} onChange={set("references")} className={inputCls} rows={2} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(false)} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
