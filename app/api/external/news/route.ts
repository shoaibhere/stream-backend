import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb" // Adjust path as needed

export async function GET(req: NextRequest) {
  try {
    const response = await fetch("https://newsapi.org/v2/everything?q=football&apiKey=ac556c2b63e24c61bfa664d1f010da7b")

    const response2 = await fetch("https://newsapi.org/v2/top-headlines?q=football&apiKey=ac556c2b63e24c61bfa664d1f010da7b")
    
    if (!response.ok || !response2.ok) {
      return NextResponse.json({ message: "Failed to fetch news from NewsAPI" }, { status: 500 })
    }

    const newsData = await response.json()
    const newsData2 = await response2.json()
    const articles = newsData.articles || []
    const top_articles = newsData2.articles || []

    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ message: "No articles found" }, { status: 404 })
    }
    if (!Array.isArray(top_articles) || top_articles.length === 0) {
      return NextResponse.json({ message: "No articles found" }, { status: 404 })
    }

    const client = await clientPromise
    const db = client.db()

    await db.collection("news").deleteMany({})
    await db.collection("top-news").deleteMany({})

    // Insert news articles
    const result = await db.collection("news").insertMany(
      articles.map(article => ({
        ...article,
        fetchedAt: new Date()
      }))
    )

    const result2 = await db.collection("top-news").insertMany(
      top_articles.map(top_article => ({
        ...top_article,
        fetchedAt: new Date()
      }))
    )

    return NextResponse.json({ message: "News fetched and saved", insertedCount: result.insertedCount }, { status: 201 })
  } catch (error) {
    console.error("Error fetching or saving news:", error)
    return NextResponse.json({ message: "Error occurred while processing news" }, { status: 500 })
  }
}
