import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const top_news = await db.collection("top-news").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(top_news)
  } catch (error) {
    console.error("Error fetching top-news:", error)
    return NextResponse.json({ message: "Failed to fetch top-news" }, { status: 500 })
  }
}