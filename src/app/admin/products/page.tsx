import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteProductButton from "./DeleteProductButton";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("*").order("category").order("name");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md border border-gold bg-teal-active px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-deep"
        >
          + Add product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-card-border text-muted">
              <th className="py-2 pr-4">SKU</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4">Stock</th>
              <th className="py-2 pr-4">Active</th>
              <th className="py-2 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((product) => (
              <tr key={product.id} className="border-b border-card-border/50">
                <td className="mono py-3 pr-4 text-xs text-muted">{product.sku ?? "—"}</td>
                <td className="py-3 pr-4 text-foreground">{product.name}</td>
                <td className="py-3 pr-4 text-muted">{product.category}</td>
                <td className="mono py-3 pr-4 text-gold">₹{Number(product.unit_price).toLocaleString("en-IN")}/{product.unit}</td>
                <td className="py-3 pr-4 text-muted">{product.stock_quantity}</td>
                <td className="py-3 pr-4">
                  {product.is_active ? (
                    <span className="text-emerald-highlight">Yes</span>
                  ) : (
                    <span className="text-muted">No</span>
                  )}
                </td>
                <td className="flex gap-3 py-3 pr-4">
                  <Link href={`/admin/products/${product.id}/edit`} className="text-emerald-highlight hover:underline">
                    Edit
                  </Link>
                  <DeleteProductButton productId={product.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!products || products.length === 0) && <p className="mt-6 text-muted">No products yet.</p>}
      </div>
    </div>
  );
}
