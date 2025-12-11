import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log("Dashboard debug endpoint called")
    
    // Check environment variables
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing",
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ? "✅ Set" : "❌ Missing",
    }

    // Test Supabase connection
    const supabase = await createClient()
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    let userInfo = null
    let profileInfo = null
    let productsInfo = null

    if (user && !authError) {
      userInfo = {
        id: user.id,
        email: user.email,
        authenticated: true
      }

      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, store_name, store_logo_url, store_slug")
        .eq("id", user.id)
        .single()

      profileInfo = {
        profile: profile,
        error: profileError?.message || null,
        isSeller: profile?.role === "seller"
      }

      if (profile?.role === "seller") {
        // Check products
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false })

        productsInfo = {
          count: products?.length || 0,
          error: productsError?.message || null
        }
      }
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      envVars,
      auth: {
        user: userInfo,
        authError: authError?.message || null
      },
      profile: profileInfo,
      products: productsInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Dashboard debug error:", error)
    return NextResponse.json({
      error: "Debug endpoint error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
