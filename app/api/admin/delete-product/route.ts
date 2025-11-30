import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  console.log('Delete product API called')
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { productId, sellerId, sellerEmail, productName } = body

    if (!productId || !sellerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log('Deleting product:', { productId, sellerId, productName })

    // First, check if the product actually exists
    const { data: existingProduct, error: checkError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()

    if (checkError || !existingProduct) {
      console.log('Product does not exist or error checking:', checkError)
      return NextResponse.json(
        { error: "Product not found or already deleted" },
        { status: 404 }
      )
    }

    console.log('Product found in database:', existingProduct)

    // Create service role client for admin operations (bypasses RLS)
    const adminClient = createServiceRoleClient()

    // Delete related orders first (if any)
    const { error: ordersDeleteError } = await adminClient
      .from("orders")
      .delete()
      .eq("product_id", productId)
      .eq("status", "pending") // Only delete pending orders

    if (ordersDeleteError) {
      console.error('Error deleting related orders:', ordersDeleteError)
      // Continue anyway, as this is not critical
    } else {
      console.log('Related orders deleted (if any)')
    }

    // Delete the product using service role client to bypass RLS
    const { data: deletedData, error: productDeleteError } = await adminClient
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("seller_id", sellerId) // Extra security check
      .select() // Return the deleted row

    if (productDeleteError) {
      console.error('Database error:', productDeleteError)
      return NextResponse.json(
        { error: `Failed to delete product: ${productDeleteError.message}` },
        { status: 500 }
      )
    }

    console.log('Delete result:', deletedData)
    
    if (!deletedData || deletedData.length === 0) {
      console.error('No product was deleted - possible permission issue or wrong IDs')
      return NextResponse.json(
        { error: "No product was deleted - check product ID and seller ID" },
        { status: 400 }
      )
    }

    // Create a contact message as a warning to the seller
    if (sellerEmail && productName) {
      const warningMessage = `
Dear Seller,

This is an automated message to inform you that your product "${productName}" has been removed from the FarmEgg marketplace by our admin team.

Reason for removal:
- Policy violation or quality concerns
- Non-compliance with marketplace guidelines

If you believe this was done in error, please contact our support team immediately.

To avoid future issues:
- Ensure all products meet our quality standards
- Follow marketplace guidelines strictly
- Provide accurate product descriptions and images

Best regards,
FarmEgg Admin Team
      `.trim()

      await adminClient.from("contact_messages").insert({
        name: "FarmEgg Admin",
        email: "admin@farmegg.com",
        phone: null,
        subject: `Product Removal Warning - ${productName}`,
        contact_reason: "warning",
        message: warningMessage,
        is_read: false
      })

      console.log('Warning message created for seller')
    }

    console.log('Product deleted successfully')
    return NextResponse.json(
      { 
        message: "Product deleted successfully and warning sent to seller",
        productId
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete product API error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
