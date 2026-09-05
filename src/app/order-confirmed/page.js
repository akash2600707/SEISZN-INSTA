"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function Confirmed() {
  const params = useSearchParams();
  const orderNumber = params.get("order");

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold mb-3">Order Confirmed 🎉</h1>
      <p className="text-neutral-600">
        Thank you! Your order <span className="font-mono font-semibold">{orderNumber}</span> has
        been placed.
      </p>
      <p className="text-neutral-500 text-sm mt-3">
        You'll get an SMS/email once it ships with your Shiprocket tracking ID. Save your order ID
        to track it anytime.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/track-order" className="underline text-sm">
          Track My Order
        </Link>
        <Link href="/" className="underline text-sm text-neutral-500">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={null}>
      <Confirmed />
    </Suspense>
  );
}
