"use client";

import { useState, useTransition } from "react";
import { updateScrapRate } from "./actions";

type Rate = {
  id: string;
  material_name: string;
  market_price: number;
  our_price: number;
  unit: string;
};

export default function ScrapRateEditor({ rate }: { rate: Rate }) {
  const [marketPrice, setMarketPrice] = useState(String(rate.market_price));
  const [ourPrice, setOurPrice] = useState(String(rate.our_price));
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setStatus("idle");
    startTransition(async () => {
      const result = await updateScrapRate(rate.id, Number(marketPrice), Number(ourPrice));
      if (result.error) {
        setStatus("error");
        return;
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    });
  };

  return (
    <div className="glass-card flex flex-wrap items-end gap-4 p-4">
      <div className="min-w-[120px] flex-1">
        <div className="text-sm font-medium text-foreground">{rate.material_name}</div>
        {status === "saved" && <div className="text-xs font-medium text-emerald-highlight">Saved ✓</div>}
        {status === "error" && <div className="text-xs font-medium text-red-700">Couldn&apos;t save</div>}
      </div>
      <div>
        <label className="block text-xs text-muted">Market price (₹/{rate.unit})</label>
        <input
          type="number"
          step="0.01"
          value={marketPrice}
          onChange={(e) => setMarketPrice(e.target.value)}
          className="mt-1 w-28 rounded-md border border-card-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-teal-active"
        />
      </div>
      <div>
        <label className="block text-xs text-muted">Our price (₹/{rate.unit})</label>
        <input
          type="number"
          step="0.01"
          value={ourPrice}
          onChange={(e) => setOurPrice(e.target.value)}
          className="mt-1 w-28 rounded-md border border-card-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-teal-active"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={isPending}
        className="rounded-md border border-gold bg-teal-active px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
