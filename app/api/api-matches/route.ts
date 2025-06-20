import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const api_matches = await db.collection("api-matches").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(api_matches)
  } catch (error) {
    console.error("Error fetching api-matches:", error)
    return NextResponse.json({ message: "Failed to fetch api-matches" }, { status: 500 })
  }
}