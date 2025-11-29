import { createClient } from "@/lib/supabase/server"
import MarketplaceContent from "@/components/marketplace-content"

export default async function MarketplacePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return <MarketplaceContent initialProducts={[]} userEmail="" userRole={null} />
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, category, created_at, seller_id")
    .order("created_at", { ascending: false })

  if (productsError) {
    console.error("[v0] Error fetching products:", productsError)
    return <MarketplaceContent initialProducts={[]} userEmail={user.email || ""} userRole={profile?.role || null} />
  }

  console.log("[v0] Products fetched:", products?.length || 0)

  let productsWithProfiles = products || []
  if (products && products.length > 0) {
    // Get unique seller IDs
    const sellerIds = [...new Set(products.map((p) => p.seller_id))]
    console.log("[v0] Unique seller IDs:", sellerIds)

    // Fetch all seller profiles in one query
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, store_name, store_logo_url, store_slug")
      .in("id", sellerIds)

    console.log("[v0] Profiles fetched:", profiles?.length || 0, profiles)

    if (profilesError) {
      console.error("[v0] Error fetching profiles:", profilesError)
    }

    // Create a map for quick profile lookup
    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

    productsWithProfiles = products.map((product) => {
      const profile = profileMap.get(product.seller_id)
      console.log("[v0] Product:", product.name, "Seller ID:", product.seller_id, "Profile:", profile)
      return {
        ...product,
        profiles: profile || null,
      }
    })
  }

  console.log("[v0] Final products with profiles:", productsWithProfiles.length)

  return (
    <MarketplaceContent
      initialProducts={productsWithProfiles}
      userEmail={user.email || ""}
      userRole={profile?.role || null}
    />
  )
}
