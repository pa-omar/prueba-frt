import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import {
  ShieldCheck, Truck, Headphones, Pill, Heart, Baby,
  Sparkles, Stethoscope, FlaskConical, Upload, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")(  {
  component: Home,
});

const categories = [
  { name: "Medicamentos", icon: Pill },
  { name: "Cuidado personal", icon: Heart },
  { name: "Bebés y mamás", icon: Baby },
  { name: "Belleza", icon: Sparkles },
  { name: "Dermatología", icon: Stethoscope },
  { name: "Vitaminas", icon: FlaskConical },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(135deg, oklch(0.52 0.13 154 / 0.88) 0%, oklch(0.38 0.10 160 / 0.82) 100%), url('/images/hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28 text-primary-foreground">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-amber" /> Farmacia certificada
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              Tu salud es nuestra prioridad
            </h1>
            <p className="mt-4 text-lg text-white/85 max-w-xl">
              Encuentra todos tus medicamentos y productos de cuidado personal con entrega a domicilio en horas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-lg bg-amber px-5 py-3 text-sm font-semibold text-amber-foreground hover:opacity-90 shadow-lg">
                Ver catálogo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-5 py-3 text-sm font-semibold backdrop-blur hover:bg-white/25">
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Productos garantizados", desc: "Todos nuestros productos cuentan con certificación sanitaria." },
            { icon: Truck, title: "Entrega a domicilio", desc: "Recibe tu pedido en pocas horas en Lima y provincias." },
            { icon: Headphones, title: "Atención 24/7", desc: "Nuestro equipo de farmacéuticos siempre está disponible." },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3 rounded-xl border bg-card p-5 shadow-sm">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold">Explora por categoría</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline">Ver todo →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.name} to="/products" className="group rounded-xl border bg-card p-5 text-center transition-all hover:border-primary hover:shadow-md">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <c.icon className="h-6 w-6" />
              </div>
              <div className="mt-3 text-sm font-medium">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 p-8 items-center" style={{ background: "linear-gradient(90deg, oklch(0.96 0.02 150) 0%, oklch(0.95 0.04 75) 100%)" }}>
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber text-amber-foreground">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">¿Tienes una receta médica?</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-lg">
                  Súbela y nuestros farmacéuticos la revisarán para que recibas tus medicamentos rápidamente.
                </p>
              </div>
            </div>
            <Link to="/prescriptions" className="inline-flex justify-center items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Subir receta <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card mt-12">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground flex flex-wrap justify-between gap-4">
          <span>© {new Date().getFullYear()} FarmaCorp. Todos los derechos reservados.</span>
          <Link to="/admin/login" className="hover:text-primary">Acceso administrativo</Link>
        </div>
      </footer>
    </div>
  );
}