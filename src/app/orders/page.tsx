import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import { getSiteSettings } from "@/lib/settings";

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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ placed?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name))")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">My Orders</h1>

      {params.placed && (
        <div className="mt-4 rounded-md border border-emerald-highlight/40 bg-emerald-highlight/10 px-4 py-3 text-sm text-emerald-highlight">
          Your request was submitted successfully. We&apos;ll update the status here as it progresses.
        </div>
      )}

      {!orders || orders.length === 0 ? (
        <div className="mt-10 text-center text-muted">
          <p>You haven&apos;t placed any orders yet.</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/catalog" className="text-emerald-highlight hover:underline">Order spare parts</Link>
            <Link href="/sell-scrap" className="text-emerald-highlight hover:underline">Sell scrap</Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="glass-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="mono text-xs text-muted">
                    {TYPE_LABELS[order.order_type] ?? order.order_type}
                    {order.is_subscription && (
                      <span className="ml-2 rounded-full border border-emerald-highlight/40 bg-emerald-highlight/10 px-2 py-0.5 text-[10px] uppercase text-emerald-highlight">
                        {FREQUENCY_LABELS[order.subscription_frequency] ?? "Subscription"}
                      </span>
                    )}
                  </span>
                  <div className="mono text-xs text-muted">
                    {new Date(order.created_at).toLocaleString("en-IN")}
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="mt-4 flex flex-col gap-1">
                {(order.order_items ?? []).map((item: {
                  id: string;
                  material_name: string | null;
                  quantity: number;
                  unit: string;
                  price: number | null;
                  products: { name: string } | null;
                }) => (
                  <div key={item.id} className="flex justify-between text-sm text-foreground">
                    <span>{item.products?.name ?? item.material_name ?? "Item"} × {item.quantity} {item.unit}</span>
                    {settings.show_prices && item.price != null && (
                      <span className="mono text-gold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                    )}
                  </div>
                ))}
              </div>

              {order.plant_location && (
                <div className="mt-3 text-sm text-muted">Location: {order.plant_location}</div>
              )}
              {settings.show_prices && order.total_amount != null && (
                <div className="mt-3 border-t border-card-border pt-3 text-right">
                  <span className="mono font-bold text-gold">
                    Total: ₹{Number(order.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
