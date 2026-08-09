import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: unknown) {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "contacts";

  if (type === "contacts") {
    const { data: customers } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    // Column names match Zoho Books/CRM contact import expectations
    const header = [
      "Contact Name",
      "Company Name",
      "Display Name",
      "EmailID",
      "Phone",
      "GST Treatment",
      "GST Identification Number (GSTIN)",
      "Billing Address",
    ];

    const rows = (customers ?? []).map((c) => [
      c.contact_name ?? "",
      c.company_name ?? "",
      c.company_name || c.contact_name || "",
      "",
      c.phone ?? "",
      c.gst_number ? "Business GST Registered" : "Consumer",
      c.gst_number ?? "",
      c.address ?? "",
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="primemet-zoho-contacts-${Date.now()}.csv"`,
      },
    });
  }

  // type === "sales"
  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles(company_name, contact_name), order_items(*, products(name))")
    .order("created_at", { ascending: false });

  const header = [
    "Estimate Number",
    "Estimate Date",
    "Customer Name",
    "Item Name",
    "Quantity",
    "Item Price",
    "Item Total",
    "Status",
  ];

  const rows: (string | number)[][] = [];
  for (const order of orders ?? []) {
    const customerName = order.profiles?.company_name || order.profiles?.contact_name || "Unknown";
    const date = new Date(order.created_at).toISOString().slice(0, 10);
    for (const item of order.order_items ?? []) {
      const itemName = item.products?.name ?? item.material_name ?? "Item";
      const price = item.price ?? 0;
      rows.push([
        order.id.slice(0, 8),
        date,
        customerName,
        itemName,
        item.quantity,
        price,
        Number(price) * Number(item.quantity),
        order.status,
      ]);
    }
  }

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="primemet-zoho-sales-${Date.now()}.csv"`,
    },
  });
}
