import { createClient } from "@/lib/supabase/server";

export type SiteSettings = {
  show_prices: boolean;
  show_scrap_rates: boolean;
  enable_bulk_pricing: boolean;
  enable_subscriptions: boolean;
  require_signup_code: boolean;
  show_stats: boolean;
  enable_ai_features: boolean;
};

const DEFAULTS: SiteSettings = {
  show_prices: true,
  show_scrap_rates: true,
  enable_bulk_pricing: true,
  enable_subscriptions: true,
  require_signup_code: false,
  show_stats: true,
  enable_ai_features: true,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key, value");

  const settings = { ...DEFAULTS };
  for (const row of data ?? []) {
    if (row.key in settings) {
      (settings as Record<string, boolean>)[row.key] = row.value;
    }
  }
  return settings;
}

export async function getHiddenCategories(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("category_settings").select("category, is_visible").eq("is_visible", false);
  return new Set((data ?? []).map((row) => row.category));
}
