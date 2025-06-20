import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { teamId: string } }
) {
  const { teamId } = params;
  const status = req.nextUrl.searchParams.get("status");

  try {
    const client = await clientPromise;
    const db = client.db();

    const parsedTeamId = parseInt(teamId);

    // Match either homeTeam.id or awayTeam.id
    const query: any = {
      $or: [
        { "homeTeam.id": parsedTeamId },
        { "awayTeam.id": parsedTeamId },
      ],
    };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    const matches = await db
      .collection("api-matches")
      .find(query)
      .sort({ utcDate: -1 })
      .toArray();

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error("Error fetching team matches:", error);
    return NextResponse.json(
      { message: "Failed to fetch matches for team." },
      { status: 500 }
    );
  }
}
