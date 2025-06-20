import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const base = `https://kickstronaut.up.railway.app/api/external`;

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const endpoints = ["competitions", "matches", "standings", "scorers"];
    const summary: any[] = [];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(`${base}/${endpoint}`);
        if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);

        const data = await res.json();

        // Store in corresponding collection (same name as endpoint)
        await db.collection(endpoint).deleteMany({});
        const result = await db.collection(endpoint).insertMany(data);

        summary.push({
          endpoint,
          status: "fulfilled",
          insertedCount: result.insertedCount,
        });
      } catch (err: any) {
        summary.push({
          endpoint,
          status: "rejected",
          error: err?.message || "Unknown error",
        });

        // OPTIONAL: Stop loop if any fetch fails
        // break;
      }
    }

    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
