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

export async function GET() {
  let client: MongoClient | null = null

  try {
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db()
    const collection = db.collection("campaigns")

    const campaigns = await collection.find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null

  try {
    // Parse and validate request body
    let data
    try {
      data = await request.json()
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Validate required fields
    if (!data.title || !data.message?.title || !data.message?.body) {
      return NextResponse.json({ 
        error: "Missing required fields: title, message.title, and message.body are required" 
      }, { status: 400 })
    }

    if (!data.targetAudience) {
      return NextResponse.json({ error: "targetAudience is required" }, { status: 400 })
    }

    if (data.targetAudience === "custom" && !data.customTopic) {
      return NextResponse.json({ error: "customTopic is required when targetAudience is 'custom'" }, { status: 400 })
    }

    const campaign = {
      title: data.title,
      message: {
        title: data.message.title,
        body: data.message.body,
      },
      targetAudience: data.targetAudience,
      ...(data.customTopic && { customTopic: data.customTopic }),
      campaignType: data.campaignType || "instant",
      ...(data.scheduledAt && { scheduledAt: data.scheduledAt }),
      ...(data.matchId && { matchId: data.matchId }),
      status: data.status || "draft",
      createdAt: new Date().toISOString(),
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
      },
    }

    console.log("Creating campaign:", campaign)

    client = new MongoClient(uri)
    await client.connect()
    const db = client.db()
    const campaignsCollection = db.collection("campaigns")

    const result = await campaignsCollection.insertOne(campaign)
    console.log("Campaign created with ID:", result.insertedId)

    // If it's an instant campaign, send it immediately
    if (data.campaignType === "instant" || data.status === "sent") {
      try {
        console.log("Sending instant campaign:", result.insertedId)

        // Get Firebase messaging
        const messaging = await getFirebaseMessaging()

        // If it's a match-specific campaign, get match details
        let enhancedData = { ...data }
        if (data.matchId && ObjectId.isValid(data.matchId)) {
          try {
            const matchesCollection = db.collection("matches")
            const teamsCollection = db.collection("teams")

            const match = await matchesCollection.findOne({ _id: new ObjectId(data.matchId) })
            if (match) {
              const [team1, team2] = await Promise.all([
                teamsCollection.findOne({ _id: new ObjectId(match.team1Id) }),
                teamsCollection.findOne({ _id: new ObjectId(match.team2Id) }),
              ])

              enhancedData = {
                ...data,
                matchTitle: match.title,
                team1Name: team1?.name || "Team 1",
                team2Name: team2?.name || "Team 2",
              }
            }
          } catch (matchError) {
            console.error("Error fetching match details:", matchError)
            // Continue without match details
          }
        }

        // Determine the target topic
        let targetTopic = "all-users"
        if (data.targetAudience === "live-matches") {
          targetTopic = "live-matches"
        } else if (data.targetAudience === "custom" && data.customTopic) {
          targetTopic = data.customTopic
        }

        // Prepare notification payload
        const notificationPayload = {
          notification: {
            title: data.message.title,
            body: data.message.body,
          },
          data: {
            campaignId: result.insertedId.toString(),
            type: "campaign",
            campaignTitle: data.title,
            targetAudience: data.targetAudience,
            ...(data.matchId && { matchId: data.matchId }),
            ...(enhancedData.matchTitle && { matchTitle: enhancedData.matchTitle }),
            ...(enhancedData.team1Name && { team1Name: enhancedData.team1Name }),
            ...(enhancedData.team2Name && { team2Name: enhancedData.team2Name }),
          },
          topic: targetTopic,
        }

        console.log("Sending notification payload:", notificationPayload)

        // Send notification via FCM
        const messageId = await messaging.send(notificationPayload)

        // Update campaign with sent status
        await campaignsCollection.updateOne(
          { _id: result.insertedId },
          {
            $set: {
              status: "sent",
              sentAt: new Date().toISOString(),
              messageId: messageId,
              stats: { sent: 1, delivered: 1, opened: 0 },
            },
          },
        )

        console.log("Successfully sent instant campaign:", messageId)

        return NextResponse.json({
          success: true,
          id: result.insertedId,
          messageId: messageId,
          message: "Campaign created and sent successfully",
        })
      } catch (sendError) {
        console.error("Failed to send instant campaign:", sendError)

        // Update campaign status to failed
        await campaignsCollection.updateOne(
          { _id: result.insertedId },
          {
            $set: {
              status: "failed",
              failedAt: new Date().toISOString(),
              error: sendError instanceof Error ? sendError.message : "Unknown error",
            },
          },
        )

        return NextResponse.json({
          success: false,
          id: result.insertedId,
          error: `Campaign created but failed to send: ${sendError instanceof Error ? sendError.message : "Unknown error"}`,
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      id: result.insertedId,
      message: "Campaign created successfully"
    })
  } catch (error) {
    console.error("Error creating campaign:", error)
    
    let errorMessage = "Failed to create campaign"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}
