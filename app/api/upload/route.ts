import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[DEBUG] BLOB_READ_WRITE_TOKEN exists:", !!process.env.BLOB_READ_WRITE_TOKEN)
    console.log("[DEBUG] BLOB_READ_WRITE_TOKEN length:", process.env.BLOB_READ_WRITE_TOKEN?.length)
    console.log("[DEBUG] BLOB_READ_WRITE_TOKEN starts with:", process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 20))

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not configured")
      return NextResponse.json({ error: "Upload service not configured" }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      console.error("[DEBUG] No valid file provided:", file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    
    console.log("[DEBUG] File received:", file.name, file.size, file.type)

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max size is 5MB" }, { status: 400 })
    }

    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
    ]
    if (!validImageTypes.includes(file.type) && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed (JPG, PNG, GIF, WebP, SVG, BMP, TIFF)" },
        { status: 400 },
      )
    }

    // Upload to Vercel Blob with unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const uniqueFileName = `${timestamp}-${sanitizedName}`

    console.log("[DEBUG] About to upload to Blob:", uniqueFileName)
    console.log("[DEBUG] Using token ending with:", process.env.BLOB_READ_WRITE_TOKEN?.slice(-10))

    const blob = await put(uniqueFileName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    
    console.log("[DEBUG] Upload successful:", blob.url)

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
