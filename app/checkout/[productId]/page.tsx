import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import CheckoutForm from "@/components/checkout-form"

export default async function CheckoutPage({ params }: { params: { productId: string } }) {
  const supabase = await createClient()
  const { productId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      profiles!products_seller_id_fkey(
        store_name,
        store_logo_url
      )
    `)
    .eq("id", productId)
    .single()

  if (error || !product) {
    console.error("[v0] Error fetching product:", error)
    notFound()
  }

  return <CheckoutForm product={product} userId={user.id} />
}
