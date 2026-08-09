import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: pendingCount }, { count: totalOrders }, { count: customerCount }, { data: products }] =
    await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("products").select("stock_quantity").lt("stock_quantity", 20),
    ]);

  const lowStockCount = products?.length ?? 0;

  const cards = [
    { label: "Pending orders/quotes", value: pendingCount ?? 0 },
    { label: "Total orders", value: totalOrders ?? 0 },
    { label: "Registered customers", value: customerCount ?? 0 },
    { label: "Products low on stock (<20)", value: lowStockCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="glass-card p-5">
            <div className="mono text-3xl font-bold text-gold">{card.value}</div>
            <div className="mt-2 text-sm text-muted">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
