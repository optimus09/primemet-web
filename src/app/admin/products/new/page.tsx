import { createClient } from "@/lib/supabase/server";
import { createProduct } from "../actions";
import ProductForm from "../ProductForm";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: categoryRows } = await supabase.from("products").select("category").order("category");
  const categories = Array.from(new Set((categoryRows ?? []).map((r) => r.category)));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Add product</h1>
      <ProductForm action={createProduct} error={params.error} categories={categories} />
    </div>
  );
}
