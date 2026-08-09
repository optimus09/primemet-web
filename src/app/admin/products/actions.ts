"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseProductForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    sku: String(formData.get("sku") ?? "").trim() || null,
    description: String(formData.get("description") ?? ""),
    unit_price: Number(formData.get("unitPrice") ?? 0),
    unit: String(formData.get("unit") ?? "piece"),
    stock_quantity: Number(formData.get("stockQuantity") ?? 0),
    is_active: formData.get("isActive") === "on",
  };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const values = parseProductForm(formData);

  const { error } = await supabase.from("products").insert(values);
  if (error) {
    redirect(`/admin/products/new?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();
  const values = parseProductForm(formData);

  const { error } = await supabase.from("products").update(values).eq("id", productId);
  if (error) {
    redirect(`/admin/products/${productId}/edit?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", productId);
  revalidatePath("/admin/products");
}
