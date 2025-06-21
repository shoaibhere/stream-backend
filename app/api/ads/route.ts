import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const ads = await db.collection("ads").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(ads)
  } catch (error) {
    console.error("Error fetching ads:", error)
    return NextResponse.json({ message: "Failed to fetch ads" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Create ad configuration in database
    const result = await db.collection("ads").insertOne({
      active: adsEnabled,
      adsEnabled,
      useAdMob: adsEnabled ? useAdMob : false,
      useStartApp: adsEnabled ? useStartApp : false,
      adMobAppId: adMobAppId || "",
      adMobInterstitialId: adMobInterstitialId || "",
      startAppAppId: startAppAppId || "",
      adFrequency: adFrequency || 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ message: "Ad configuration created successfully", id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating ad configuration:", error)
    return NextResponse.json({ message: "Failed to create ad configuration" }, { status: 500 })
  }
}
