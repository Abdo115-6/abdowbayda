import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import CheckoutForm from "@/components/checkout-form"

export default async function CheckoutPage({ params }: { params: { productId: string } }) {
  try {
    const supabase = await createClient()
    const { productId } = await params

    console.log("[CHECKOUT] Product ID:", productId)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[CHECKOUT] User not authenticated, redirecting to login")
      redirect("/auth/login")
    }

    console.log("[CHECKOUT] User authenticated:", user.id)

    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        profiles (
          store_name,
          store_logo_url
        )
      `)
      .eq("id", productId)
      .single()

    if (error) {
      console.error("[CHECKOUT] Error fetching product:", error)
      notFound()
    }

    if (!product) {
      console.error("[CHECKOUT] Product not found for ID:", productId)
      notFound()
    }

    console.log("[CHECKOUT] Product found:", product.name)

    return <CheckoutForm product={product} userId={user.id} />
  } catch (error) {
    console.error("[CHECKOUT] Unexpected error:", error)
    notFound()
  }
}
