import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Spinner, EmptyState, inputCls } from "@/components/ui-kit";
import { api } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";

type CartItem = { id: string; productId: string; name: string; price: number; quantity: number };

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function normalizeCartItems(data: any): CartItem[] {
  const rawItems = data?.items || data?.Items || data?.cartItems || data || [];
  if (!Array.isArray(rawItems)) return [];

  return rawItems.map((it: any) => {
    const productVariantId = it.productVariantId ?? it.product_variant_id ?? it.productId ?? it.product_id ?? "";

    return {
      id: String(it.id ?? it.cartItemId ?? it.cart_item_id),
      productId: String(productVariantId),
      name: it.name ?? it.productName ?? it.product_name ?? it.product?.name ?? `Producto #${productVariantId}`,
      price: Number(it.price ?? it.unitPriceSnapshot ?? it.unit_price_snapshot ?? 0),
      quantity: Number(it.quantity ?? 1),
    };
  });
}

function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  const getCustomerId = () => getUser()?.id;

  function refresh() {
    if (!getToken()) { navigate({ to: "/login" }); return; }

    const customerId = getCustomerId();
    if (!customerId) { setItems([]); setLoading(false); return; }

    setLoading(true);
    api.get(`/customers/${customerId}/cart`)
      .then((r) => setItems(normalizeCartItems(r.data)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, [navigate]);

  async function updateQty(it: CartItem, qty: number) {
    if (qty < 1) return;

    const customerId = getCustomerId();
    if (!customerId) { navigate({ to: "/login" }); return; }

    setItems(items.map(x => x.id === it.id ? { ...x, quantity: qty } : x));

    try {
      await api.put(`/customers/${customerId}/cart/items/${it.id}`, { quantity: qty });
    } catch {
      refresh();
    }
  }

  async function remove(it: CartItem) {
    const customerId = getCustomerId();
    if (!customerId) { navigate({ to: "/login" }); return; }

    setItems(items.filter(x => x.id !== it.id));

    try {
      await api.delete(`/customers/${customerId}/cart/items/${it.id}`);
    } catch {
      refresh();
    }
  }

  async function applyCoupon() {
    setCouponMsg("");
    try {
      const { data } = await api.get(`/coupons/${coupon}/validate`);
      setDiscount(data.discount || 0);
      setCouponMsg("Cupón aplicado");
    } catch { setCouponMsg("Cupón inválido"); setDiscount(0); }
  }

  const subtotal = items.reduce((s, x) => s + x.price * x.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Tu carrito</h1>
        {loading ? <Spinner /> : items.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="Tu carrito está vacío" message="Agrega productos para continuar."
            action={<Link to="/products" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Ver productos</Link>}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-xl border bg-card divide-y">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-4 p-4">
                  <div className="h-16 w-16 shrink-0 rounded-md bg-primary/10" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{it.name}</h3>
                    <p className="text-sm text-muted-foreground">S/ {Number(it.price).toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center rounded-md border">
                    <button onClick={() => updateQty(it, it.quantity - 1)} className="grid h-8 w-8 place-items-center hover:bg-accent"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-sm">{it.quantity}</span>
                    <button onClick={() => updateQty(it, it.quantity + 1)} className="grid h-8 w-8 place-items-center hover:bg-accent"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="w-20 text-right font-semibold">S/ {(it.price * it.quantity).toFixed(2)}</div>
                  <button onClick={() => remove(it)} className="grid h-9 w-9 place-items-center rounded-md text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <aside className="rounded-xl border bg-card p-5 h-fit space-y-4 sticky top-20">
              <h3 className="font-semibold">Resumen</h3>
              <div>
                <label className="text-sm font-medium">Código de descuento</label>
                <div className="mt-1.5 flex gap-2">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} className={inputCls} placeholder="CODIGO" />
                  <button onClick={applyCoupon} className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent">Aplicar</button>
                </div>
                {couponMsg && <p className="mt-1 text-xs text-muted-foreground">{couponMsg}</p>}
              </div>
              <div className="space-y-1.5 text-sm border-t pt-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Descuento</span><span className="text-primary">- S/ {discount.toFixed(2)}</span></div>
                <div className="flex justify-between border-t pt-2 mt-2 text-base font-bold"><span>Total</span><span>S/ {total.toFixed(2)}</span></div>
              </div>
              <Link to="/checkout" className="block w-full text-center rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Proceder al pago</Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
