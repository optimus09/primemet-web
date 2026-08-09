import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "../../actions";
import ProductForm from "../../ProductForm";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  const { data: categoryRows } = await supabase.from("products").select("category").order("category");
  const categories = Array.from(new Set((categoryRows ?? []).map((r) => r.category)));

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Edit product</h1>
      <ProductForm action={boundUpdate} product={product} error={error} categories={categories} />
    </div>
  );
}
