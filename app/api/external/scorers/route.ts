import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const baseUrl = 'https://api.football-data.org/v4';
const apiKey = '3e64224339134bd58b3751906348b660';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const comps = ["PL","PD","WC","SA","BL1","FL1","CL"]
    const allScorers = [];

    for (const comp of comps) {
      const res = await fetch(`${baseUrl}/competitions/${comp}/scorers`, {
        headers: { 'X-Auth-Token': apiKey },
      });

      if (!res.ok) continue;

      const data = await res.json();
      const scorers = data.scorers?.map((s: any) => ({
        ...s,
        competitionCode: comp,
        fetchedAt: new Date(),
      })) || [];

      allScorers.push(...scorers);
    }

    await db.collection("scorers").deleteMany({});
    const result = await db.collection("scorers").insertMany(allScorers);

    return NextResponse.json({ insertedCount: result.insertedCount });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
