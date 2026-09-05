"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function Nav() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl tracking-[0.2em] font-semibold">
          SEISZN
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-neutral-500">Shop</Link>
          <Link href="/track-order" className="hover:text-neutral-500">Track Order</Link>
          <Link href="/cart" className="relative hover:text-neutral-500">
            Cart
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
