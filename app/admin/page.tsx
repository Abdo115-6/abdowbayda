import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminAnalytics from "@/components/admin-analytics"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role, email, is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/marketplace")
  }

  // Get current user profile
  // const { data: profile } = await supabase.from("profiles").select("role, email").eq("id", user.id).single()

  // For now, any logged-in user can access analytics
  // You can add admin role check here if needed
  // if (profile?.role !== "admin") {
  //   redirect("/marketplace")
  // }

  // Fetch all users with their profiles
  const { data: allProfiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  // Fetch all products with seller info
  const { data: allProducts } = await supabase
    .from("products")
    .select("*, profiles!products_seller_id_fkey(store_name, email, role)")
    .order("created_at", { ascending: false })

  // Fetch all orders with product and seller info
  const { data: allOrders } = await supabase
    .from("orders")
    .select(`
      *,
      products(name, price, category, seller_id, profiles!products_seller_id_fkey(store_name, email)),
      profiles!orders_buyer_id_fkey(email, role)
    `)
    .order("created_at", { ascending: false })

  // Fetch all contact messages
  const { data: contactMessages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: siteSettings } = await supabase.from("site_settings").select("*").single()

  return (
    <AdminAnalytics
      profiles={allProfiles || []}
      products={allProducts || []}
      orders={allOrders || []}
      contactMessages={contactMessages || []}
      currentUserEmail={user.email || ""}
      siteSettings={siteSettings || null}
    />
  )
}
