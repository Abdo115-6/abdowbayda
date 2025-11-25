import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import StoreView from "@/components/store-view"

export default async function StorePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, store_name, store_logo_url, store_slug, role")
    .eq("store_slug", slug)
    .eq("role", "seller")
    .single()

  if (!profile) {
    notFound()
  }

  // Fetch seller's products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", profile.id)
    .gt("stock", 0)
    .order("created_at", { ascending: false })

  return (
    <StoreView
      storeName={profile.store_name || "Store"}
      storeLogo={profile.store_logo_url}
      products={products || []}
      sellerId={profile.id}
    />
  )
}
