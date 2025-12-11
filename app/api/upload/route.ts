import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max size is 5MB" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // Try Vercel Blob first, fall back to base64 if not available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(file.name, file, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })

        return NextResponse.json({
          url: blob.url,
          filename: file.name,
          size: file.size,
          type: file.type,
        })
      } catch (blobError) {
        console.error("[v0] Blob upload failed:", blobError)
        // Fall through to alternative method
      }
    }

    // Alternative: Convert to base64 data URL (temporary solution)
    console.log("[v0] Using fallback base64 upload method")
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      url: dataUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
      fallback: true,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
