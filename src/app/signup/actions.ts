"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const companyName = String(formData.get("companyName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "/");

  if (!email || !password || password.length < 6) {
    redirect(
      `/signup?error=${encodeURIComponent("Please provide a valid email and a password of at least 6 characters")}&redirect=${encodeURIComponent(redirectTo)}`
    );
  }

  const supabase = await createClient();
  const settings = await getSiteSettings();

  if (settings.require_signup_code) {
    if (!inviteCode) {
      redirect(`/signup?error=${encodeURIComponent("An invite code is required to sign up.")}&redirect=${encodeURIComponent(redirectTo)}`);
    }
    const { data: isValid } = await supabase.rpc("is_valid_signup_code", { input_code: inviteCode.toUpperCase() });
    if (!isValid) {
      redirect(`/signup?error=${encodeURIComponent("That invite code isn't valid.")}&redirect=${encodeURIComponent(redirectTo)}`);
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { contact_name: contactName } },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}&redirect=${encodeURIComponent(redirectTo)}`);
  }

  if (data.user) {
    await supabase
      .from("profiles")
      .update({ company_name: companyName, contact_name: contactName, phone })
      .eq("id", data.user.id);
  }

  redirect(redirectTo);
}
