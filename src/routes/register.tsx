import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { setAuth, getToken, buildAuthUser } from "@/lib/auth";
import { Field, inputCls } from "@/components/ui-kit";
import { Pill, Loader2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (getToken()) navigate({ to: "/" }); }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const parts = form.name.trim().split(/\s+/);
      const firstName = parts.shift() || form.name.trim();
      const lastName = parts.join(" ") || "Cliente";

      const { data } = await api.post("/auth/register", {
        email: form.email,
        password: form.password,
        firstName,
        lastName,
        phone: form.phone || null,
      });

      setAuth(data.token, buildAuthUser(data, { email: form.email, name: form.name, role: "customer" }), "customer");
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err?.response?.data?.message || "No pudimos crear tu cuenta");
    } finally { setLoading(false); }
  }

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Pill className="h-5 w-5" /></div>
          <span className="text-xl font-bold">Farma<span className="text-primary">Corp</span></span>
        </Link>
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Únete a FarmaCorp en segundos</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Nombre completo">
            <input required value={form.name} onChange={set("name")} className={inputCls} />
          </Field>
          <Field label="Correo electrónico">
            <input type="email" required value={form.email} onChange={set("email")} className={inputCls} />
          </Field>
          <Field label="Teléfono">
            <input value={form.phone} onChange={set("phone")} className={inputCls} placeholder="+51" />
          </Field>
          <Field label="Contraseña">
            <input type="password" required minLength={6} value={form.password} onChange={set("password")} className={inputCls} />
          </Field>
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Crear cuenta
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <Link to="/login" className="font-medium text-primary hover:underline">Ingresar</Link>
        </p>
      </div>
    </div>
  );
}
