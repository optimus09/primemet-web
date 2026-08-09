"use client";

type Product = {
  name: string;
  category: string;
  description: string | null;
  unit_price: number;
  unit: string;
  stock_quantity: number;
  is_active: boolean;
  sku?: string | null;
};

export default function ProductForm({
  action,
  product,
  error,
  categories = [],
}: {
  action: (formData: FormData) => void;
  product?: Product;
  error?: string;
  categories?: string[];
}) {
  return (
    <form action={action} className="mt-6 flex max-w-xl flex-col gap-4">
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label htmlFor="name" className="block text-sm text-muted">Name</label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name}
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <div>
          <label htmlFor="sku" className="block text-sm text-muted">SKU</label>
          <input
            id="sku"
            name="sku"
            defaultValue={product?.sku ?? ""}
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
      </div>
      <div>
        <label htmlFor="category" className="block text-sm text-muted">Category</label>
        <input
          id="category"
          name="category"
          list="category-options"
          required
          defaultValue={product?.category ?? ""}
          className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
        />
        <datalist id="category-options">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm text-muted">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description ?? ""}
          className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="unitPrice" className="block text-sm text-muted">Unit price (₹)</label>
          <input
            id="unitPrice"
            name="unitPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.unit_price}
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm text-muted">Unit</label>
          <input
            id="unit"
            name="unit"
            defaultValue={product?.unit ?? "piece"}
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
        <div>
          <label htmlFor="stockQuantity" className="block text-sm text-muted">Stock qty</label>
          <input
            id="stockQuantity"
            name="stockQuantity"
            type="number"
            min="0"
            defaultValue={product?.stock_quantity}
            className="mt-1 w-full rounded-md border border-card-border bg-surface px-3 py-2 text-foreground outline-none focus:border-teal-active"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="isActive" defaultChecked={product?.is_active ?? true} className="h-4 w-4 accent-emerald-highlight" />
        Active (visible in catalog)
      </label>
      <button
        type="submit"
        className="mt-2 self-start rounded-md border border-gold bg-teal-active px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-deep"
      >
        Save product
      </button>
    </form>
  );
}
