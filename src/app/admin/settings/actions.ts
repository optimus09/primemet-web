"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleSetting(key: string, value: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function toggleCategory(category: string, isVisible: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("category_settings")
    .upsert({ category, is_visible: isVisible, updated_at: new Date().toISOString() }, { onConflict: "category" });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function updateScrapRate(
  rateId: string,
  marketPrice: number,
  ourPrice: number
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("scrap_rates")
    .update({ market_price: marketPrice, our_price: ourPrice, updated_at: new Date().toISOString() })
    .eq("id", rateId);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function updateHomepageStat(
  statId: string,
  value: string,
  label: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("homepage_stats")
    .update({ stat_value: value, stat_label: label, updated_at: new Date().toISOString() })
    .eq("id", statId);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

const MAX_HOMEPAGE_STATS = 5;

export async function addHomepageStat(): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("homepage_stats")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) >= MAX_HOMEPAGE_STATS) {
    return { error: `You can only have up to ${MAX_HOMEPAGE_STATS} stats.` };
  }

  const { error } = await supabase
    .from("homepage_stats")
    .insert({ stat_value: "New", stat_label: "Label", sort_order: (count ?? 0) + 1 });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return {};
}

export async function deleteHomepageStat(statId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("homepage_stats").delete().eq("id", statId);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return {};
}
