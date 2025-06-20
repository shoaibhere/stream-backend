import { NextResponse } from "next/server";

export async function GET() {
  try {
    const base = `https://kickstronaut.up.railway.app/api/external`;

    const endpoints = [
      "competitions",
      "matches",
      "standings",
      "scorers",
    ];

    const results = await Promise.allSettled(
      endpoints.map((e) =>
        fetch(`${base}/${e}`).then((res) => res.json())
      )
    );

    const summary = results.map((r, i) => ({
      endpoint: endpoints[i],
      status: r.status,
      result: r.status === "fulfilled" ? r.value : (r.reason?.message || "Failed"),
    }));

    return NextResponse.json({ success: true, summary });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
