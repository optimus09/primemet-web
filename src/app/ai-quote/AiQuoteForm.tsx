"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { analyzeDrawing } from "./actions";
import { submitBulkQuoteRequest } from "../bulk-quote/actions";

type ExtractedItem = {
  productId: string | null;
  matchedName: string | null;
  recognizedText: string;
  quantity: number;
  unit: string;
};

export default function AiQuoteForm() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [items, setItems] = useState<ExtractedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (file: File) => {
    setError(null);
    setItems(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      startAnalyzing(async () => {
        const res = await analyzeDrawing(base64, file.type);
        if (!res.success) {
          setError(res.error);
          if (res.error.includes("logged in")) {
            router.push(`/login?redirect=${encodeURIComponent("/ai-quote")}`);
          }
          return;
        }
        if (res.items.length === 0) {
          setError("Couldn't find any identifiable parts in this file. Try a clearer image.");
          return;
        }
        setItems(res.items);
      });
    };
    reader.readAsDataURL(file);
  };

  const updateQuantity = (index: number, quantity: number) => {
    setItems((prev) => prev?.map((it, i) => (i === index ? { ...it, quantity } : it)) ?? null);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev?.filter((_, i) => i !== index) ?? null);
  };

  const handleSubmit = () => {
    if (!items || items.length === 0) return;
    setError(null);

    const matched = items.filter((it) => it.productId);
    const unmatched = items.filter((it) => !it.productId);

    if (matched.length === 0) {
      setError("None of the extracted items matched our catalog. Please contact us directly with the unmatched items below, or try the regular Bulk Pricing form.");
      return;
    }

    const unmatchedNote = unmatched.length
      ? `\n\nCould not auto-match these items — please review manually:\n${unmatched
          .map((it) => `- ${it.recognizedText} × ${it.quantity} ${it.unit}`)
          .join("\n")}`
      : "";

    startSubmitting(async () => {
      const result = await submitBulkQuoteRequest({
        items: matched.map((it) => ({
          productId: it.productId as string,
          name: it.matchedName ?? it.recognizedText,
          quantity: it.quantity,
        })),
        notes: `Submitted via AI drawing/estimation upload (${fileName ?? "file"}).${notes ? ` ${notes}` : ""}${unmatchedNote}`,
        isSubscription: false,
        subscriptionFrequency: null,
      });
      if (!result.success) {
        if (result.error?.includes("logged in")) {
          router.push(`/login?redirect=${encodeURIComponent("/ai-quote")}`);
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
      {!items && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className="glass-card flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-card-border p-12 text-center transition hover:border-teal-active"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {isAnalyzing ? (
            <>
              <div className="pulse-dot h-3 w-3 rounded-full bg-emerald-highlight" />
              <p className="text-sm text-muted">Reading {fileName}...</p>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--teal-active)" strokeWidth="1.5" className="h-10 w-10">
                <path d="M12 16V4M12 4L7 9M12 4l5 5M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-medium text-foreground">Drop a drawing, BOM, or photo here, or click to browse</p>
              <p className="text-xs text-muted">Images (JPG, PNG) or PDF</p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {items && items.length > 0 && (
        <div>
          <h2 className="mt-8 text-lg font-semibold text-foreground">
            Here&apos;s what we found — review and adjust before submitting
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {items.map((item, i) => (
              <div key={i} className="glass-card flex items-center gap-3 p-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.matchedName ?? item.recognizedText}
                  </p>
                  {item.matchedName && item.matchedName !== item.recognizedText && (
                    <p className="text-xs text-muted">Read as: &quot;{item.recognizedText}&quot;</p>
                  )}
                  {!item.productId && (
                    <p className="mono text-xs text-gold">Not in catalog — will note for manual review</p>
                  )}
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(i, Number(e.target.value))}
                  className="w-20 rounded-md border border-card-border bg-surface px-2 py-1.5 text-sm text-foreground"
                />
                <span className="mono w-12 text-xs text-muted">{item.unit}</span>
                <button
                  onClick={() => removeItem(i)}
                  className="text-xs text-muted hover:text-red-700"
                  aria-label="Remove item"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label htmlFor="ai-quote-notes" className="block text-sm text-muted">
              Anything else we should know?
            </label>
            <textarea
              id="ai-quote-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-md border border-gold bg-teal-active px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit as bulk quote request"}
            </button>
            <button
              onClick={() => {
                setItems(null);
                setFileName(null);
                setError(null);
              }}
              className="rounded-md border border-card-border px-6 py-3 text-sm text-muted hover:border-emerald-highlight hover:text-foreground"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
