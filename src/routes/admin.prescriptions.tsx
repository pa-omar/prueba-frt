import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyState, Badge, Modal, inputCls } from "@/components/ui-kit";
import { Eye, FileText, Check, X } from "lucide-react";

type Prescription = {
  id: string;
  prescriptionId?: number;
  customerId?: number;
  customerName?: string;
  doctorName: string;
  productName?: string;
  createdAt: string;
  status: "Pending" | "Approved" | "Rejected" | string;
  imageUrl?: string;
  notes?: string;
  specialty?: string;
  rejectionReason?: string;
};

const statusMap: any = { Pending: { v: "yellow", l: "Pendiente" }, Approved: { v: "green", l: "Aprobada" }, Rejected: { v: "red", l: "Rechazada" } };

export const Route = createFileRoute("/admin/prescriptions")({ component: AdminPrescriptions });

function normalizePrescription(p: any): Prescription {
  const rejectionReason = p.rejectionReason ?? p.rejection_reason;
  const isVerified = p.isVerified ?? p.is_verified;
  const customerId = p.customerId ?? p.customer_id;
  const prescriptionId = p.prescriptionId ?? p.prescription_id ?? p.id;

  let status: Prescription["status"] = "Pending";
  if (isVerified) status = "Approved";
  else if (rejectionReason) status = "Rejected";

  return {
    id: String(prescriptionId),
    prescriptionId,
    customerId,
    customerName: p.customerName ?? p.customer_name ?? (customerId ? `Cliente #${customerId}` : undefined),
    doctorName: p.doctorName ?? p.doctor_name ?? "—",
    productName: p.productName ?? p.product_name ?? (p.orderId || p.order_id ? `Orden #${p.orderId ?? p.order_id}` : undefined),
    createdAt: p.createdAt ?? p.created_at ?? p.issuedDate ?? p.issued_date ?? p.verifiedAt ?? p.verified_at ?? new Date().toISOString(),
    status,
    imageUrl: p.imageUrl ?? p.image_url,
    notes: p.notes,
    specialty: p.specialty ?? p.doctorLicense ?? p.doctor_license,
    rejectionReason,
  };
}

function AdminPrescriptions() {
  const [list, setList] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Prescription | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => { refresh(); }, []);

  function refresh() {
    setLoading(true);
    api.get("/admin/prescriptions")
      .then(r => setList((r.data.items || r.data || []).map(normalizePrescription)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function verify(p: Prescription, approved: boolean, rejectionReason?: string) {
    try {
      await api.patch(`/admin/prescriptions/${p.id}/verification`, {
        approve: approved,
        rejectionReason: rejectionReason || null,
        notes: p.notes || null,
      });

      setDetail(null);
      setRejecting(false);
      setReason("");
      refresh();
    } catch {
      alert("No se pudo actualizar");
    }
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Recetas</h1>
      {loading ? <Spinner /> : list.length === 0 ? <EmptyState icon={FileText} title="Sin recetas" /> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>{["Cliente", "Médico", "Producto", "Fecha", "Estado", ""].map(h => <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {list.map(p => {
                const st = statusMap[p.status] || { v: "gray", l: p.status };
                return (
                  <tr key={p.id} className="hover:bg-accent/40">
                    <td className="px-4 py-3">{p.customerName || "—"}</td>
                    <td className="px-4 py-3 font-medium">{p.doctorName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.productName || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("es-PE")}</td>
                    <td className="px-4 py-3"><Badge variant={st.v}>{st.l}</Badge></td>
                    <td className="px-4 py-3"><button onClick={() => { setDetail(p); setRejecting(false); }} className="grid h-8 w-8 place-items-center rounded-md hover:bg-accent"><Eye className="h-4 w-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!detail} onClose={() => { setDetail(null); setRejecting(false); }} title="Detalle de receta" size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Cliente:</span> {detail.customerName || "—"}</div>
              <div><span className="text-muted-foreground">Fecha:</span> {new Date(detail.createdAt).toLocaleString("es-PE")}</div>
              <div><span className="text-muted-foreground">Médico:</span> {detail.doctorName}</div>
              <div><span className="text-muted-foreground">Especialidad:</span> {detail.specialty || "—"}</div>
            </div>
            {detail.notes && <p className="rounded-md bg-muted/50 px-3 py-2 text-sm">{detail.notes}</p>}
            <div className="rounded-lg border bg-muted/30 p-3 grid place-items-center min-h-[200px]">
              {detail.imageUrl ? <img src={detail.imageUrl} alt="Receta" className="max-h-80 rounded-md" /> : <span className="text-sm text-muted-foreground">Sin imagen</span>}
            </div>
            {detail.status === "Pending" && (
              <>
                {rejecting ? (
                  <div className="space-y-2">
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Motivo del rechazo..." className={inputCls} />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setRejecting(false)} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>
                      <button onClick={() => verify(detail, false, reason)} disabled={!reason.trim()} className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-50">Confirmar rechazo</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button onClick={() => setRejecting(true)} className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"><X className="h-4 w-4" /> Rechazar</button>
                    <button onClick={() => verify(detail, true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Check className="h-4 w-4" /> Aprobar</button>
                  </div>
                )}
              </>
            )}
            {detail.status === "Rejected" && detail.rejectionReason && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">Motivo: {detail.rejectionReason}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
