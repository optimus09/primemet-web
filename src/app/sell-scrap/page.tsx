import { createClient } from "@/lib/supabase/server";
import ScrapForm from "./ScrapForm";
import { getSiteSettings } from "@/lib/settings";

export default async function SellScrapPage() {
  const supabase = await createClient();
  const { data: materials } = await supabase.from("scrap_materials").select("*").eq("is_active", true).order("name");
  const settings = await getSiteSettings();
  const { data: rates } = settings.show_scrap_rates
    ? await supabase.from("scrap_rates").select("*").order("material_name")
    : { data: null };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Sell Your Industrial Scrap</h1>
      <p className="mt-2 text-muted">
        Tell us what you have, how much, and where to collect it — we&apos;ll confirm grading,
        weighment and pickup schedule.
      </p>

      {rates && rates.length > 0 && (
        <div className="glass-card mt-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-card-border bg-surface px-5 py-3">
            <span className="mono text-xs uppercase tracking-wider text-gold">
              Today&apos;s Indicative Buying Rates
            </span>
            <span className="mono text-[10px] text-muted">
              Updated {new Date(rates[0].updated_at).toLocaleDateString("en-IN")}
            </span>
          </div>
          <div className="divide-y divide-card-border">
            {rates.map((rate) => (
              <div key={rate.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-foreground">{rate.material_name}</span>
                <span className="mono font-semibold text-emerald-highlight">
                  ₹{Number(rate.our_price).toFixed(2)} / {rate.unit}
                </span>
              </div>
            ))}
          </div>
          <p className="border-t border-card-border px-5 py-3 text-xs text-muted">
            Indicative rates based on current market pricing — final price is confirmed after
            grading and weighment.
          </p>
        </div>
      )}

      <ScrapForm materials={materials ?? []} enableSubscriptions={settings.enable_subscriptions} />
    </div>
  );
}
