"use client";

import { useState, useTransition } from "react";
import { toggleCategory } from "./actions";

export default function CategoryToggle({ category, initialVisible }: { category: string; initialVisible: boolean }) {
  const [visible, setVisible] = useState(initialVisible);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !visible;
    const previous = visible;
    setVisible(next);
    setStatus("idle");
    startTransition(async () => {
      const result = await toggleCategory(category, next);
      if (result.error) {
        setVisible(previous);
        setStatus("error");
        return;
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    });
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-card-border/50 py-2.5 last:border-0">
      <div>
        <span className="text-sm text-foreground">{category}</span>
        {status === "saved" && <span className="ml-2 text-xs font-medium text-emerald-highlight">Saved ✓</span>}
        {status === "error" && <span className="ml-2 text-xs font-medium text-red-700">Failed</span>}
      </div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        role="switch"
        aria-checked={visible}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
          visible ? "border-teal-active bg-teal-active" : "border-card-border bg-surface"
        } disabled:opacity-60`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
            visible ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
