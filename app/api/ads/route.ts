import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const screen = searchParams.get('screen')
    
    const client = await clientPromise
    const db = client.db()

    let query = {}
    if (screen) {
      query = { screenType: screen }
    }

    const ads = await db.collection("ads").find(query).sort({ createdAt: -1 }).toArray()

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
      screenType, 
      screenName,
      adType,
      adsEnabled, 
      useAdMob, 
      useStartApp, 
      adMobAppId, 
      adMobBannerId,
      adMobInterstitialId, 
      adMobRewardedId,
      startAppAppId, 
      adFrequency,
      position 
    } = data

    // Validate required fields
    if (!screenType || !screenName) {
      return NextResponse.json({ message: "Screen type and name are required" }, { status: 400 })
    }

    if (typeof adsEnabled !== "boolean") {
      return NextResponse.json({ message: "adsEnabled must be a boolean" }, { status: 400 })
    }

    // Check if configuration already exists for this screen
    const client = await clientPromise
    const db = client.db()
    
    const existingConfig = await db.collection("ads").findOne({ screenType })
    if (existingConfig) {
      return NextResponse.json({ 
        message: `Ad configuration already exists for ${screenName}. Use PUT to update.` 
      }, { status: 400 })
    }

    if (adsEnabled) {
      if (!useAdMob && !useStartApp) {
        return NextResponse.json(
          { message: "Either AdMob or StartApp must be enabled when ads are enabled" },
          { status: 400 },
        )
      }

      if (useAdMob && useStartApp) {
        return NextResponse.json({ message: "Only one ad provider can be enabled at a time" }, { status: 400 })
      }

      if (useAdMob && !adMobAppId) {
        return NextResponse.json(
          { message: "AdMob App ID is required when AdMob is enabled" },
          { status: 400 },
        )
      }

      if (useStartApp && !startAppAppId) {
        return NextResponse.json({ message: "StartApp App ID is required when StartApp is enabled" }, { status: 400 })
      }

      if (!adFrequency || adFrequency < 1) {
        return NextResponse.json({ message: "Ad frequency must be at least 1" }, { status: 400 })
      }
    }

    // Create ad configuration in database
    const result = await db.collection("ads").insertOne({
      screenType,
      screenName,
      adType: adType || 'banner',
      position: position || 'bottom',
      active: adsEnabled,
      adsEnabled,
      useAdMob: adsEnabled ? useAdMob : false,
      useStartApp: adsEnabled ? useStartApp : false,
      adMobAppId: adMobAppId || "",
      adMobBannerId: adMobBannerId || "",
      adMobInterstitialId: adMobInterstitialId || "",
      adMobRewardedId: adMobRewardedId || "",
      startAppAppId: startAppAppId || "",
      adFrequency: adFrequency || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      { message: "Ad configuration created successfully", id: result.insertedId },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating ad configuration:", error)
    return NextResponse.json({ message: "Failed to create ad configuration" }, { status: 500 })
  }
}
