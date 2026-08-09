import { createClient } from "@/lib/supabase/server";
import RoleButton from "./RoleButton";
import InviteAdminForm from "./InviteAdminForm";
import SignupCodeManager from "./SignupCodeManager";

export default async function AdminPartnersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: admins }, { data: customers }, { data: invites }, { data: codes }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "admin").order("created_at"),
    supabase.from("profiles").select("*").eq("role", "customer").order("created_at", { ascending: false }).limit(50),
    supabase.from("pending_admin_invites").select("email").order("created_at"),
    supabase.from("signup_codes").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Admins &amp; Partners</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Everyone listed under &quot;Admins&quot; can log in and access this entire backend —
        orders, products, pricing, settings, everything. Only add people you fully trust with
        the business.
      </p>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gold">Invite a new admin</h2>
      <InviteAdminForm pendingInvites={(invites ?? []).map((i) => i.email)} />

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gold">
        Admins ({admins?.length ?? 0})
      </h2>
      <div className="mt-4 flex max-w-2xl flex-col gap-3">
        {(admins ?? []).map((admin) => (
          <div key={admin.id} className="glass-card flex items-center justify-between gap-4 p-4">
            <div>
              <div className="text-sm font-medium text-foreground">
                {admin.contact_name || admin.email || "Unnamed"}
                {admin.id === user?.id && <span className="ml-2 text-xs text-muted">(you)</span>}
              </div>
              <div className="mono text-xs text-muted">{admin.email}</div>
            </div>
            <RoleButton userId={admin.id} makeAdmin={false} label="Remove admin access" />
          </div>
        ))}
        {(!admins || admins.length === 0) && <p className="text-muted">No admins yet.</p>}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gold">
        Signup invitation codes
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Once you turn on &quot;Require invite code to sign up&quot; below, new customers need
        one of these codes to create an account — keeps random signups out.
      </p>
      <SignupCodeManager codes={codes ?? []} />

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gold">
        All customers
      </h2>
      <div className="mt-4 flex max-w-2xl flex-col gap-3">
        {(customers ?? []).map((customer) => (
          <div key={customer.id} className="glass-card flex items-center justify-between gap-4 p-4">
            <div>
              <div className="text-sm font-medium text-foreground">
                {customer.company_name || customer.contact_name || "Unnamed"}
              </div>
              <div className="mono text-xs text-muted">{customer.email}</div>
            </div>
            <RoleButton userId={customer.id} makeAdmin={true} label="Make admin" />
          </div>
        ))}
        {(!customers || customers.length === 0) && <p className="text-muted">No customers yet.</p>}
      </div>
    </div>
  );
}
