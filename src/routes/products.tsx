import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Spinner, EmptyState, inputCls } from "@/components/ui-kit";
import { api } from "@/lib/api";
import { Search, Package, Pill } from "lucide-react";

type Product = {
  id: string;
  productId?: number;
  slug?: string;
  name: string;
  laboratory?: string;
  price: number;
  categoryName?: string;
  categoryId?: string;
  requiresPrescription?: boolean;
};

type Category = { id: string; name: string };

function normalizeProduct(p: any): Product {
  const productId = p.productId ?? p.product_id ?? p.id;
  const slug = p.slug;
  const variants = p.variants ?? p.Variants ?? [];

  return {
    id: String(slug ?? productId),
    productId,
    slug,
    name: p.name ?? p.Name ?? "Producto",
    laboratory: p.laboratory ?? p.laboratoryName ?? p.laboratory_name ?? p.LaboratoryName,
    price: Number(p.price ?? p.Price ?? variants?.[0]?.price ?? variants?.[0]?.Price ?? 0),
    categoryName: p.categoryName ?? p.category_name ?? p.CategoryName,
    categoryId: String(p.categoryId ?? p.category_id ?? p.CategoryId ?? ""),
    requiresPrescription: p.requiresPrescription ?? p.requires_prescription ?? p.RequiresPrescription,
  };
}

function normalizeCategory(c: any): Category {
  return {
    id: String(c.id ?? c.categoryId ?? c.category_id ?? c.CategoryId),
    name: c.name ?? c.Name ?? "Categoría",
  };
}

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      api.get("/products", { params: { search, categoryId } }).then(r => r.data).catch(() => ({ items: [] })),
      categories.length ? Promise.resolve(categories) : api.get("/categories").then(r => r.data).catch(() => []),
    ]).then(([prods, cats]) => {
      if (!active) return;
      setProducts((prods.items || prods.data || prods || []).map(normalizeProduct));
      setCategories((cats.items || cats || []).map(normalizeCategory));
      setLoading(false);
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Catálogo</h1>
            <p className="text-sm text-muted-foreground mt-1">Productos farmacéuticos y de cuidado personal</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar productos..." className={`${inputCls} pl-9`} />
          </div>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`${inputCls} max-w-xs`}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? <Spinner /> : products.length === 0 ? (
          <EmptyState icon={Package} title="No hay productos" message="Intenta con otra búsqueda o categoría." />
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {products.map((p) => (
              <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="group flex flex-col rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
                <div className="aspect-square bg-gradient-to-br from-primary/5 to-amber/10 grid place-items-center">
                  <Pill className="h-12 w-12 text-primary/40" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  {p.categoryName && <span className="text-xs font-medium text-primary uppercase tracking-wide">{p.categoryName}</span>}
                  <h3 className="mt-1 font-semibold text-sm line-clamp-2 group-hover:text-primary">{p.name}</h3>
                  {p.laboratory && <p className="text-xs text-muted-foreground mt-0.5">{p.laboratory}</p>}
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="text-lg font-bold">S/ {Number(p.price).toFixed(2)}</span>
                    <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Ver</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
