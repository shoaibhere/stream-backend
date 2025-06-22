import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI!

// Lazy load Firebase Admin to avoid initialization issues
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  let client: MongoClient | null = null
  const { id } = params

  try {
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 })
    }

    // Connect to MongoDB
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db()
    const campaignsCollection = db.collection("campaigns")

    const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.status === "sent") {
      return NextResponse.json({ error: "Campaign has already been sent" }, { status: 400 })
    }

    // Get Firebase messaging
    const messaging = await getFirebaseMessaging()

    // Determine the target topic
    let targetTopic = "all-users" // default topic
    if (campaign.targetAudience === "live-matches") {
      targetTopic = "live-matches"
    } else if (campaign.targetAudience === "custom" && campaign.customTopic) {
      targetTopic = campaign.customTopic
    }

    // Prepare notification payload
    const notificationPayload = {
      notification: {
        title: campaign.message.title,
        body: campaign.message.body,
      },
      data: {
        campaignId: id,
        type: "campaign",
        campaignTitle: campaign.title,
        targetAudience: campaign.targetAudience,
        ...(campaign.matchId && { matchId: campaign.matchId }),
      },
      topic: targetTopic,
    }

    console.log("Sending campaign notification:", {
      campaignId: id,
      title: campaign.message.title,
      topic: targetTopic,
    })

    // Send notification via FCM
    const messageId = await messaging.send(notificationPayload)

    // Update campaign status and stats
    const updateResult = await campaignsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "sent",
          sentAt: new Date().toISOString(),
          messageId: messageId,
          stats: {
            sent: 1, // In a real app, you'd get actual delivery stats from FCM
            delivered: 1,
            opened: 0,
          },
        },
      },
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Failed to update campaign status" }, { status: 500 })
    }

    console.log("Successfully sent campaign notification:", messageId)

    return NextResponse.json({
      success: true,
      message: "Campaign sent successfully",
      messageId: messageId,
      campaign: {
        title: campaign.title,
        targetAudience: campaign.targetAudience,
        topic: targetTopic,
      },
    })
  } catch (error) {
    console.error("Error sending campaign:", error)

    // Update campaign status to failed if it exists
    if (client) {
      try {
        const db = client.db()
        await db.collection("campaigns").updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              status: "failed",
              failedAt: new Date().toISOString(),
              error: error instanceof Error ? error.message : "Unknown error",
            },
          },
        )
      } catch (updateError) {
        console.error("Failed to update campaign status:", updateError)
      }
    }

    let errorMessage = "Failed to send campaign"
    if (error instanceof Error) {
      if (error.message.includes("Firebase")) {
        errorMessage = `Firebase error: ${error.message}`
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
