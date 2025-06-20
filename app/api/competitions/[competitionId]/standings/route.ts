import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { competitionId: string } }
) {
  const { competitionId } = params;
  const status = req.nextUrl.searchParams.get("status"); // optional

  try {
    const client = await clientPromise;
    const db = client.db();

    const query: any = {
      "competitionCode": competitionId,
    };

    if (status) {
      query.status = status;
    }

    const standings = await db
      .collection("standings")
      .find(query)
      .sort({ utcDate: -1 })
      .toArray();

    return NextResponse.json({ standings });
  } catch (error: any) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { message: "Failed to fetch matches from database." },
      { status: 500 }
    );
  }
}
