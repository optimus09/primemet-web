"use client";

import { useState, useTransition } from "react";
import { toggleSetting } from "./actions";

export default function SettingToggle({
  settingKey,
  label,
  description,
  initialValue,
}: {
  settingKey: string;
  label: string;
  description: string;
  initialValue: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !value;
    const previous = value;
    setValue(next);
    setStatus("idle");
    startTransition(async () => {
      const result = await toggleSetting(settingKey, next);
      if (result.error) {
        setValue(previous);
        setStatus("error");
        return;
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    });
  };

  return (
    <div className="glass-card flex items-center justify-between gap-4 p-4">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <p className="mt-1 text-xs text-muted">{description}</p>
        {status === "saved" && <p className="mt-1 text-xs font-medium text-emerald-highlight">Saved ✓</p>}
        {status === "error" && <p className="mt-1 text-xs font-medium text-red-700">Couldn&apos;t save — try again</p>}
      </div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        role="switch"
        aria-checked={value}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
          value ? "border-teal-active bg-teal-active" : "border-card-border bg-surface"
        } disabled:opacity-60`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            value ? "left-6" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
