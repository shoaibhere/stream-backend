import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    // Get all live matches
    const liveMatches = await db.collection("matches").find({ isLive: true }).sort({ createdAt: -1 }).toArray()

    // Get team and channel details for each match
    const matchesWithDetails = await Promise.all(
      liveMatches.map(async (match) => {
        const team1 = await db.collection("teams").findOne({ _id: new ObjectId(match.team1Id) })
        const team2 = await db.collection("teams").findOne({ _id: new ObjectId(match.team2Id) })
        
        // Get channels for this match
        const channels = await db.collection("channels").find({ 
          _id: { $in: match.channelIds.map((id: string) => new ObjectId(id)) } 
        }).toArray()

        return {
          matchId: match._id,
          title: match.title,
          team1Name: team1?.name || "Unknown Team",
          team1Crest: team1?.crestUrl || null,
          team2Name: team2?.name || "Unknown Team",
          team2Crest: team2?.crestUrl || null,
          channels: channels.map(channel => ({
            channelId: channel._id,
            name: channel.name,
            m3u8Url: channel.m3u8Url,
            headers: channel.headers || []
          }))
        }
      })
    )

    return NextResponse.json(matchesWithDetails)
  } catch (error) {
    console.error("Error fetching live matches:", error)
    return NextResponse.json({ message: "Failed to fetch live matches" }, { status: 500 })
  }
}
