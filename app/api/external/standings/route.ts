import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const baseUrl = 'https://api.football-data.org/v4';
const apiKey = '3e64224339134bd58b3751906348b660';
const comps = ["PL", "PD", "WC", "SA", "BL1", "FL1", "CL"];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const allStandings: any[] = [];

    for (let i = 0; i < comps.length; i++) {
      const comp = comps[i];
      const res = await fetch(`${baseUrl}/competitions/${comp}/standings`, {
        headers: { 'X-Auth-Token': apiKey },
      });

      if (!res.ok) {
        console.warn(`Skipped ${comp} due to bad response (${res.status})`);
        continue;
      }

      const data = await res.json();
      const standings = (data.standings || []).map((s: any) => ({
        ...s,
        competitionCode: comp,
        fetchedAt: new Date(),
      }));

      allStandings.push(...standings);

      if ((i + 1) % 2 === 0 && i !== comps.length - 1) await sleep(6000);
    }

    if (allStandings.length === 0) {
      return NextResponse.json({ message: "No standings to insert" }, { status: 204 });
    }

    await db.collection("standings").deleteMany({});
    const result = await db.collection("standings").insertMany(allStandings);

    return NextResponse.json({ insertedCount: result.insertedCount });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
