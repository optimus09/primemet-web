"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setAdminRole } from "./actions";

export default function RoleButton({ userId, makeAdmin, label }: { userId: string; makeAdmin: boolean; label: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await setAdminRole(userId, makeAdmin);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`rounded-md border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
          makeAdmin
            ? "border-gold bg-teal-active text-white hover:bg-emerald-deep"
            : "border-red-300 text-red-700 hover:bg-red-50"
        }`}
      >
        {isPending ? "Saving..." : label}
      </button>
      {error && <span className="max-w-[180px] text-right text-xs text-red-700">{error}</span>}
    </div>
  );
}
