import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const baseUrl = 'https://api.football-data.org/v4';
const apiKey = '3e64224339134bd58b3751906348b660';
const comps = ["PL", "PD", "WC", "SA", "BL1", "FL1","PPL","CLI","DED","EC","ELC","BSA", "CL"];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("teams");

    // Ensure a unique index on "name"
    await collection.createIndex({ name: 1 }, { unique: true });

    const teamsToInsert: any[] = [];

    for (let i = 0; i < comps.length; i++) {
      const comp = comps[i];
      const res = await fetch(`${baseUrl}/competitions/${comp}/teams`, {
        headers: { 'X-Auth-Token': apiKey },
      });

      if (!res.ok) {
        console.warn(`Skipped ${comp} due to bad response (${res.status})`);
        continue;
      }

      const data = await res.json();
      const now = new Date();

      for (const team of data.teams || []) {
        const exists = await collection.findOne({ name: team.name });
        if (!exists) {
          teamsToInsert.push({
            name: team.name,
            crestUrl: team.crest,
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      if ((i + 1) % 2 === 0 && i !== comps.length - 1) await sleep(6000);
    }

    if (teamsToInsert.length === 0) {
      return NextResponse.json({ message: "No new teams to insert" }, { status: 200 });
    }

    let insertedCount = 0;
    try {
      const result = await collection.insertMany(teamsToInsert, { ordered: false });
      insertedCount = result.insertedCount;
    } catch (insertErr: any) {
      // Skip duplicate errors, log the actual insert count
      if (insertErr.writeErrors) {
        insertedCount = insertErr.result?.nInserted || 0;
        console.warn("Some duplicates were skipped during insert.");
      } else {
        throw insertErr; // rethrow if not duplicate-related
      }
    }

    return NextResponse.json({ insertedCount });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
