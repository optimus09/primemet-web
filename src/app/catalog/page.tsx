import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { getSiteSettings, getHiddenCategories } from "@/lib/settings";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category || "All";

  const supabase = await createClient();
  const hiddenCategories = await getHiddenCategories();

  const { data: categoryRows } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true)
    .order("category");
  const categories = [
    "All",
    ...Array.from(new Set((categoryRows ?? []).map((r) => r.category))).filter((c) => !hiddenCategories.has(c)),
  ];

  let query = supabase.from("products").select("*").eq("is_active", true).order("category").order("name");
  if (activeCategory !== "All") {
    query = query.eq("category", activeCategory);
  }
  const { data: allProducts } = await query;
  const products = (allProducts ?? []).filter((p) => !hiddenCategories.has(p.category));
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Order Spare Parts &amp; Consumables</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Welding rods, industrial hardware and machine spares — add what you need to your cart
        and submit an order request.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={cat === "All" ? "/catalog" : `/catalog?category=${encodeURIComponent(cat)}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              activeCategory === cat
                ? "border-gold bg-teal-active text-white"
                : "border-card-border text-muted hover:border-emerald-highlight hover:text-foreground"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {!products || products.length === 0 ? (
        <p className="mt-12 text-muted">No products found in this category yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} showPrice={settings.show_prices} />
          ))}
        </div>
      )}
    </div>
  );
}
