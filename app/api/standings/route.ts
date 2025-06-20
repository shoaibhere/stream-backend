import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const standings = await db.collection("standings").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(standings)
  } catch (error) {
    console.error("Error fetching standings:", error)
    return NextResponse.json({ message: "Failed to fetch standings" }, { status: 500 })
  }
}