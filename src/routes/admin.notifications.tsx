import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Spinner, EmptyState } from "@/components/ui-kit";
import { Bell, AlertTriangle, ShoppingBag, Calendar, FileText } from "lucide-react";

type Notif = { id: string; type: string; message: string; createdAt: string; isRead?: boolean };

const meta: Record<string, { color: string; icon: any; border: string }> = {
  LowStock: { color: "text-destructive", icon: AlertTriangle, border: "border-l-destructive" },
  NewOrder: { color: "text-primary", icon: ShoppingBag, border: "border-l-primary" },
  ExpiringBatch: { color: "text-amber-foreground", icon: Calendar, border: "border-l-amber" },
  PrescriptionPending: { color: "text-purple-600", icon: FileText, border: "border-l-purple-500" },
};

export const Route = createFileRoute("/admin/notifications")({ component: AdminNotifications });

function AdminNotifications() {
  const [list, setList] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/notifications").then(r => setList(r.data.items || r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Notificaciones</h1>
      {loading ? <Spinner /> : list.length === 0 ? <EmptyState icon={Bell} title="Sin notificaciones" message="Te avisaremos cuando algo importante ocurra." /> : (
        <ul className="space-y-3">
          {list.map(n => {
            const m = meta[n.type] || { color: "text-muted-foreground", icon: Bell, border: "border-l-border" };
            const Icon = m.icon;
            return (
              <li key={n.id} className={`flex items-start gap-3 rounded-xl border bg-card p-4 border-l-4 ${m.border}`}>
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted ${m.color}`}><Icon className="h-4 w-4" /></div>
                <div className="flex-1">
                  <p className="text-sm">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString("es-PE")}</p>
                </div>
                {!n.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
