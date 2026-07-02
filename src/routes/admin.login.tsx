import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { setAuth, getToken, getRole, buildAuthUser } from "@/lib/auth";
import { Field, inputCls } from "@/components/ui-kit";
import { Shield, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (getToken() && getRole() === "admin") navigate({ to: "/admin" }); }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/admin/auth/login", { email, password });
      setAuth(data.token, buildAuthUser(data, { email, role: "admin" }), "admin");
      navigate({ to: "/admin" });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Credenciales inválidas");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4" style={{ background: "linear-gradient(135deg, oklch(0.22 0.04 160) 0%, oklch(0.15 0.02 160) 100%)" }}>
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Shield className="h-5 w-5" /></div>
          <div>
            <div className="text-lg font-bold">FarmaCorp</div>
            <div className="text-xs text-muted-foreground">Panel administrativo</div>
          </div>
        </div>
        <h1 className="text-xl font-bold">Acceso restringido</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ingresa con tus credenciales de administrador.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Correo"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Field>
          <Field label="Contraseña"><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} /></Field>
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Ingresar al panel
          </button>
        </form>
        <Link to="/" className="mt-6 block text-center text-xs text-muted-foreground hover:text-primary">← Volver a la tienda</Link>
      </div>
    </div>
  );
}
