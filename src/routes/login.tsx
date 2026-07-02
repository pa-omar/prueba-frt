import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { setAuth, getToken, buildAuthUser } from "@/lib/auth";
import { Field, inputCls } from "@/components/ui-kit";
import { Pill, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (getToken()) navigate({ to: "/" }); }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.token, buildAuthUser(data, { email, role: "customer" }), "customer");
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Credenciales inválidas");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Pill className="h-5 w-5" /></div>
          <span className="text-xl font-bold">Farma<span className="text-primary">Corp</span></span>
        </Link>
        <h1 className="text-2xl font-bold">Bienvenido</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ingresa a tu cuenta de cliente</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Correo electrónico">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="tu@correo.com" />
          </Field>
          <Field label="Contraseña">
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
          </Field>
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Ingresar
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta? <Link to="/register" className="font-medium text-primary hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
