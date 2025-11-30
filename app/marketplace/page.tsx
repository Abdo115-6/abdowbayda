import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import MarketplaceContent from "@/components/marketplace-content"

export default async function MarketplacePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    const { data: siteSettings } = await supabase.from("site_settings").select("*").single()
    return (
      <MarketplaceContent
        initialProducts={[]}
        userEmail=""
        userRole={null}
        heroImage={siteSettings?.marketplace_hero_image || null}
      />
    )
  }

  // Get user profile to check role and ban status
  const { data: profile } = await supabase.from("profiles").select("role, is_banned").eq("id", user.id).single()

  if (profile?.is_banned) {
    await supabase.auth.signOut()
    redirect("/auth/login?banned=true")
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, category, city, created_at, seller_id")
    .order("created_at", { ascending: false })

  if (productsError) {
    console.error("[v0] Error fetching products:", productsError)
    const { data: siteSettings } = await supabase.from("site_settings").select("*").single()
    return (
      <MarketplaceContent
        initialProducts={[]}
        userEmail={user.email || ""}
        userRole={profile?.role || null}
        heroImage={siteSettings?.marketplace_hero_image || null}
      />
    )
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

  const { data: siteSettings } = await supabase.from("site_settings").select("*").single()

  return (
    <MarketplaceContent
      initialProducts={productsWithProfiles}
      userEmail={user.email || ""}
      userRole={profile?.role || null}
      heroImage={siteSettings?.marketplace_hero_image || null}
    />
  )
}
