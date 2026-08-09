"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setAdminRole(userId: string, makeAdmin: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && user.id === userId && !makeAdmin) {
    return { error: "You can't remove your own admin access. Ask another partner to do it." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: makeAdmin ? "admin" : "customer" })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/admins");
  return {};
}

export async function inviteAdmin(email: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { error: "Enter a valid email address." };
  }

  const { error } = await supabase
    .from("pending_admin_invites")
    .insert({ email: normalizedEmail, invited_by: user?.id });

  if (error) {
    if (error.code === "23505") return { error: "That email is already invited." };
    return { error: error.message };
  }

  revalidatePath("/admin/admins");
  return {};
}

export async function cancelInvite(email: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("pending_admin_invites").delete().eq("email", email);

  if (error) return { error: error.message };

  revalidatePath("/admin/admins");
  return {};
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function createSignupCode(note: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const code = generateCode();

  const { error } = await supabase.from("signup_codes").insert({ code, note: note.trim() || null });

  if (error) return { error: error.message };

  revalidatePath("/admin/admins");
  return {};
}

export async function setSignupCodeActive(code: string, isActive: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("signup_codes").update({ is_active: isActive }).eq("code", code);

  if (error) return { error: error.message };

  revalidatePath("/admin/admins");
  return {};
}
