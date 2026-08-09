import { getSiteSettings, getHiddenCategories } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import SettingToggle from "./SettingToggle";
import CategoryToggle from "./CategoryToggle";
import ScrapRateEditor from "./ScrapRateEditor";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  const hiddenCategories = await getHiddenCategories();

  const supabase = await createClient();
  const { data: categoryRows } = await supabase.from("products").select("category").order("category");
  const categories = Array.from(new Set((categoryRows ?? []).map((r) => r.category)));
  const { data: rates } = await supabase.from("scrap_rates").select("*").order("material_name");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Everything you can turn on or off across the whole site, in one place. Changes apply
        immediately for every visitor — nothing here is visible or editable by customers.
      </p>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gold">Pricing &amp; features</h2>
      <div className="mt-4 flex max-w-xl flex-col gap-4">
        <SettingToggle
          settingKey="show_prices"
          label="Show product prices"
          description="When off, prices are hidden everywhere on the site — the catalog, cart, and order confirmations. Customers can still browse and request orders; you follow up with pricing directly."
          initialValue={settings.show_prices}
        />
        <SettingToggle
          settingKey="show_scrap_rates"
          label="Show today's scrap buying rates"
          description="When off, the indicative buying-price table is hidden from the Sell Your Scrap page."
          initialValue={settings.show_scrap_rates}
        />
        <SettingToggle
          settingKey="enable_bulk_pricing"
          label="Accept bulk pricing requests"
          description="When off, the Bulk Pricing page and nav link are hidden — customers can't submit bulk requests."
          initialValue={settings.enable_bulk_pricing}
        />
        <SettingToggle
          settingKey="enable_subscriptions"
          label="Accept subscription pickups / orders"
          description="When off, the subscription option is hidden from the Sell Your Scrap and Bulk Pricing forms."
          initialValue={settings.enable_subscriptions}
        />
        <SettingToggle
          settingKey="require_signup_code"
          label="Require invite code to sign up"
          description="When on, new customers need one of your signup codes (generate them under Admins & Partners) to create an account. Keeps random signups out."
          initialValue={settings.require_signup_code}
        />
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gold">
        Today&apos;s scrap buying rates
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        &quot;Market price&quot; is your reference; &quot;our price&quot; is what customers see
        (when the toggle above is on). Keep our price a little below market for negotiating room.
      </p>
      <div className="mt-4 flex max-w-2xl flex-col gap-3">
        {(rates ?? []).map((rate) => (
          <ScrapRateEditor key={rate.id} rate={rate} />
        ))}
        {(!rates || rates.length === 0) && <p className="text-sm text-muted">No scrap rates set yet.</p>}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gold">
        Product categories shown in the catalog
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Turn off a whole category to hide every product in it from the catalog and bulk pricing
        page — useful if you&apos;re temporarily out of a product line.
      </p>
      <div className="glass-card mt-4 max-w-xl p-4">
        {categories.map((category) => (
          <CategoryToggle
            key={category}
            category={category}
            initialVisible={!hiddenCategories.has(category)}
          />
        ))}
        {categories.length === 0 && <p className="text-sm text-muted">No categories yet.</p>}
      </div>
    </div>
  );
}
