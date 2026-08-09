import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: unknown) {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles(company_name, contact_name, phone), order_items(material_name, quantity, unit, price, products(name))")
    .order("created_at", { ascending: false });

  const header = [
    "Order ID",
    "Date",
    "Type",
    "Subscription",
    "Frequency",
    "Status",
    "Company",
    "Contact",
    "Phone",
    "Plant Location",
    "Total Amount",
    "Items",
  ];

  const rows = (orders ?? []).map((o) => [
    o.id,
    new Date(o.created_at).toISOString(),
    o.order_type,
    o.is_subscription ? "Yes" : "No",
    o.subscription_frequency ?? "",
    o.status,
    o.profiles?.company_name ?? "",
    o.profiles?.contact_name ?? "",
    o.profiles?.phone ?? "",
    o.plant_location ?? "",
    o.total_amount ?? "",
    (o.order_items ?? [])
      .map((i: { material_name: string | null; quantity: number; unit: string; products: { name: string } | null }) => `${i.products?.name ?? i.material_name ?? "item"} x${i.quantity}${i.unit}`)
      .join("; "),
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="primemet-orders-${Date.now()}.csv"`,
    },
  });
}
