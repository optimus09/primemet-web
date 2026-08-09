"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setCustomerBlocked } from "./actions";

export default function BlockButton({ customerId, blocked }: { customerId: string; blocked: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!blocked && !confirm("Block this customer? They won't be able to place new orders or requests.")) return;
    startTransition(async () => {
      await setCustomerBlocked(customerId, !blocked);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
        blocked
          ? "border-teal-active bg-teal-active text-white hover:bg-emerald-deep"
          : "border-red-300 text-red-700 hover:bg-red-50"
      }`}
    >
      {isPending ? "Saving..." : blocked ? "Unblock" : "Block"}
    </button>
  );
}
