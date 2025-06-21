import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid ad configuration ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    const ad = await db.collection("ads").findOne({ _id: new ObjectId(id) })

    if (!ad) {
      return NextResponse.json({ message: "Ad configuration not found" }, { status: 404 })
    }

    return NextResponse.json(ad)
  } catch (error) {
    console.error("Error fetching ad configuration:", error)
    return NextResponse.json({ message: "Failed to fetch ad configuration" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid ad configuration ID" }, { status: 400 })
    }

    const data = await request.json()
    const { 
      adsEnabled, 
      useAdMob, 
      useStartApp, 
      adMobAppId, 
      adMobInterstitialId, 
      startAppAppId, 
      adFrequency 
    } = data

    if (typeof adsEnabled !== "boolean") {
      return NextResponse.json({ message: "adsEnabled must be a boolean" }, { status: 400 })
    }

    if (adsEnabled) {
      if (!useAdMob && !useStartApp) {
        return NextResponse.json({ message: "Either AdMob or StartApp must be enabled when ads are enabled" }, { status: 400 })
      }

      if (useAdMob && useStartApp) {
        return NextResponse.json({ message: "Only one ad provider can be enabled at a time" }, { status: 400 })
      }

      if (useAdMob && (!adMobAppId || !adMobInterstitialId)) {
        return NextResponse.json({ message: "AdMob App ID and Interstitial ID are required when AdMob is enabled" }, { status: 400 })
      }

      if (useStartApp && !startAppAppId) {
        return NextResponse.json({ message: "StartApp App ID is required when StartApp is enabled" }, { status: 400 })
      }

      if (!adFrequency || adFrequency < 1) {
        return NextResponse.json({ message: "Ad frequency must be at least 1" }, { status: 400 })
      }
    }

    const client = await clientPromise
    const db = client.db()

    // Check if ad configuration exists
    const existingAd = await db.collection("ads").findOne({ _id: new ObjectId(id) })
    if (!existingAd) {
      return NextResponse.json({ message: "Ad configuration not found" }, { status: 404 })
    }

    // Update ad configuration in database
    await db.collection("ads").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          active: adsEnabled,
          adsEnabled,
          useAdMob: adsEnabled ? useAdMob : false,
          useStartApp: adsEnabled ? useStartApp : false,
          adMobAppId: adMobAppId || "",
          adMobInterstitialId: adMobInterstitialId || "",
          startAppAppId: startAppAppId || "",
          adFrequency: adFrequency || 3,
          updatedAt: new Date(),
        },
      }
    )

    return NextResponse.json({ message: "Ad configuration updated successfully" })
  } catch (error) {
    console.error("Error updating ad configuration:", error)
    return NextResponse.json({ message: "Failed to update ad configuration" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid ad configuration ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if ad configuration exists
    const ad = await db.collection("ads").findOne({ _id: new ObjectId(id) })
    if (!ad) {
      return NextResponse.json({ message: "Ad configuration not found" }, { status: 404 })
    }

    // Delete ad configuration from database
    await db.collection("ads").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Ad configuration deleted successfully" })
  } catch (error) {
    console.error("Error deleting ad configuration:", error)
    return NextResponse.json({ message: "Failed to delete ad configuration" }, { status: 500 })
  }
}
