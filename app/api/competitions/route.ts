import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const competitions = await db.collection("competitions").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(competitions)
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return NextResponse.json({ message: "Failed to fetch competitions" }, { status: 500 })
  }
}