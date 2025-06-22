import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI!

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  let client: MongoClient | null = null

  try {
    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid match ID" }, { status: 400 })
    }

    const body = await request.json()
    const { notificationsEnabled } = body

    if (typeof notificationsEnabled !== "boolean") {
      return NextResponse.json({ error: "notificationsEnabled must be a boolean" }, { status: 400 })
    }

    // Connect to MongoDB
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db() // Use default database from connection string
    const collection = db.collection("matches")

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          notificationsEnabled,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Notifications ${notificationsEnabled ? "enabled" : "disabled"}`,
      notificationsEnabled,
    })
  } catch (error) {
    console.error("Error updating match notifications:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}
