import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import StoreView from "@/components/store-view"

export default async function StorePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { slug } = await params

  let profile = null

  // First, try to find by store_slug
  const { data: profileBySlug } = await supabase
    .from("profiles")
    .select("id, store_name, store_logo_url, store_cover_url, store_slug, role")
    .eq("store_slug", slug)
    .eq("role", "seller")
    .single()

  if (profileBySlug) {
    profile = profileBySlug
  } else {
    // Fallback: try to find by user ID
    const { data: profileById } = await supabase
      .from("profiles")
      .select("id, store_name, store_logo_url, store_cover_url, store_slug, role")
      .eq("id", slug)
      .eq("role", "seller")
      .single()

    profile = profileById
  }

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
      storeCover={profile.store_cover_url}
      products={products || []}
      sellerId={profile.id}
    />
  )
}
