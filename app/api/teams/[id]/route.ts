import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { MongoServerError } from "mongodb"
import cloudinary from "@/lib/cloudinary"
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    const team = await db.collection("teams").findOne({ _id: new ObjectId(id) })

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 })
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ message: "Failed to fetch team" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Validate ID format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid team ID format" },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const name = formData.get("name")?.toString().trim() || ""
    const crestFile = formData.get("crest") as File | null

    // Validate name exists
    if (!name) {
      return NextResponse.json(
        { message: "Team name is required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    const objectId = new ObjectId(id)

    // Check if team exists
    const teamToUpdate = await db.collection("teams").findOne({ _id: objectId })
    if (!teamToUpdate) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      )
    }

    // Case-insensitive name check (excluding current team)
    const duplicateTeam = await db.collection("teams").findOne({
      name: { $regex: new RegExp(`^${escapeRegExp(name)}$`, "i") },
      _id: { $ne: objectId }
    })

    if (duplicateTeam) {
      return NextResponse.json(
        { message: "A team with this name already exists" },
        { status: 409 } // 409 Conflict is more appropriate
      )
    }

    const updateData: { name: string; crestUrl?: string; updatedAt: Date } = {
      name,
      updatedAt: new Date(),
    }

    // Handle crest upload if new file provided
    if (crestFile && crestFile.size > 0) {
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

      updateData.crestUrl = (uploadResult as any).secure_url
    }

    // Perform update
    await db.collection("teams").updateOne(
      { _id: objectId },
      { $set: updateData }
    )

    return NextResponse.json(
      { message: "Team updated successfully" },
      { status: 200 }
    )
    
  } catch (error: any) {
    console.error("Team update error:", error)
    
    // Handle MongoDB duplicate key error
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json(
        { message: "Team name already exists" },
        { status: 409 }
      )
    }
    
    // Handle Cloudinary errors
    if (error.message.includes("Cloudinary")) {
      return NextResponse.json(
        { message: "Error uploading team crest" },
        { status: 500 }
      )
    }
    
    // Generic error
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if team exists
    const team = await db.collection("teams").findOne({ _id: new ObjectId(id) })
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 })
    }

    // Check if team is used in any matches
    const matchesUsingTeam = await db.collection("matches").findOne({
      $or: [{ team1Id: id }, { team2Id: id }],
    })

    if (matchesUsingTeam) {
      return NextResponse.json({ message: "Cannot delete team as it is used in one or more matches" }, { status: 400 })
    }

    // Delete team from database
    await db.collection("teams").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Team deleted successfully" })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json({ message: "Failed to delete team" }, { status: 500 })
  }
}
