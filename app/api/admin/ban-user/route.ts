import { NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  console.log('Ban user API called')
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId, isBanned } = await request.json()

    console.log('Banning/Unbanning user:', { userId, isBanned })

    // Get user details before banning
    const { data: targetUser, error: userError } = await supabase
      .from("profiles")
      .select("email, banned_ip")
      .eq("id", userId)
      .single()

    if (userError || !targetUser) {
      console.error('Target user not found:', userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log('Target user details:', targetUser)

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    
    // Create service role client for admin operations (bypasses RLS)
    const adminClient = createServiceRoleClient()
    let deletedProductsCount = 0

    if (isBanned) {
      console.log('Banning user - removing products and adding to ban lists')
      
      // 1. Delete all user's products first
      const { data: userProducts, error: productsError } = await adminClient
        .from("products")
        .select("id, name")
        .eq("seller_id", userId)

      if (productsError) {
        console.error('Error fetching user products:', productsError)
      } else {
        console.log('Found user products:', userProducts)
        deletedProductsCount = userProducts?.length || 0
        
        if (userProducts && userProducts.length > 0) {
          // Delete related orders first
          for (const product of userProducts) {
            await adminClient
              .from("orders")
              .delete()
              .eq("product_id", product.id)
          }

          // Then delete all products
          const { error: deleteProductsError } = await adminClient
            .from("products")
            .delete()
            .eq("seller_id", userId)

          if (deleteProductsError) {
            console.error('Error deleting user products:', deleteProductsError)
          } else {
            console.log(`Deleted ${userProducts.length} products for banned user`)
          }
        }
      }

      // 2. Add IP to ban list (create table if needed)
      if (ip !== "unknown") {
        // Try to insert, if table doesn't exist, it will create it
        try {
          await adminClient
            .from("banned_ips")
            .upsert({
              ip_address: ip,
              banned_by: user.id,
              banned_at: new Date().toISOString(),
              reason: `User ${targetUser.email} banned`
            }, {
              onConflict: 'ip_address'
            })

          console.log('Added IP to ban list:', ip)
        } catch (ipError) {
          console.log('Could not add IP to ban list (table may not exist):', ipError)
        }
      }

      // 3. Add email to ban list
      if (targetUser.email) {
        try {
          await adminClient
            .from("banned_emails")
            .upsert({
              email: targetUser.email,
              banned_by: user.id,
              banned_at: new Date().toISOString(),
              reason: `User banned by admin`
            }, {
              onConflict: 'email'
            })

          console.log('Added email to ban list:', targetUser.email)
        } catch (emailError) {
          console.log('Could not add email to ban list (table may not exist):', emailError)
        }
      }
    } else {
      console.log('Unbanning user - removing from ban lists')
      
      // Remove from ban lists when unbanning
      if (targetUser.email) {
        await adminClient
          .from("banned_emails")
          .delete()
          .eq("email", targetUser.email)

        console.log('Removed email from ban list:', targetUser.email)
      }

      if (targetUser.banned_ip) {
        await adminClient
          .from("banned_ips")
          .delete()
          .eq("ip_address", targetUser.banned_ip)

        console.log('Removed IP from ban list:', targetUser.banned_ip)
      }
    }

    // Update user ban status and store IP if banning
    const updateData: any = { is_banned: isBanned }
    if (isBanned) {
      updateData.banned_ip = ip
      updateData.banned_at = new Date().toISOString()
    } else {
      // Clear banned IP and date when unbanning
      updateData.banned_ip = null
      updateData.banned_at = null
    }

    const { error: updateError } = await adminClient
      .from("profiles")
      .update(updateData)
      .eq("id", userId)

    if (updateError) {
      console.error('Error updating user ban status:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log('User ban status updated successfully')

    // Send warning message to banned user
    if (isBanned && targetUser.email) {
      const warningMessage = `
Dear User,

Your account has been banned from the FarmEgg marketplace due to policy violations.

Actions taken:
- Your account has been suspended
- All your products have been removed from the marketplace
- Your IP address and email have been added to our ban list

If you believe this was done in error, please contact our support team immediately.

To avoid future issues:
- Follow our community guidelines
- Respect other users and sellers
- Only post legitimate products and services

Best regards,
FarmEgg Admin Team
      `.trim()

      await adminClient.from("contact_messages").insert({
        name: "FarmEgg Admin",
        email: "admin@farmegg.com",
        phone: null,
        subject: `Account Ban Notice`,
        contact_reason: "ban_notice",
        message: warningMessage,
        is_read: false
      })

      console.log('Ban notice sent to user')
    }

    return NextResponse.json({ 
      success: true,
      message: isBanned 
        ? `User banned successfully. Removed ${deletedProductsCount} products and added IP/email to ban lists.`
        : "User unbanned successfully and removed from ban lists."
    })
  } catch (error) {
    console.error('Ban user API error:', error)
    return NextResponse.json({ 
      error: `Failed to update user status: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
