import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const baseUrl = 'https://api.football-data.org/v4';
const apiKey = '3e64224339134bd58b3751906348b660';

export async function GET() {
  try {
    const res = await fetch(`${baseUrl}/competitions`, {
      headers: { 'X-Auth-Token': apiKey },
    });

    if (!res.ok) throw new Error("Failed to fetch competitions");

    const { competitions } = await res.json();

    const client = await clientPromise;
    const db = client.db();
    await db.collection("competitions").deleteMany({});
    const result = await db.collection("competitions").insertMany(competitions);

    return NextResponse.json({ insertedCount: result.insertedCount });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
