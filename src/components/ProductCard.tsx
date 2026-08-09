"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import CategoryIcon from "@/components/CategoryIcon";

type Product = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  unit_price: number;
  unit: string;
  stock_quantity: number;
};

export default function ProductCard({ product, showPrice = true }: { product: Product; showPrice?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      unitPrice: product.unit_price,
      unit: product.unit,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="glass-card flex flex-col overflow-hidden transition hover:border-teal-active">
      <div className="flex aspect-[4/3] items-center justify-center border-b border-card-border bg-surface">
        <CategoryIcon category={product.category} className="h-16 w-16 text-teal-active/70" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="mono text-xs text-muted">{product.category}</span>
        <h3 className="mt-2 text-base font-semibold text-foreground">{product.name}</h3>
        {product.description && (
          <p className="mt-2 flex-1 text-sm text-muted">{product.description}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          {showPrice ? (
            <span className="mono text-lg font-bold text-gold">
              ₹{product.unit_price.toLocaleString("en-IN")}
              <span className="text-xs font-normal text-muted"> / {product.unit}</span>
            </span>
          ) : (
            <span className="text-sm font-medium text-muted">Contact for price</span>
          )}
          <button
            onClick={handleAdd}
            disabled={product.stock_quantity <= 0}
            className="rounded-md border border-gold bg-teal-active px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-deep disabled:cursor-not-allowed disabled:border-charcoal disabled:bg-charcoal"
          >
            {product.stock_quantity <= 0 ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
