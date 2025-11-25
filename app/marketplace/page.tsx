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
    .select(
      `
      *,
      profiles!products_seller_id_fkey (
        id,
        store_name,
        store_logo_url,
        store_slug
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (productsError) {
    console.error("[v0] Error fetching products:", productsError)
  }

  return (
    <MarketplaceContent
      initialProducts={products || []}
      userEmail={user.email || ""}
      userRole={profile?.role || null}
    />
  )
}
