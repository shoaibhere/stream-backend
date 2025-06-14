import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const channels = await db.collection("channels").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(channels)
  } catch (error) {
    console.error("Error fetching channels:", error)
    return NextResponse.json({ message: "Failed to fetch channels" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, m3u8Url, headers } = data

    if (!name || !m3u8Url) {
      return NextResponse.json({ message: "Channel name and m3u8 URL are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if channel with same name already exists
    const existingChannel = await db.collection("channels").findOne({ name })
    if (existingChannel) {
      return NextResponse.json({ message: "A channel with this name already exists" }, { status: 400 })
    }

    // Validate headers format
    const validatedHeaders = headers || []
    if (!Array.isArray(validatedHeaders)) {
      return NextResponse.json({ message: "Headers must be an array" }, { status: 400 })
    }

    for (const header of validatedHeaders) {
      if (!header.name || !header.value) {
        return NextResponse.json({ message: "Each header must have a name and value" }, { status: 400 })
      }
    }

    // Create channel in database
    const result = await db.collection("channels").insertOne({
      name,
      m3u8Url,
      headers: validatedHeaders,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Channel created successfully", id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating channel:", error)
    return NextResponse.json({ message: "Failed to create channel" }, { status: 500 })
  }
}
