"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/orders";

export default function AdminDashboard() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({
    slug: "",
    name: "",
    description: "",
    price: "",
    image_url: "",
  });
  const router = useRouter();

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    if (res.status === 401) return router.push("/admin");
    const data = await res.json();
    setProducts(data.products || []);
  }

  async function loadOrders() {
    const res = await fetch("/api/admin/orders");
    if (res.status === 401) return router.push("/admin");
    const data = await res.json();
    setOrders(data.orders || []);
  }

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  async function handleAddProduct(e) {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newProduct, price: Math.round(Number(newProduct.price) * 100) }),
    });
    if (res.ok) {
      setNewProduct({ slug: "", name: "", description: "", price: "", image_url: "" });
      loadProducts();
    } else {
      const d = await res.json();
      alert(d.error || "Failed to add product");
    }
  }

  async function toggleActive(p) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: p.active ? 0 : 1 }),
    });
    loadProducts();
  }

  async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  async function updateOrderTracking(order, tracking_id, courier) {
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shiprocket_tracking_id: tracking_id,
        shiprocket_courier: courier,
        status: tracking_id ? "shipped" : order.status,
      }),
    });
    loadOrders();
  }

  async function markDelivered(order) {
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "delivered" }),
    });
    loadOrders();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setTab("products")}
            className={`px-4 py-2 rounded-full ${tab === "products" ? "bg-black text-white" : "border"}`}
          >
            Products
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2 rounded-full ${tab === "orders" ? "bg-black text-white" : "border"}`}
          >
            Orders
          </button>
        </div>
      </div>

      {tab === "products" && (
        <div>
          <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-3 mb-8 border rounded-lg p-5">
            <input
              required
              placeholder="Slug (e.g. summer-dress)"
              className="border rounded-lg px-3 py-2 text-sm"
              value={newProduct.slug}
              onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
            />
            <input
              required
              placeholder="Name"
              className="border rounded-lg px-3 py-2 text-sm"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
              required
              type="number"
              step="0.01"
              placeholder="Price (₹)"
              className="border rounded-lg px-3 py-2 text-sm"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <input
              placeholder="Image URL"
              className="border rounded-lg px-3 py-2 text-sm"
              value={newProduct.image_url}
              onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
            <button className="md:col-span-2 bg-black text-white rounded-full py-2 text-sm">
              Add Product
            </button>
          </form>

          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <p className="font-medium text-sm">{p.name} {!p.active && <span className="text-neutral-400">(hidden)</span>}</p>
                  <p className="text-xs text-neutral-500">{p.slug} — {formatINR(p.price)}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => toggleActive(p)} className="border rounded-full px-3 py-1">
                    {p.active ? "Hide" : "Unhide"}
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="border rounded-full px-3 py-1 text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 && <p className="text-neutral-500 text-sm">No orders yet.</p>}
          {orders.map((o) => (
            <div key={o.id} className="border rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="font-mono font-medium">{o.order_number}</span>
                <span className="uppercase text-xs px-2 py-1 rounded-full bg-neutral-100">{o.status}</span>
              </div>
              <p className="text-sm mt-1">{o.customer_name} — {o.phone}</p>
              <p className="text-xs text-neutral-500">{o.address}, {o.city}, {o.state} {o.pincode}</p>
              <div className="mt-2 text-sm">
                {o.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.name} ({item.size}) × {item.qty}</span>
                    <span>{formatINR(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-medium text-sm mt-2 border-t pt-2">
                <span>Total</span>
                <span>{formatINR(o.subtotal)}</span>
              </div>

              <OrderTrackingForm order={o} onSave={updateOrderTracking} onDelivered={markDelivered} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderTrackingForm({ order, onSave, onDelivered }) {
  const [tracking, setTracking] = useState(order.shiprocket_tracking_id || "");
  const [courier, setCourier] = useState(order.shiprocket_courier || "");

  return (
    <div className="mt-3 pt-3 border-t flex flex-wrap gap-2 items-center">
      <input
        placeholder="Shiprocket Tracking ID"
        className="border rounded-lg px-3 py-1.5 text-xs flex-1 min-w-[140px]"
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
      />
      <input
        placeholder="Courier"
        className="border rounded-lg px-3 py-1.5 text-xs flex-1 min-w-[100px]"
        value={courier}
        onChange={(e) => setCourier(e.target.value)}
      />
      <button
        onClick={() => onSave(order, tracking, courier)}
        className="bg-black text-white rounded-full px-3 py-1.5 text-xs"
      >
        Save & Mark Shipped
      </button>
      {order.status === "shipped" && (
        <button
          onClick={() => onDelivered(order)}
          className="border rounded-full px-3 py-1.5 text-xs"
        >
          Mark Delivered
        </button>
      )}
    </div>
  );
}
