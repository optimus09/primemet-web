import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/orders", label: "Orders & Quotes" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/admins", label: "Admins & Partners" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-10">
      <aside className="lg:w-56 lg:shrink-0">
        <div className="mono mb-2 text-xs uppercase tracking-widest text-gold lg:mb-4">Employee Panel</div>
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-3 py-2 text-sm text-muted transition hover:bg-card hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
}
