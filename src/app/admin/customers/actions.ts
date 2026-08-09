"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setCustomerBlocked(customerId: string, blocked: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").update({ is_blocked: blocked }).eq("id", customerId);

  if (error) return { error: error.message };

  revalidatePath("/admin/customers");
  return {};
}
