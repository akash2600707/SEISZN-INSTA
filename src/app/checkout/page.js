"use client";
import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/orders";

export default function CheckoutPage() {
  const { items, subtotal, clearCart, loaded } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePay(e) {
    e.preventDefault();
    setError("");
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create order");

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "Seiszn",
        description: `Order ${data.order_number}`,
        order_id: data.razorpay_order_id,
        prefill: {
          name: form.customer_name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#000000" },
        handler: async function (response) {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            clearCart();
            router.push(`/order-confirmed?order=${verifyData.order_number}`);
          } else {
            setError("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) return null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-3xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
        <form onSubmit={handlePay} className="space-y-4">
          <h1 className="text-xl font-semibold mb-2">Delivery Details</h1>
          <input
            required
            placeholder="Full Name"
            className="w-full border rounded-lg px-4 py-2 text-sm"
            value={form.customer_name}
            onChange={(e) => update("customer_name", e.target.value)}
          />
          <input
            required
            placeholder="Phone Number"
            className="w-full border rounded-lg px-4 py-2 text-sm"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <input
            type="email"
            placeholder="Email (optional, for order updates)"
            className="w-full border rounded-lg px-4 py-2 text-sm"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
          <textarea
            required
            placeholder="Address"
            className="w-full border rounded-lg px-4 py-2 text-sm"
            rows={3}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="City"
              className="border rounded-lg px-4 py-2 text-sm"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
            <input
              required
              placeholder="State"
              className="border rounded-lg px-4 py-2 text-sm"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
            />
          </div>
          <input
            required
            placeholder="Pincode"
            className="w-full border rounded-lg px-4 py-2 text-sm"
            value={form.pincode}
            onChange={(e) => update("pincode", e.target.value)}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-full py-3 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : `Pay ${formatINR(subtotal)}`}
          </button>
          <p className="text-xs text-neutral-400 text-center">No account needed. You'll get an order ID to track your delivery.</p>
        </form>

        <div>
          <h2 className="text-sm font-medium mb-3">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={`${item.slug}-${item.size}`} className="flex justify-between text-sm">
                <span>
                  {item.name} ({item.size}) × {item.qty}
                </span>
                <span>{formatINR(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-200 mt-4 pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatINR(subtotal)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
