"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateOrderStatus } from "./actions";

const STATUSES = ["pending", "confirmed", "processing", "dispatched", "completed", "cancelled"];

export default function StatusSelector({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (status: string) => {
    startTransition(async () => {
      await updateOrderStatus(orderId, status);
      router.refresh();
    });
  };

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value)}
      className="mono rounded-md border border-card-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-teal-active"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
