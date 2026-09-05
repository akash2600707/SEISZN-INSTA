"use client";
import { useState } from "react";
import { formatINR } from "@/lib/orders";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack(e) {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: orderNumber, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order not found");
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const statusLabel = {
    paid: "Order Placed",
    shipped: "Shipped",
    delivered: "Delivered",
    failed: "Payment Failed",
  };

  return (
    <div className="max-w-md mx-auto px-6 py-14">
      <h1 className="text-xl font-semibold mb-6">Track Your Order</h1>
      <form onSubmit={handleTrack} className="space-y-3">
        <input
          required
          placeholder="Order ID (e.g. SZ-XXXXXXXX)"
          className="w-full border rounded-lg px-4 py-2 text-sm"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
        <input
          required
          placeholder="Phone Number used at checkout"
          className="w-full border rounded-lg px-4 py-2 text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-full py-3 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-50"
        >
          {loading ? "Searching..." : "Track Order"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      {order && (
        <div className="mt-8 border rounded-lg p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-500">Order</span>
            <span className="font-mono">{order.order_number}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-500">Status</span>
            <span className="font-medium">{statusLabel[order.status] || order.status}</span>
          </div>
          {order.shiprocket_tracking_id && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-500">Tracking ID</span>
              <span className="font-mono">{order.shiprocket_tracking_id}</span>
            </div>
          )}
          {order.shiprocket_courier && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-500">Courier</span>
              <span>{order.shiprocket_courier}</span>
            </div>
          )}
          <div className="border-t border-neutral-200 mt-3 pt-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.name} ({item.size}) × {item.qty}
                </span>
                <span>{formatINR(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-semibold mt-3">
            <span>Total</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
