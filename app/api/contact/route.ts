import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  console.log('Contact API called')
  try {
    const supabase = await createClient()
    console.log('Supabase client created')
    
    // Parse JSON data
    const body = await request.json()
    console.log('Request body:', body)
    
    const contactData = {
      name: body.name || "",
      email: body.email || "",
      phone: body.phone || null,
      subject: body.subject || "",
      contact_reason: body.contactReason || "",
      message: body.message || "",
    }

    console.log('Contact data prepared:', contactData)

    // Validate required fields
    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.contact_reason || !contactData.message) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // For now, we'll handle file uploads separately or store file info as base64
    // You can extend this later to handle actual file uploads

    // Insert contact message into database
    console.log('Attempting to insert into database...')
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        ...contactData,
        file_url: body.fileUrl || null,
        file_name: body.fileName || null
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to save message: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('Successfully inserted:', data)
    return NextResponse.json(
      { 
        message: "Contact message sent successfully",
        id: data.id
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
