import { NextResponse } from "next/server";

const base = `https://kickstronaut.up.railway.app/api/external`;
const endpoints = ["competitions", "matches", "standings", "scorers"];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET() {
  try {
    const summary: any[] = [];

    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];

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

      // Wait 6 seconds every 2 calls, except after last one
      if ((i + 1) % 2 === 0 && i !== endpoints.length - 1) {
        await sleep(6000);
      }
    }

    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
