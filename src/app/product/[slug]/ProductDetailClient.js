"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/orders";

export default function ProductDetailClient({ product }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  function handleAdd() {
    addItem(product, size, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addItem(product, size, 1);
    router.push("/checkout");
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
      <div className="aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        )}
      </div>
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="mt-2 text-lg text-neutral-700">{formatINR(product.price)}</p>
        <p className="mt-4 text-neutral-600 leading-relaxed">{product.description}</p>

        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Size</p>
          <div className="flex gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`w-10 h-10 rounded-full border text-sm ${
                  size === s ? "bg-black text-white border-black" : "border-neutral-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleAdd}
            className="flex-1 border border-black rounded-full py-3 text-sm font-medium hover:bg-neutral-100 transition"
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-black text-white rounded-full py-3 text-sm font-medium hover:bg-neutral-800 transition"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
