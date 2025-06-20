import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const searchQuery = req.nextUrl.searchParams.get("q");

  try {
    const client = await clientPromise;
    const db = client.db();

    const filter = searchQuery
      ? {
          $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    const news = await db
      .collection("news")
      .find(filter)
      .sort({ publishedAt: -1 }) // adjust this field if needed
      .toArray();

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { message: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
