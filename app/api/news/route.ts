import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const news = await db.collection("news").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(news)
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ message: "Failed to fetch news" }, { status: 500 })
  }
}