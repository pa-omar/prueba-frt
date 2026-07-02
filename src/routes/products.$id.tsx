import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Spinner } from "@/components/ui-kit";
import { api } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";
import { Pill, Minus, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";

type ProductVariant = {
  productVariantId: number;
  sku?: string;
  price: number;
  compareAtPrice?: number | null;
  packageDescription?: string;
  drugFormName?: string;
  stock: number;
};

type Product = {
  id: string;
  productId?: number;
  slug?: string;
  name: string;
  laboratory?: string;
  price: number;
  description?: string;
  categoryName?: string;
  requiresPrescription?: boolean;
  variants: ProductVariant[];
};

function normalizeProduct(data: any): Product {
  const variants = (data.variants ?? data.Variants ?? []).map((v: any) => ({
    productVariantId: Number(v.productVariantId ?? v.product_variant_id ?? v.ProductVariantId),
    sku: v.sku ?? v.Sku,
    price: Number(v.price ?? v.Price ?? 0),
    compareAtPrice: v.compareAtPrice ?? v.compare_at_price ?? v.CompareAtPrice,
    packageDescription: v.packageDescription ?? v.package_description ?? v.PackageDescription,
    drugFormName: v.drugFormName ?? v.drug_form_name ?? v.DrugFormName,
    stock: Number(v.stock ?? v.Stock ?? 0),
  }));

  const productId = data.productId ?? data.product_id ?? data.ProductId ?? data.id;
  const slug = data.slug ?? data.Slug;

  return {
    id: String(slug ?? productId),
    productId,
    slug,
    name: data.name ?? data.Name ?? "Producto",
    laboratory: data.laboratory ?? data.laboratoryName ?? data.laboratory_name ?? data.LaboratoryName,
    price: Number(data.price ?? data.Price ?? variants[0]?.price ?? 0),
    description: data.description ?? data.Description ?? data.shortDescription ?? data.ShortDescription,
    categoryName: data.categoryName ?? data.category_name ?? data.CategoryName,
    requiresPrescription: data.requiresPrescription ?? data.requires_prescription ?? data.RequiresPrescription,
    variants,
  };
}

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then((r) => {
        const normalized = normalizeProduct(r.data);
        setProduct(normalized);
        setSelectedVariantId(String(normalized.variants[0]?.productVariantId ?? ""));
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const selectedVariant = product?.variants.find(v => String(v.productVariantId) === selectedVariantId) ?? product?.variants[0];
  const currentPrice = selectedVariant?.price ?? product?.price ?? 0;
  const currentStock = selectedVariant?.stock ?? 0;

  async function addToCart() {
    if (!getToken()) { navigate({ to: "/login" }); return; }

    const customerId = getUser()?.id;
    if (!customerId) { navigate({ to: "/login" }); return; }

    if (!selectedVariant?.productVariantId) {
      setFeedback({ type: "err", msg: "Este producto no tiene una variante disponible" });
      return;
    }

    setAdding(true); setFeedback(null);
    try {
      await api.post(`/customers/${customerId}/cart/items`, {
        productVariantId: selectedVariant.productVariantId,
        quantity: qty,
      });
      setFeedback({ type: "ok", msg: "Producto agregado al carrito" });
    } catch (e: any) {
      setFeedback({ type: "err", msg: e?.response?.data?.message || "No pudimos agregar al carrito" });
    } finally { setAdding(false); }
  }

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><Spinner /></div>;
  if (!product) return <div className="min-h-screen bg-background"><Navbar /><div className="p-8 text-center">Producto no encontrado</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-amber/10 grid place-items-center border">
            <Pill className="h-32 w-32 text-primary/40" />
          </div>
          <div>
            {product.categoryName && <span className="text-xs font-semibold text-primary uppercase tracking-wide">{product.categoryName}</span>}
            <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
            {product.laboratory && <p className="mt-1 text-muted-foreground">Laboratorio: <span className="font-medium text-foreground">{product.laboratory}</span></p>}
            <div className="mt-4 text-4xl font-bold text-primary">S/ {Number(currentPrice).toFixed(2)}</div>

            {product.variants.length > 1 && (
              <div className="mt-4">
                <label className="text-sm font-medium">Presentación</label>
                <select value={selectedVariantId} onChange={(e) => { setSelectedVariantId(e.target.value); setQty(1); }} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                  {product.variants.map((v) => (
                    <option key={v.productVariantId} value={String(v.productVariantId)}>
                      {v.packageDescription || v.drugFormName || `Variante #${v.productVariantId}`} — S/ {Number(v.price).toFixed(2)} — Stock {v.stock}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedVariant && (
              <p className="mt-2 text-sm text-muted-foreground">Stock disponible: {currentStock}</p>
            )}

            {product.requiresPrescription && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber/40 bg-amber/10 px-3 py-2 text-sm">
                <AlertTriangle className="h-5 w-5 text-amber-foreground shrink-0 mt-0.5" />
                <span>Este producto requiere receta médica. Súbela antes de finalizar tu compra.</span>
              </div>
            )}
            {product.description && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-1">Descripción</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm font-medium">Cantidad</span>
              <div className="flex items-center rounded-md border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-9 w-9 place-items-center hover:bg-accent"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(currentStock ? Math.min(currentStock, qty + 1) : qty + 1)} className="grid h-9 w-9 place-items-center hover:bg-accent"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <button onClick={addToCart} disabled={adding || !selectedVariant?.productVariantId || currentStock <= 0} className="mt-6 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {adding ? "Agregando..." : currentStock <= 0 ? "Sin stock" : "Agregar al carrito"}
            </button>
            {feedback && (
              <div className={`mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm ${feedback.type === "ok" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                {feedback.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />} {feedback.msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
