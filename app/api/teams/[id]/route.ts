import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import cloudinary from "@/lib/cloudinary"

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

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid team ID" }, { status: 400 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const crestFile = formData.get("crest") as File | null

    if (!name) {
      return NextResponse.json({ message: "Team name is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // Check if team exists
    const existingTeam = await db.collection("teams").findOne({ _id: new ObjectId(id) })
    if (!existingTeam) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 })
    }

    // Check if another team with the same name exists
    const duplicateTeam = await db.collection("teams").findOne({
      name,
      _id: { $ne: new ObjectId(id) },
    })

    if (duplicateTeam) {
      return NextResponse.json({ message: "Another team with this name already exists" }, { status: 400 })
    }

    const updateData: any = {
      name,
      updatedAt: new Date(),
    }

    // Upload new crest to Cloudinary if provided
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

      updateData.crestUrl = (uploadResult as any).secure_url
    }

    // Update team in database
    await db.collection("teams").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return NextResponse.json({ message: "Team updated successfully" })
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json({ message: "Failed to update team" }, { status: 500 })
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
