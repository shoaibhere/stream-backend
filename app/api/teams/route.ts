import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { MongoServerError } from "mongodb"
import cloudinary from "@/lib/cloudinary"
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const teams = await db.collection("teams").find({}).sort({ name: 1 }).toArray()

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ message: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const crestFile = formData.get("crest") as File | null

    if (!name) {
      return NextResponse.json({ message: "Team name is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if team with same name already exists
    const existingTeam = await db.collection("teams").findOne({
      name: { 
        $regex: new RegExp(`^${escapeRegExp(name)}$`, "i") 
      }
    })

    if (existingTeam) {
      return NextResponse.json(
        { message: "A team with this name already exists" },
        { status: 400 }
      )
    }


    let crestUrl = null

    // Upload crest to Cloudinary if provided
    if (crestFile) {
      const arrayBuffer = await crestFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "football-crests",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            },
          )
          .end(buffer)
      })

      crestUrl = (uploadResult as any).secure_url
    }

    // Create team in database
    const result = await db.collection("teams").insertOne({
      name,
      crestUrl,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Team created successfully", id: result.insertedId }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating team:", error)
    
    // Handle MongoDB duplicate key error
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json(
        { message: "A team with this name already exists" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: "Failed to create team" },
      { status: 500 }
    )
  }
}

