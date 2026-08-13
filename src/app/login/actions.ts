"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/");

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Email and password are required")}&redirect=${encodeURIComponent(redirectTo)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const ua = (await headers()).get("user-agent");
    console.log("[login-debug]", JSON.stringify({
      emailJSON: JSON.stringify(email),
      emailLength: email.length,
      passwordLength: password.length,
      supabaseError: error.message,
      userAgent: ua,
    }));
    redirect(`/login?error=${encodeURIComponent(error.message)}&redirect=${encodeURIComponent(redirectTo)}`);
  }

  if (data.user && redirectTo === "/") {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    if (profile?.role === "admin") {
      redirect("/admin");
    }
  }

  redirect(redirectTo);
}
