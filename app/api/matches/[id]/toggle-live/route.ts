import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid match ID" }, { status: 400 })
    }

    const { isLive } = await request.json()

    if (typeof isLive !== "boolean") {
      return NextResponse.json({ message: "isLive must be a boolean" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if match exists
    const match = await db.collection("matches").findOne({ _id: new ObjectId(id) })
    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }

    // Update live status
    await db.collection("matches").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isLive,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ message: "Live status updated successfully", isLive })
  } catch (error) {
    console.error("Error updating live status:", error)
    return NextResponse.json({ message: "Failed to update live status" }, { status: 500 })
  }
}
