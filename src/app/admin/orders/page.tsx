import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";

const TYPE_LABELS: Record<string, string> = {
  spare_parts_order: "Spare Parts",
  scrap_sell_request: "Scrap Request",
  bulk_quote_request: "Bulk Quote",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, profiles(company_name, contact_name, phone)")
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.type) query = query.eq("order_type", params.type);

  const { data: orders } = await query;

  const statuses = ["pending", "confirmed", "processing", "dispatched", "completed", "cancelled"];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Orders &amp; Quotes</h1>
        <div className="flex gap-2">
          <a
            href="/api/admin/export/orders"
            className="rounded-md border border-gold px-4 py-2 text-sm font-medium text-gold transition hover:bg-gold/10"
          >
            Export CSV
          </a>
          <a
            href="/api/admin/export/zoho?type=sales"
            className="rounded-md border border-charcoal px-4 py-2 text-sm font-medium text-foreground transition hover:border-emerald-highlight"
          >
            Export to Zoho (Sales)
          </a>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full border px-3 py-1 text-xs ${!params.status ? "border-gold text-gold" : "border-card-border text-muted"}`}
        >
          All statuses
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`mono rounded-full border px-3 py-1 text-xs uppercase ${params.status === s ? "border-gold text-gold" : "border-card-border text-muted"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full border px-3 py-1 text-xs ${!params.type ? "border-emerald-highlight text-emerald-highlight" : "border-card-border text-muted"}`}
        >
          All types
        </Link>
        <Link
          href="/admin/orders?type=spare_parts_order"
          className={`rounded-full border px-3 py-1 text-xs ${params.type === "spare_parts_order" ? "border-emerald-highlight text-emerald-highlight" : "border-card-border text-muted"}`}
        >
          Spare Parts Orders
        </Link>
        <Link
          href="/admin/orders?type=scrap_sell_request"
          className={`rounded-full border px-3 py-1 text-xs ${params.type === "scrap_sell_request" ? "border-emerald-highlight text-emerald-highlight" : "border-card-border text-muted"}`}
        >
          Scrap Sell Requests
        </Link>
        <Link
          href="/admin/orders?type=bulk_quote_request"
          className={`rounded-full border px-3 py-1 text-xs ${params.type === "bulk_quote_request" ? "border-emerald-highlight text-emerald-highlight" : "border-card-border text-muted"}`}
        >
          Bulk Quote Requests
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-card-border text-muted">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => (
              <tr key={order.id} className="border-b border-card-border/50">
                <td className="mono py-3 pr-4 text-xs text-muted">
                  {new Date(order.created_at).toLocaleDateString("en-IN")}
                </td>
                <td className="py-3 pr-4 text-foreground">
                  {order.profiles?.company_name || order.profiles?.contact_name || "—"}
                </td>
                <td className="py-3 pr-4 text-muted">
                  {TYPE_LABELS[order.order_type] ?? order.order_type}
                  {order.is_subscription && (
                    <span className="mono ml-2 rounded-full border border-emerald-highlight/40 bg-emerald-highlight/10 px-2 py-0.5 text-[10px] uppercase text-emerald-highlight">
                      Subscription
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4"><StatusBadge status={order.status} /></td>
                <td className="mono py-3 pr-4 text-gold">
                  {order.total_amount != null ? `₹${Number(order.total_amount).toLocaleString("en-IN")}` : "—"}
                </td>
                <td className="py-3 pr-4">
                  <Link href={`/admin/orders/${order.id}`} className="text-emerald-highlight hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && (
          <p className="mt-6 text-muted">No orders match this filter.</p>
        )}
      </div>
    </div>
  );
}
