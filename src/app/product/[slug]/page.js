import { getSupabase } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }){
  const supabase = getSupabase();
  const { slug } = await params;
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
