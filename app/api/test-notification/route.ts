import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Test environment variables
    const hasMongoUri = !!process.env.MONGODB_URI
    const hasFirebaseProjectId = !!process.env.FIREBASE_PROJECT_ID
    const hasFirebaseClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL
    const hasFirebasePrivateKey = !!process.env.FIREBASE_PRIVATE_KEY

    return NextResponse.json({
      success: true,
      environment: {
        mongodb: hasMongoUri,
        firebaseProjectId: hasFirebaseProjectId,
        firebaseClientEmail: hasFirebaseClientEmail,
        firebasePrivateKey: hasFirebasePrivateKey,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({ error: "Test failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    return NextResponse.json({
      success: true,
      message: "Test POST endpoint working",
      receivedData: body,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Test POST error:", error)
    return NextResponse.json({ error: "Test POST failed" }, { status: 500 })
  }
}
