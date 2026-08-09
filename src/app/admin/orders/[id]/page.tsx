import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusSelector from "../StatusSelector";

const TYPE_LABELS: Record<string, string> = {
  spare_parts_order: "Spare Parts Order",
  scrap_sell_request: "Scrap Sell Request",
  bulk_quote_request: "Bulk Quote Request",
};

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Weekly",
  twice_monthly: "Twice a month",
  monthly: "Monthly",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, profiles(company_name, contact_name, phone, address, gst_number), order_items(*, products(name))")
    .eq("id", id)
    .single();

  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {TYPE_LABELS[order.order_type] ?? order.order_type}
            {order.is_subscription && (
              <span className="mono ml-2 align-middle rounded-full border border-emerald-highlight/40 bg-emerald-highlight/10 px-2 py-0.5 text-xs uppercase text-emerald-highlight">
                {FREQUENCY_LABELS[order.subscription_frequency] ?? "Subscription"}
              </span>
            )}
          </h1>
          <p className="mono mt-1 text-xs text-muted">
            {new Date(order.created_at).toLocaleString("en-IN")} · #{order.id.slice(0, 8)}
          </p>
        </div>
        <StatusSelector orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="glass-card mt-6 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gold">Customer</h2>
        <div className="mt-3 grid gap-1 text-sm text-foreground">
          <div>{order.profiles?.company_name || "—"}</div>
          <div className="text-muted">{order.profiles?.contact_name}</div>
          <div className="text-muted">{order.profiles?.phone}</div>
          <div className="text-muted">{order.profiles?.address}</div>
          {order.profiles?.gst_number && <div className="text-muted">GST: {order.profiles.gst_number}</div>}
        </div>
      </div>

      {order.plant_location && (
        <div className="glass-card mt-4 p-5 text-sm">
          <span className="text-muted">Plant / pickup location: </span>
          <span className="text-foreground">{order.plant_location}</span>
          {order.preferred_date && (
            <>
              <br />
              <span className="text-muted">Preferred date: </span>
              <span className="text-foreground">{order.preferred_date}</span>
            </>
          )}
        </div>
      )}

      <div className="glass-card mt-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gold">Items</h2>
        <div className="mt-3 flex flex-col gap-2">
          {(order.order_items ?? []).map((item: {
            id: string;
            material_name: string | null;
            quantity: number;
            unit: string;
            price: number | null;
            products: { name: string } | null;
          }) => (
            <div key={item.id} className="flex justify-between border-b border-card-border/50 pb-2 text-sm">
              <span className="text-foreground">
                {item.products?.name ?? item.material_name ?? "Product"} × {item.quantity} {item.unit}
              </span>
              {item.price != null && (
                <span className="mono text-gold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
              )}
            </div>
          ))}
        </div>
        {order.total_amount != null && (
          <div className="mt-4 text-right">
            <span className="mono font-bold text-gold">
              Total: ₹{Number(order.total_amount).toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>

      {order.notes && (
        <div className="glass-card mt-4 p-5 text-sm">
          <span className="text-muted">Notes: </span>
          <span className="text-foreground">{order.notes}</span>
        </div>
      )}
    </div>
  );
}
