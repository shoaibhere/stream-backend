import { NextResponse } from "next/server";

export async function GET() {
  try {
    const base = `https://kickstronaut.up.railway.app/api/external`;

    const endpoints = ["competitions", "matches", "standings", "scorers"];
    const summary: any[] = [];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(`${base}/${endpoint}`);
        const json = await res.json();

        summary.push({
          endpoint,
          status: "fulfilled",
          result: json,
        });
      } catch (err: any) {
        summary.push({
          endpoint,
          status: "rejected",
          result: err?.message || "Failed",
        });
      }
    }

    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
