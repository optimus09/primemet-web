import { createClient } from "@/lib/supabase/server";
import BulkQuoteTable from "./BulkQuoteTable";
import { getSiteSettings, getHiddenCategories } from "@/lib/settings";

export default async function BulkQuotePage() {
  const settings = await getSiteSettings();

  if (!settings.enable_bulk_pricing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Bulk pricing requests are paused</h1>
        <p className="mt-3 text-muted">
          We&apos;re not accepting new bulk pricing requests right now. Please check back soon,
          or reach out directly via the contact details in the footer.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const hiddenCategories = await getHiddenCategories();
  const { data: allProducts } = await supabase
    .from("products")
    .select("id, name, category, unit_price, unit")
    .eq("is_active", true)
    .order("category")
    .order("name");

  const products = (allProducts ?? []).filter((p) => !hiddenCategories.has(p.category));
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div>
      <div className="relative h-32 w-full overflow-hidden sm:h-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photos/spares.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />
      </div>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <span className="mono text-xs uppercase tracking-wider text-gold">Volume Pricing</span>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Request Bulk Pricing</h1>
        <p className="mt-3 text-muted">
          Pick what you need and how many — enter a quantity next to each product. Our team will
          work out a special rate for your business and follow up directly.
        </p>
        <BulkQuoteTable
          products={products ?? []}
          categories={categories}
          showPrice={settings.show_prices}
          enableSubscriptions={settings.enable_subscriptions}
        />
      </div>
    </div>
  );
}
