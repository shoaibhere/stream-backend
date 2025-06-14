import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid channel ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    const channel = await db.collection("channels").findOne({ _id: new ObjectId(id) })

    if (!channel) {
      return NextResponse.json({ message: "Channel not found" }, { status: 404 })
    }

    return NextResponse.json(channel)
  } catch (error) {
    console.error("Error fetching channel:", error)
    return NextResponse.json({ message: "Failed to fetch channel" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid channel ID" }, { status: 400 })
    }

    const data = await request.json()
    const { name, m3u8Url, headers } = data

    if (!name || !m3u8Url) {
      return NextResponse.json({ message: "Channel name and m3u8 URL are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if channel exists
    const existingChannel = await db.collection("channels").findOne({ _id: new ObjectId(id) })
    if (!existingChannel) {
      return NextResponse.json({ message: "Channel not found" }, { status: 404 })
    }

    // Check if another channel with the same name exists
    const duplicateChannel = await db.collection("channels").findOne({
      name,
      _id: { $ne: new ObjectId(id) },
    })

    if (duplicateChannel) {
      return NextResponse.json({ message: "Another channel with this name already exists" }, { status: 400 })
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

    // Update channel in database
    await db.collection("channels").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          m3u8Url,
          headers: validatedHeaders,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ message: "Channel updated successfully" })
  } catch (error) {
    console.error("Error updating channel:", error)
    return NextResponse.json({ message: "Failed to update channel" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid channel ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if channel exists
    const channel = await db.collection("channels").findOne({ _id: new ObjectId(id) })
    if (!channel) {
      return NextResponse.json({ message: "Channel not found" }, { status: 404 })
    }

    // Check if channel is used in any matches
    const matchesUsingChannel = await db.collection("matches").findOne({
      channelIds: id,
    })

    if (matchesUsingChannel) {
      return NextResponse.json({ message: "Cannot delete channel as it is used in one or more matches" }, { status: 400 })
    }

    // Delete channel from database
    await db.collection("channels").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Channel deleted successfully" })
  } catch (error) {
    console.error("Error deleting channel:", error)
    return NextResponse.json({ message: "Failed to delete channel" }, { status: 500 })
  }
}
