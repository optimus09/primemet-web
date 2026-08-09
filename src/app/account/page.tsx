import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">My Account</h1>
      <p className="mt-2 text-muted">{user.email}</p>

      <form action={updateProfile} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="companyName" className="block text-sm text-muted">Company name</label>
          <input
            id="companyName"
            name="companyName"
            defaultValue={profile?.company_name ?? ""}
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <div>
          <label htmlFor="contactName" className="block text-sm text-muted">Contact person</label>
          <input
            id="contactName"
            name="contactName"
            defaultValue={profile?.contact_name ?? ""}
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm text-muted">Phone</label>
          <input
            id="phone"
            name="phone"
            defaultValue={profile?.phone ?? ""}
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm text-muted">Address</label>
          <textarea
            id="address"
            name="address"
            defaultValue={profile?.address ?? ""}
            rows={2}
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <div>
          <label htmlFor="gstNumber" className="block text-sm text-muted">GST / Tax ID</label>
          <input
            id="gstNumber"
            name="gstNumber"
            defaultValue={profile?.gst_number ?? ""}
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <button
          type="submit"
          className="mt-2 self-start rounded-md border border-gold bg-teal-active px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-deep"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
