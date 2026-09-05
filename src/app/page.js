import Link from "next/link";
import { getSupabase } from "@/lib/db";
import { formatINR } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function Home(){
  const supabase = getSupabase();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    <div>
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-10 text-center">
        <p className="uppercase tracking-[0.3em] text-xs text-neutral-500 mb-3">New Drop</p>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Fashion, drop by drop.</h1>
        <p className="mt-3 text-neutral-500 max-w-md mx-auto">
          Limited pieces. No mandatory sign-up — order in a couple of taps and track it anytime.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-2 md:grid-cols-3 gap-6">
        {(products || []).map((p) => (
          <Link key={p.slug} href={`/product/${p.slug}`} className="group block">
            <div className="aspect-[3/4] bg-neutral-100 overflow-hidden rounded-lg">
              {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
            </div>
            <div className="mt-3">
              <h3 className="text-sm font-medium">{p.name}</h3>
              <p className="text-sm text-neutral-500">{formatINR(p.price)}</p>
            </div>
          </Link>
        ))}
        {(!products || products.length === 0) && <p className="col-span-full text-center text-neutral-500 py-20">No products live yet — add some from /admin.</p>}
      </section>
    </div>
  );
}
