import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const baseUrl = 'https://api.football-data.org/v4';
const apiKey = '3e64224339134bd58b3751906348b660';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const competitions = await db.collection("competitions").find().toArray();
    const allStandings = [];

    for (const comp of competitions) {
      const res = await fetch(`${baseUrl}/competitions/${comp.code}/standings`, {
        headers: { 'X-Auth-Token': apiKey },
      });

      if (!res.ok) continue;

      const data = await res.json();
      const standings = data.standings?.map((s: any) => ({
        ...s,
        competitionCode: comp.code,
        fetchedAt: new Date(),
      })) || [];

      allStandings.push(...standings);
    }

    await db.collection("standings").deleteMany({});
    const result = await db.collection("standings").insertMany(allStandings);

    return NextResponse.json({ insertedCount: result.insertedCount });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
