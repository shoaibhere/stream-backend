import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { ScreenAdConfig } from "@/types/ads"; // Import the shared type

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
    const id = params.id;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid ad configuration ID" }, { status: 400 });
    }

    const data: Partial<ScreenAdConfig> = await request.json();
    
    // Remove protected fields
    delete data._id;
    delete data.createdAt;
    
    // Set updatedAt
    data.updatedAt = new Date().toISOString();

    // Validate required fields
    if (!data.screenType || !data.screenName || !data.adType) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Enhanced validation
    if (data.adsEnabled) {
      if (!data.useAdMob && !data.useStartApp) {
        return NextResponse.json(
          { message: "Select at least one ad provider" },
          { status: 400 }
        );
      }

      if (data.useAdMob) {
        if (!data.adMobAppId) {
          return NextResponse.json(
            { message: "AdMob App ID is required" },
            { status: 400 }
          );
        }
        // Ad-type specific validation
        if (data.adType === "banner" && !data.adMobBannerId) {
          return NextResponse.json(
            { message: "Banner ID required for banner ads" },
            { status: 400 }
          );
        }
        if (data.adType === "interstitial" && !data.adMobInterstitialId) {
          return NextResponse.json(
            { message: "Interstitial ID required for interstitial ads" },
            { status: 400 }
          );
        }
        if (data.adType === "rewarded" && !data.adMobRewardedId) {
          return NextResponse.json(
            { message: "Rewarded ID required for rewarded ads" },
            { status: 400 }
          );
        }
      }

      if (data.useStartApp && !data.startAppAppId) {
        return NextResponse.json(
          { message: "StartApp App ID is required" },
          { status: 400 }
        );
      }

      if ((data.adType === "interstitial" || data.adType === "rewarded") && 
          (!data.adFrequency || data.adFrequency < 1)) {
        return NextResponse.json(
          { message: "Valid ad frequency required" },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db();

    // Update all fields
    await db.collection("ads").updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );

    return NextResponse.json({ message: "Configuration updated successfully" });
  } catch (error) {
    console.error("Error updating configuration:", error);
    return NextResponse.json(
      { message: "Failed to update configuration" },
      { status: 500 }
    );
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
