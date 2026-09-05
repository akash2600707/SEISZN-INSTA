import { getSupabase } from "@/lib/db";

export function parseProduct(product) {
  if (!product) return product;
  return {
    ...product,
    sizes: Array.isArray(product.sizes) ? product.sizes : JSON.parse(product.sizes || "[]"),
  };
}

export function parseOrder(order) {
  if (!order) return order;
  return {
    ...order,
    items: Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]"),
  };
}

export async function getProductBySlug(slug, activeOnly = true){
  const supabase = getSupabase();
  let query = supabase.from("products").select("*").eq("slug", slug).limit(1);
  if (activeOnly) query = query.eq("active", true);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}
