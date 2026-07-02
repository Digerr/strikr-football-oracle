import { NextResponse } from "next/server";
import { getTopPredictions } from "@/lib/football-data";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  const matches = await getTopPredictions(limit);
  return NextResponse.json({
    ok: true,
    count: matches.length,
    predictions: matches,
    source: process.env.FOOTBALL_DATA_API_KEY ? "live" : "mock",
    timestamp: new Date().toISOString(),
  });
}
