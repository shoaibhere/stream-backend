import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid match ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    const match = await db.collection("matches").findOne({ _id: new ObjectId(id) })

    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }

    return NextResponse.json(match)
  } catch (error) {
    console.error("Error fetching match:", error)
    return NextResponse.json({ message: "Failed to fetch match" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid match ID" }, { status: 400 })
    }

    const data = await request.json()
    const { title, team1Id, team2Id, channelIds, isLive } = data

    if (!title || !team1Id || !team2Id || !channelIds || !Array.isArray(channelIds) || channelIds.length === 0) {
      return NextResponse.json({ message: "Missing required fields or no channels selected" }, { status: 400 })
    }

    if (team1Id === team2Id) {
      return NextResponse.json({ message: "Team 1 and Team 2 cannot be the same" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if match exists
    const existingMatch = await db.collection("matches").findOne({ _id: new ObjectId(id) })
    if (!existingMatch) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }

    // Verify teams exist
    const team1 = await db.collection("teams").findOne({ _id: new ObjectId(team1Id) })
    const team2 = await db.collection("teams").findOne({ _id: new ObjectId(team2Id) })

    if (!team1 || !team2) {
      return NextResponse.json({ message: "One or both teams do not exist" }, { status: 400 })
    }

    // Verify channels exist
    const channels = await db.collection("channels").find({ 
      _id: { $in: channelIds.map((id: string) => new ObjectId(id)) } 
    }).toArray()

    if (channels.length !== channelIds.length) {
      return NextResponse.json({ message: "One or more channels do not exist" }, { status: 400 })
    }

    // Update match in database
    await db.collection("matches").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          team1Id,
          team2Id,
          channelIds,
          isLive: isLive || false,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ message: "Match updated successfully" })
  } catch (error) {
    console.error("Error updating match:", error)
    return NextResponse.json({ message: "Failed to update match" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid match ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if match exists
    const match = await db.collection("matches").findOne({ _id: new ObjectId(id) })
    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }

    // Delete match from database
    await db.collection("matches").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Match deleted successfully" })
  } catch (error) {
    console.error("Error deleting match:", error)
    return NextResponse.json({ message: "Failed to delete match" }, { status: 500 })
  }
}
