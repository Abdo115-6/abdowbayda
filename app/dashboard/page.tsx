import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardContent from "@/components/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is a seller
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, store_name, store_logo_url, store_slug")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "seller") {
    redirect("/marketplace")
  }

  // Fetch seller's products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardContent
      initialProducts={products || []}
      userEmail={user.email || ""}
      userId={user.id}
      profile={{
        store_name: profile.store_name,
        store_logo_url: profile.store_logo_url,
        store_slug: profile.store_slug,
      }}
    />
  )
}
