import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get all products with their IDs and names
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, seller_id, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('All products in database:', products)
    
    return NextResponse.json({
      count: products?.length || 0,
      products: products || []
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
