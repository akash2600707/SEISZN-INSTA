import db from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = db.prepare("SELECT * FROM products WHERE slug = ? AND active = 1").get(slug);
  if (!product) notFound();
  const parsed = { ...product, sizes: JSON.parse(product.sizes) };
  return <ProductDetailClient product={parsed} />;
}
