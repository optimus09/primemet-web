"use client";

import { useTransition } from "react";
import { deleteProduct } from "./actions";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("Delete this product? This cannot be undone.")) return;
        startTransition(() => deleteProduct(productId));
      }}
      disabled={isPending}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
