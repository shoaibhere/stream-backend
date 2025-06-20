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
    const selectedCompetitions: any[] = [];

    for (let i = 0; i < comps.length; i++) {
      const code = comps[i];

      const res = await fetch(`${baseUrl}/competitions/${code}`, {
        headers: { 'X-Auth-Token': apiKey },
      });

      if (!res.ok) {
        console.warn(`Skipped ${code} due to bad response (${res.status})`);
        continue;
      }

      const data = await res.json();
      selectedCompetitions.push({
        ...data,
        code,
        fetchedAt: new Date(),
      });

      if ((i + 1) % 2 === 0 && i !== comps.length - 1) await sleep(6000);
    }

    if (selectedCompetitions.length === 0) {
      return NextResponse.json({ message: "No competitions to insert" }, { status: 204 });
    }

    await db.collection("competitions").deleteMany({});
    const result = await db.collection("competitions").insertMany(selectedCompetitions);

    return NextResponse.json({ insertedCount: result.insertedCount });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
