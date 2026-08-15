import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import SmartSearchBox from "./SmartSearchBox";
import { smartSearchProductIds } from "./smartSearch";
import { getSiteSettings, getHiddenCategories } from "@/lib/settings";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category || "All";
  const searchQuery = params.q?.trim() || "";

  const supabase = await createClient();
  const hiddenCategories = await getHiddenCategories();
  const settings = await getSiteSettings();

  const { data: categoryRows } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true)
    .order("category");
  const categories = [
    "All",
    ...Array.from(new Set((categoryRows ?? []).map((r) => r.category))).filter((c) => !hiddenCategories.has(c)),
  ];

  let products: { id: string; name: string; category: string; [key: string]: unknown }[] = [];
  let searchNote: string | null = null;

  if (searchQuery && settings.enable_ai_features) {
    const { data: allActive } = await supabase.from("products").select("*").eq("is_active", true);
    const visibleAll = (allActive ?? []).filter((p) => !hiddenCategories.has(p.category));
    const matchedIds = await smartSearchProductIds(
      searchQuery,
      visibleAll.map((p) => ({ id: p.id, name: p.name, category: p.category }))
    );
    const byId = new Map(visibleAll.map((p) => [p.id, p]));
    products = matchedIds.map((id) => byId.get(id)).filter((p): p is typeof visibleAll[number] => !!p);
    searchNote =
      products.length > 0
        ? `Found ${products.length} matching product${products.length === 1 ? "" : "s"} for "${searchQuery}"`
        : `No good matches found for "${searchQuery}" — try browsing by category instead.`;
  } else {
    let query = supabase.from("products").select("*").eq("is_active", true).order("category").order("name");
    if (activeCategory !== "All") {
      query = query.eq("category", activeCategory);
    }
    const { data: allProducts } = await query;
    products = (allProducts ?? []).filter((p) => !hiddenCategories.has(p.category));
  }

  return (
    <div>
      <div className="relative h-32 w-full overflow-hidden sm:h-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/products/grinding-machine.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Order Spare Parts &amp; Consumables</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Welding rods, industrial hardware and machine spares — add what you need to your cart
        and submit an order request.
      </p>

      {settings.enable_ai_features && <SmartSearchBox initialQuery={searchQuery} />}

      {!searchQuery && (
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
      )}

      {searchNote && <p className="mt-6 text-sm text-muted">{searchNote}</p>}

      {!products || products.length === 0 ? (
        <p className="mt-12 text-muted">No products found in this category yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <ProductCard key={product.id} product={product as any} showPrice={settings.show_prices} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
