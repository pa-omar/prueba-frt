import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Spinner } from "@/components/ui-kit";
import { api } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";
import { CheckCircle2, CreditCard, Wallet, Smartphone, Banknote, MapPin } from "lucide-react";

type Address = { id: string; street: string; district?: string; city: string; isDefault?: boolean };
type CartItem = { id: string; name: string; price: number; quantity: number };

const methods = [
  { value: 1, label: "Tarjeta", icon: CreditCard },
  { value: 2, label: "Efectivo", icon: Banknote },
  { value: 3, label: "Yape", icon: Smartphone },
  { value: 4, label: "Plin", icon: Wallet },
];

function normalizeAddress(a: any): Address {
  return {
    id: String(a.id ?? a.addressId ?? a.address_id),
    street: a.street ?? a.Street ?? "Dirección",
    district: a.district ?? a.District,
    city: a.city ?? a.City ?? "",
    isDefault: a.isDefault ?? a.is_default ?? a.IsDefault,
  };
}

function normalizeCartItems(data: any): CartItem[] {
  const rawItems = data?.items || data?.Items || data?.cartItems || data || [];
  if (!Array.isArray(rawItems)) return [];

  return rawItems.map((it: any) => {
    const productVariantId = it.productVariantId ?? it.product_variant_id ?? it.ProductVariantId ?? "";
    return {
      id: String(it.id ?? it.cartItemId ?? it.cart_item_id ?? it.CartItemId),
      name: it.name ?? it.productName ?? it.product_name ?? it.ProductName ?? `Producto #${productVariantId}`,
      price: Number(it.price ?? it.unitPriceSnapshot ?? it.unit_price_snapshot ?? it.UnitPriceSnapshot ?? 0),
      quantity: Number(it.quantity ?? it.Quantity ?? 1),
    };
  });
}

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);
  const [addrId, setAddrId] = useState("");
  const [methodId, setMethodId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  useEffect(() => {
    if (!getToken()) { navigate({ to: "/login" }); return; }

    const customerId = getUser()?.id;
    if (!customerId) { navigate({ to: "/login" }); return; }

    Promise.all([
      api.get("/customer/addresses").then(r => r.data).catch(() => []),
      api.get(`/customers/${customerId}/cart`).then(r => r.data).catch(() => ({ items: [] })),
    ]).then(([addrs, cart]) => {
      const list = (addrs.items || addrs || []).map(normalizeAddress);
      setAddresses(list);
      setAddrId(list.find((a: Address) => a.isDefault)?.id || list[0]?.id || "");
      setItems(normalizeCartItems(cart));
      setLoading(false);
    });
  }, [navigate]);

  async function checkout() {
    const customerId = getUser()?.id;
    if (!customerId) { navigate({ to: "/login" }); return; }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/orders/checkout/${customerId}`, {
        shippingAddressId: Number(addrId),
        paymentMethodId: Number(methodId),
        shippingCost: 0,
        customerNotes: null,
      });
      setSuccess(data || { orderNumber: "ORDEN-" + Math.random().toString(36).slice(2, 10).toUpperCase() });
    } catch (e: any) {
      alert(e?.response?.data?.message || "No pudimos procesar tu pago");
    } finally { setSubmitting(false); }
  }

  const total = items.reduce((s, x) => s + x.price * x.quantity, 0);

  if (success) {
    const orderLabel = success.orderNumber ?? success.orderId ?? success.id ?? "pedido";

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">¡Pedido confirmado!</h1>
          <p className="mt-2 text-muted-foreground">Gracias por tu compra. Tu pedido <span className="font-mono font-semibold text-foreground">{String(orderLabel).slice(0, 16)}</span> está siendo procesado.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/products" className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Seguir comprando</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        {loading ? <Spinner /> : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <section className="rounded-xl border bg-card p-5">
                <h2 className="font-semibold mb-3">Dirección de entrega</h2>
                {addresses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tienes direcciones. <Link to="/profile" className="text-primary hover:underline">Agregar una</Link></p>
                ) : (
                  <div className="grid gap-2">
                    {addresses.map((a) => (
                      <label key={a.id} className={`flex gap-3 cursor-pointer rounded-lg border p-3 ${addrId === a.id ? "border-primary bg-primary/5" : ""}`}>
                        <input type="radio" name="addr" checked={addrId === a.id} onChange={() => setAddrId(a.id)} className="mt-1 accent-[color:var(--primary)]" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><span className="font-medium text-sm">{a.street}</span></div>
                          <p className="text-xs text-muted-foreground mt-0.5">{a.district ? `${a.district}, ` : ""}{a.city}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>
              <section className="rounded-xl border bg-card p-5">
                <h2 className="font-semibold mb-3">Método de pago</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {methods.map(m => (
                    <label key={m.value} className={`flex flex-col items-center cursor-pointer rounded-lg border p-3 ${methodId === m.value ? "border-primary bg-primary/5" : ""}`}>
                      <input type="radio" name="m" checked={methodId === m.value} onChange={() => setMethodId(m.value)} className="sr-only" />
                      <m.icon className={`h-6 w-6 ${methodId === m.value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="mt-1.5 text-xs font-medium">{m.label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
            <aside className="rounded-xl border bg-card p-5 h-fit sticky top-20 space-y-3">
              <h3 className="font-semibold">Tu pedido</h3>
              <div className="divide-y text-sm">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between py-2"><span className="truncate pr-2">{it.name} × {it.quantity}</span><span className="font-medium">S/ {(it.price * it.quantity).toFixed(2)}</span></div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between font-bold"><span>Total</span><span>S/ {total.toFixed(2)}</span></div>
              <button onClick={checkout} disabled={!addrId || submitting || items.length === 0} className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {submitting ? "Procesando..." : "Confirmar pedido"}
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
