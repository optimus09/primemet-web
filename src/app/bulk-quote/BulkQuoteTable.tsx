"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import CategoryIcon from "@/components/CategoryIcon";
import { submitBulkQuoteRequest } from "./actions";

type Product = {
  id: string;
  name: string;
  category: string;
  unit_price: number;
  unit: string;
};

export default function BulkQuoteTable({
  products,
  categories,
  showPrice = true,
  enableSubscriptions = true,
}: {
  products: Product[];
  categories: string[];
  showPrice?: boolean;
  enableSubscriptions?: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [isSubscription, setIsSubscription] = useState(false);
  const [subscriptionFrequency, setSubscriptionFrequency] = useState("monthly");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(
    () => (activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory)),
    [products, activeCategory]
  );

  const selectedCount = Object.values(quantities).filter((q) => Number(q) > 0).length;

  const setQty = (productId: string, value: string) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  const handleSubmit = () => {
    setError(null);
    const items = products
      .filter((p) => Number(quantities[p.id]) > 0)
      .map((p) => ({ productId: p.id, name: p.name, quantity: Number(quantities[p.id]) }));

    if (items.length === 0) {
      setError("Enter a quantity for at least one product.");
      return;
    }

    startTransition(async () => {
      const result = await submitBulkQuoteRequest({
        items,
        notes,
        isSubscription,
        subscriptionFrequency: isSubscription ? subscriptionFrequency : null,
      });
      if (!result.success) {
        if (result.error?.includes("logged in")) {
          router.push(`/login?redirect=${encodeURIComponent("/bulk-quote")}`);
          return;
        }
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push("/orders?placed=1");
    });
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("All")}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            activeCategory === "All" ? "border-gold bg-teal-active text-white" : "border-card-border text-muted hover:border-emerald-highlight hover:text-foreground"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              activeCategory === cat ? "border-gold bg-teal-active text-white" : "border-card-border text-muted hover:border-emerald-highlight hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {filtered.map((product) => {
          const qty = quantities[product.id] ?? "";
          const active = Number(qty) > 0;
          return (
            <div
              key={product.id}
              className={`glass-card flex items-center gap-4 p-3 transition ${active ? "border-teal-active" : ""}`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface">
                <CategoryIcon category={product.category} className="h-7 w-7 text-teal-active/70" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{product.name}</div>
                <div className="mono text-xs text-muted">
                  {product.category}
                  {showPrice && ` · list ₹${product.unit_price.toLocaleString("en-IN")}/${product.unit}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor={`qty-${product.id}`} className="text-xs text-muted">
                  Qty
                </label>
                <input
                  id={`qty-${product.id}`}
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) => setQty(product.id, e.target.value)}
                  className="w-20 rounded-md border border-card-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-teal-active"
                  placeholder="0"
                />
              </div>
            </div>
          );
        })}
      </div>

      {enableSubscriptions && (
        <div className="glass-card mt-8 p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={isSubscription}
              onChange={(e) => setIsSubscription(e.target.checked)}
              className="h-4 w-4 accent-emerald-highlight"
            />
            Make this a recurring monthly order (subscribe &amp; save)
          </label>
          <p className="mt-1 text-xs text-muted">
            Committing to a regular order gets you our best rate on these items.
          </p>
          {isSubscription && (
            <div className="mt-3">
              <label htmlFor="subscriptionFrequency" className="block text-sm text-muted">
                Delivery frequency
              </label>
              <select
                id="subscriptionFrequency"
                value={subscriptionFrequency}
                onChange={(e) => setSubscriptionFrequency(e.target.value)}
                className="mt-1 w-full max-w-xs rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
              >
                <option value="weekly">Weekly</option>
                <option value="twice_monthly">Twice a month</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <label htmlFor="notes" className="block text-sm text-muted">
          Anything else we should know? (target price, delivery address, etc.)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="sticky bottom-4 mt-6 flex items-center justify-between rounded-lg border border-gold bg-background/95 p-4 shadow-lg backdrop-blur">
        <span className="text-sm text-muted">
          {selectedCount} product{selectedCount === 1 ? "" : "s"} selected
        </span>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="rounded-md border border-gold bg-teal-active px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
        >
          {isPending ? "Submitting..." : "Request Bulk Pricing"}
        </button>
      </div>
    </div>
  );
}
