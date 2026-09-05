"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="text-xl font-semibold mb-6">Admin Login</h1>
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          required
          placeholder="Username"
          className="w-full border rounded-lg px-4 py-2 text-sm"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg px-4 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-black text-white rounded-full py-3 text-sm font-medium">
          Log In
        </button>
      </form>
      <p className="text-xs text-neutral-400 mt-4">
        Default: admin / change-me-123 — change this in the database after first login.
      </p>
    </div>
  );
}
