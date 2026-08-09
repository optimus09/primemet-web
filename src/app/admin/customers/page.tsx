import { createClient } from "@/lib/supabase/server";
import BlockButton from "./BlockButton";

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("profiles")
    .select("*, orders(count)")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <div className="flex gap-2">
          <a
            href="/api/admin/export/customers"
            className="rounded-md border border-gold px-4 py-2 text-sm font-medium text-gold transition hover:bg-gold/10"
          >
            Export CSV
          </a>
          <a
            href="/api/admin/export/zoho?type=contacts"
            className="rounded-md border border-charcoal px-4 py-2 text-sm font-medium text-foreground transition hover:border-emerald-highlight"
          >
            Export to Zoho (Contacts)
          </a>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-card-border text-muted">
              <th className="py-2 pr-4">Company</th>
              <th className="py-2 pr-4">Contact</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">GST</th>
              <th className="py-2 pr-4">Orders</th>
              <th className="py-2 pr-4">Joined</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).map((c) => (
              <tr key={c.id} className={`border-b border-card-border/50 ${c.is_blocked ? "opacity-60" : ""}`}>
                <td className="py-3 pr-4 text-foreground">
                  {c.company_name || "—"}
                  {c.is_blocked && (
                    <span className="mono ml-2 rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] uppercase text-red-700">
                      Blocked
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 text-muted">{c.contact_name || "—"}</td>
                <td className="py-3 pr-4 text-muted">{c.phone || "—"}</td>
                <td className="py-3 pr-4 text-muted">{c.gst_number || "—"}</td>
                <td className="mono py-3 pr-4 text-gold">{c.orders?.[0]?.count ?? 0}</td>
                <td className="mono py-3 pr-4 text-xs text-muted">
                  {new Date(c.created_at).toLocaleDateString("en-IN")}
                </td>
                <td className="py-3 pr-4">
                  <BlockButton customerId={c.id} blocked={!!c.is_blocked} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!customers || customers.length === 0) && <p className="mt-6 text-muted">No customers yet.</p>}
      </div>
    </div>
  );
}
