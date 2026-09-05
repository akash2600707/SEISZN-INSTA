"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/orders";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, loaded } = useCart();

  if (!loaded) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-neutral-500 mb-4">Your cart is empty.</p>
        <Link href="/" className="underline text-sm">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold mb-6">Your Cart</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={`${item.slug}-${item.size}`} className="flex items-center gap-4 border-b border-neutral-200 pb-4">
            <div className="w-20 h-24 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
              {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-neutral-500">Size: {item.size}</p>
              <p className="text-sm mt-1">{formatINR(item.price)}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => updateQty(item.slug, item.size, item.qty - 1)}
                  className="w-7 h-7 border rounded-full text-sm"
                >
                  -
                </button>
                <span className="text-sm w-4 text-center">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.slug, item.size, item.qty + 1)}
                  className="w-7 h-7 border rounded-full text-sm"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.slug, item.size)}
                  className="ml-4 text-xs text-neutral-400 underline"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="text-sm font-medium">{formatINR(item.price * item.qty)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center text-lg font-semibold">
        <span>Subtotal</span>
        <span>{formatINR(subtotal)}</span>
      </div>

      <Link
        href="/checkout"
        className="block mt-6 bg-black text-white text-center rounded-full py-3 text-sm font-medium hover:bg-neutral-800 transition"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
