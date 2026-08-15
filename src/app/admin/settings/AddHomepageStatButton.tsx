"use client";

import { useTransition } from "react";
import { addHomepageStat } from "./actions";

export default function AddHomepageStatButton({ disabled }: { disabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => { await addHomepageStat(); })}
      disabled={disabled || isPending}
      className="self-start rounded-md border border-card-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-teal-active disabled:opacity-50"
    >
      {isPending ? "Adding..." : "+ Add stat"}
    </button>
  );
}
