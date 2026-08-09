"use client";

import { useState, useTransition } from "react";
import { updateHomepageStat } from "./actions";

type Stat = { id: string; stat_value: string; stat_label: string };

export default function HomepageStatEditor({ stat }: { stat: Stat }) {
  const [value, setValue] = useState(stat.stat_value);
  const [label, setLabel] = useState(stat.stat_label);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setStatus("idle");
    startTransition(async () => {
      const result = await updateHomepageStat(stat.id, value, label);
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
      <div>
        <label className="block text-xs text-muted">Number / value</label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 w-32 rounded-md border border-card-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-teal-active"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-muted">Label</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="mt-1 w-full rounded-md border border-card-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-teal-active"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={isPending}
        className="rounded-md border border-gold bg-teal-active px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save"}
      </button>
      {status === "saved" && <span className="text-xs font-medium text-emerald-highlight">Saved ✓</span>}
      {status === "error" && <span className="text-xs font-medium text-red-700">Couldn&apos;t save</span>}
    </div>
  );
}
