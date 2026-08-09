"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart } from "@/lib/cart";
import { checkout } from "./actions";

export default function CartView({ showPrice = true }: { showPrice?: boolean }) {
  const { items, updateQuantity, removeItem, clear, total } = useCart();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCheckout = () => {
    setError(null);
    startTransition(async () => {
      const result = await checkout(items, notes);
      if (!result.success) {
        if (result.error?.includes("logged in")) {
          router.push(`/login?redirect=${encodeURIComponent("/cart")}`);
          return;
        }
        setError(result.error ?? "Something went wrong.");
        return;
      }
      clear();
      router.push("/orders?placed=1");
    });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mt-3 text-muted">Browse the catalog to add welding rods, hardware or spares.</p>
        <Link
          href="/catalog"
          className="mt-6 inline-block rounded-md border border-gold bg-teal-active px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-deep"
        >
          Browse catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Your cart</h1>

      <div className="mt-8 flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.productId} className="glass-card flex items-center justify-between gap-4 p-4">
            <div>
              <div className="font-medium text-foreground">{item.name}</div>
              {showPrice && (
                <div className="mono text-xs text-muted">
                  ₹{item.unitPrice.toLocaleString("en-IN")} / {item.unit}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                className="w-16 rounded-md border border-card-border bg-surface px-2 py-1 text-center text-foreground"
              />
              {showPrice && (
                <span className="mono w-24 text-right text-sm text-gold">
                  ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                </span>
              )}
              <button
                onClick={() => removeItem(item.productId)}
                className="text-xs text-muted hover:text-red-400"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <label htmlFor="notes" className="block text-sm text-muted">Order notes (optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          placeholder="Delivery instructions, plant address, etc."
        />
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-card-border pt-6">
        {showPrice ? (
          <span className="text-lg text-foreground">
            Total: <span className="mono font-bold text-gold">₹{total.toLocaleString("en-IN")}</span>
          </span>
        ) : (
          <span className="text-sm text-muted">We&apos;ll confirm pricing when we follow up.</span>
        )}
        <button
          onClick={handleCheckout}
          disabled={isPending}
          className="rounded-md border border-gold bg-teal-active px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
        >
          {isPending ? "Submitting..." : "Submit order request"}
        </button>
      </div>
    </div>
  );
}
