"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("profiles")
    .update({
      company_name: String(formData.get("companyName") ?? ""),
      contact_name: String(formData.get("contactName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      gst_number: String(formData.get("gstNumber") ?? ""),
    })
    .eq("id", user.id);

  revalidatePath("/account");
}
