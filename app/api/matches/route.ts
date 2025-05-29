import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const matches = await db.collection("matches").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(matches)
  } catch (error) {
    console.error("Error fetching matches:", error)
    return NextResponse.json({ message: "Failed to fetch matches" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { title, team1Id, team2Id, streamUrl, isLive } = data

    if (!title || !team1Id || !team2Id || !streamUrl) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    if (team1Id === team2Id) {
      return NextResponse.json({ message: "Team 1 and Team 2 cannot be the same" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Verify teams exist
    const team1 = await db.collection("teams").findOne({ _id: new ObjectId(team1Id) })
    const team2 = await db.collection("teams").findOne({ _id: new ObjectId(team2Id) })

    if (!team1 || !team2) {
      return NextResponse.json({ message: "One or both teams do not exist" }, { status: 400 })
    }

    // Create match in database
    const result = await db.collection("matches").insertOne({
      title,
      team1Id,
      team2Id,
      streamUrl,
      isLive: isLive || false,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Match created successfully", id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating match:", error)
    return NextResponse.json({ message: "Failed to create match" }, { status: 500 })
  }
}
