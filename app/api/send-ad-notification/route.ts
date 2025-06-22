import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI!

// Lazy load Firebase Admin
async function getFirebaseMessaging() {
  try {
    const { messaging } = await import("@/lib/firebase-admin")
    if (!messaging) {
      throw new Error("Firebase messaging not initialized")
    }
    return messaging
  } catch (error) {
    console.error("Firebase messaging import error:", error)
    throw new Error(`Firebase setup error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null

  try {
    const body = await request.json()
    const { matchId } = body

    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 })
    }

    if (!ObjectId.isValid(matchId)) {
      return NextResponse.json({ error: "Invalid match ID format" }, { status: 400 })
    }

    // Connect to MongoDB
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db()

    // Fetch match details
    const matchesCollection = db.collection("matches")
    const teamsCollection = db.collection("teams")

    const match = await matchesCollection.findOne({ _id: new ObjectId(matchId) })

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    if (!match.isLive) {
      return NextResponse.json({ error: "Match is not currently live" }, { status: 400 })
    }

    // Fetch team details
    const [team1, team2] = await Promise.all([
      teamsCollection.findOne({ _id: new ObjectId(match.team1Id) }),
      teamsCollection.findOne({ _id: new ObjectId(match.team2Id) }),
    ])

    const team1Name = team1?.name || "Team 1"
    const team2Name = team2?.name || "Team 2"

    // Get Firebase messaging
    const messaging = await getFirebaseMessaging()

    // Prepare notification payload for FCM
    const notificationPayload = {
      notification: {
        title: `⚽ ${match.title} is live!`,
        body: `Watch ${team1Name} vs ${team2Name} now!`,
      },
      data: {
        matchId: matchId.toString(),
        type: "live_match_ad",
        team1: team1Name,
        team2: team2Name,
        matchTitle: match.title,
        clickAction: "FLUTTER_NOTIFICATION_CLICK",
      },
      topic: "live-matches",
    }

    console.log("Sending live match notification:", {
      matchId,
      title: match.title,
      teams: `${team1Name} vs ${team2Name}`,
    })

    // Send notification via FCM
    const messageId = await messaging.send(notificationPayload)

    // Create a campaign record for tracking
    const campaignsCollection = db.collection("campaigns")
    await campaignsCollection.insertOne({
      title: `Live Match: ${match.title}`,
      message: {
        title: notificationPayload.notification.title,
        body: notificationPayload.notification.body,
      },
      targetAudience: "live-matches",
      campaignType: "instant",
      status: "sent",
      matchId: matchId,
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      messageId: messageId,
      stats: {
        sent: 1,
        delivered: 1,
        opened: 0,
      },
    })

    console.log("Successfully sent live match notification:", messageId)

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
      messageId: messageId,
      match: {
        title: match.title,
        team1: team1Name,
        team2: team2Name,
      },
    })
  } catch (error) {
    console.error("Error sending notification:", error)

    let errorMessage = "Failed to send notification"
    if (error instanceof Error) {
      if (error.message.includes("Firebase")) {
        errorMessage = `Firebase error: ${error.message}`
      } else if (error.message.includes("MongoDB") || error.message.includes("connection")) {
        errorMessage = "Database connection error"
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}
