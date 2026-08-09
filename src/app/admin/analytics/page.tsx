import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PERIODS = ["week", "month", "year"] as const;
type Period = (typeof PERIODS)[number];

function startDateFor(period: Period) {
  const now = new Date();
  const start = new Date(now);
  if (period === "week") start.setDate(now.getDate() - 7);
  else if (period === "month") start.setMonth(now.getMonth() - 1);
  else start.setFullYear(now.getFullYear() - 1);
  return start;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period: Period = PERIODS.includes(params.period as Period) ? (params.period as Period) : "month";
  const since = startDateFor(period).toISOString();

  const supabase = await createClient();

  const [{ data: spareOrders }, { data: scrapOrders }, { data: visits }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, created_at, order_items(product_id, quantity, unit, products(name))")
      .eq("order_type", "spare_parts_order")
      .gte("created_at", since),
    supabase
      .from("orders")
      .select("id, created_at, order_items(material_name, quantity, unit)")
      .eq("order_type", "scrap_sell_request")
      .gte("created_at", since),
    supabase.from("site_visits").select("path, created_at").gte("created_at", since),
  ]);

  const spareTotals = new Map<string, number>();
  for (const order of spareOrders ?? []) {
    for (const item of order.order_items ?? []) {
      const productsField = item.products as { name: string } | { name: string }[] | null;
      const name = (Array.isArray(productsField) ? productsField[0]?.name : productsField?.name) ?? "Unknown product";
      spareTotals.set(name, (spareTotals.get(name) ?? 0) + Number(item.quantity));
    }
  }
  const topSpares = Array.from(spareTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const scrapTotals = new Map<string, number>();
  for (const order of scrapOrders ?? []) {
    for (const item of order.order_items ?? []) {
      const name = item.material_name ?? "Unknown material";
      scrapTotals.set(name, (scrapTotals.get(name) ?? 0) + Number(item.quantity));
    }
  }
  const topScrap = Array.from(scrapTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const totalVisits = visits?.length ?? 0;
  const visitsByDay = new Map<string, number>();
  for (const v of visits ?? []) {
    const day = new Date(v.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    visitsByDay.set(day, (visitsByDay.get(day) ?? 0) + 1);
  }
  const dailyVisits = Array.from(visitsByDay.entries()).slice(-14);
  const maxDailyVisits = Math.max(1, ...dailyVisits.map(([, c]) => c));

  const periodLabels: Record<Period, string> = { week: "Last 7 days", month: "Last 30 days", year: "Last 12 months" };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/admin/analytics?period=${p}`}
              className={`rounded-full border px-4 py-1.5 text-sm capitalize transition ${
                period === p ? "border-gold bg-teal-active text-white" : "border-card-border text-muted hover:border-emerald-highlight hover:text-foreground"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{periodLabels[period]}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5">
          <div className="mono text-3xl font-bold text-gold">{totalVisits}</div>
          <div className="mt-2 text-sm text-muted">Page views</div>
        </div>
        <div className="glass-card p-5">
          <div className="mono text-3xl font-bold text-gold">{spareOrders?.length ?? 0}</div>
          <div className="mt-2 text-sm text-muted">Spare parts orders</div>
        </div>
        <div className="glass-card p-5">
          <div className="mono text-3xl font-bold text-gold">{scrapOrders?.length ?? 0}</div>
          <div className="mt-2 text-sm text-muted">Scrap sell requests</div>
        </div>
      </div>

      {dailyVisits.length > 0 && (
        <div className="glass-card mt-8 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gold">Page views by day</h2>
          <div className="mt-4 flex items-end gap-1.5" style={{ height: 80 }}>
            {dailyVisits.map(([day, count]) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-1" title={`${day}: ${count}`}>
                <div
                  className="w-full rounded-sm bg-teal-active"
                  style={{ height: `${Math.max(4, (count / maxDailyVisits) * 60)}px` }}
                />
                <span className="mono text-[9px] text-muted">{day}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gold">Best-selling spare parts</h2>
          {topSpares.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No spare parts orders in this period.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {topSpares.map(([name, qty], i) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    <span className="mono mr-2 text-xs text-muted">#{i + 1}</span>
                    {name}
                  </span>
                  <span className="mono font-semibold text-emerald-highlight">{qty}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gold">Most-bought scrap materials</h2>
          {topScrap.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No scrap requests in this period.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {topScrap.map(([name, qty], i) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    <span className="mono mr-2 text-xs text-muted">#{i + 1}</span>
                    {name}
                  </span>
                  <span className="mono font-semibold text-emerald-highlight">{qty} kg</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
