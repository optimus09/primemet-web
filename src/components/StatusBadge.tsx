const STATUS_STYLES: Record<string, string> = {
  pending: "border-gold/50 bg-gold/10 text-gold",
  confirmed: "border-emerald-highlight/50 bg-emerald-highlight/10 text-emerald-highlight",
  processing: "border-teal-active/50 bg-teal-active/10 text-teal-active",
  dispatched: "border-emerald-highlight/50 bg-emerald-highlight/10 text-emerald-highlight",
  completed: "border-muted/50 bg-muted/10 text-muted",
  cancelled: "border-red-300 bg-red-50 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`mono inline-block rounded-full border px-2.5 py-0.5 text-xs uppercase tracking-wide ${
        STATUS_STYLES[status] ?? "border-muted/50 bg-muted/10 text-muted"
      }`}
    >
      {status}
    </span>
  );
}
