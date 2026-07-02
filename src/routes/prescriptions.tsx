import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Spinner, EmptyState, Badge, Field, inputCls } from "@/components/ui-kit";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { FileText, Upload } from "lucide-react";

type Prescription = {
  id: string; doctorName: string; specialty?: string; notes?: string;
  status: "Pending" | "Approved" | "Rejected" | string;
  rejectionReason?: string; createdAt: string;
};

const statusMap: any = { Pending: { v: "yellow", l: "Pendiente" }, Approved: { v: "green", l: "Aprobada" }, Rejected: { v: "red", l: "Rechazada" } };

export const Route = createFileRoute("/prescriptions")({
  component: PrescriptionsPage,
});

function PrescriptionsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ doctorName: "", specialty: "", notes: "" });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getToken()) { navigate({ to: "/login" }); return; }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function refresh() {
    setLoading(true);
    api.get("/prescriptions").then(r => setList(r.data.items || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { alert("Selecciona un archivo de receta"); return; }
    setSubmitting(true);
    const fd = new FormData();
    fd.append("doctorName", form.doctorName);
    fd.append("specialty", form.specialty);
    fd.append("notes", form.notes);
    fd.append("file", file);
    try {
      await api.post("/prescriptions", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm({ doctorName: "", specialty: "", notes: "" }); setFile(null);
      refresh();
    } catch { alert("No se pudo subir la receta"); }
    finally { setSubmitting(false); }
  }
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Recetas médicas</h1>
        <p className="text-muted-foreground mb-6">Sube tu receta para comprar medicamentos controlados.</p>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-4">Subir nueva receta</h2>
            <form onSubmit={submit} className="space-y-4">
              <Field label="Nombre del médico"><input required value={form.doctorName} onChange={set("doctorName")} className={inputCls} /></Field>
              <Field label="Especialidad"><input value={form.specialty} onChange={set("specialty")} className={inputCls} /></Field>
              <Field label="Notas"><textarea rows={3} value={form.notes} onChange={set("notes")} className={inputCls} /></Field>
              <Field label="Archivo (imagen o PDF)">
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-lg border-2 border-dashed bg-muted/30 px-6 py-8 hover:border-primary hover:bg-primary/5 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{file ? file.name : "Click para subir o arrastra aquí"}</span>
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </Field>
              <button disabled={submitting} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {submitting ? "Subiendo..." : "Subir receta"}
              </button>
            </form>
          </section>
          <section>
            <h2 className="font-semibold mb-4">Historial</h2>
            {loading ? <Spinner /> : list.length === 0 ? (
              <EmptyState icon={FileText} title="Sin recetas" message="Tus recetas aparecerán aquí." />
            ) : (
              <div className="space-y-3">
                {list.map((p) => {
                  const st = statusMap[p.status] || { v: "gray", l: p.status };
                  return (
                    <div key={p.id} className="rounded-xl border bg-card p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{p.doctorName}</h3>
                          {p.specialty && <p className="text-sm text-muted-foreground">{p.specialty}</p>}
                        </div>
                        <Badge variant={st.v as any}>{st.l}</Badge>
                      </div>
                      {p.notes && <p className="mt-2 text-sm text-muted-foreground">{p.notes}</p>}
                      {p.status === "Rejected" && p.rejectionReason && (
                        <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">Motivo: {p.rejectionReason}</p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("es-PE")}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
