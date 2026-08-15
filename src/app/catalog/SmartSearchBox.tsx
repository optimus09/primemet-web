"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function SmartSearchBox({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      if (query.trim()) {
        router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
      } else {
        router.push("/catalog");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Describe what you need, e.g. &quot;something to cut a 4 inch steel pipe&quot;"
        className="flex-1 rounded-md border border-card-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-teal-active"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-gold bg-teal-active px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
      >
        {isPending ? "Searching..." : "AI Search"}
      </button>
      {initialQuery && (
        <a
          href="/catalog"
          className="flex items-center rounded-md border border-card-border px-3 py-2 text-sm text-muted hover:border-emerald-highlight hover:text-foreground"
        >
          Clear
        </a>
      )}
    </form>
  );
}
