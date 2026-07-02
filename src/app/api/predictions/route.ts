import { NextResponse } from "next/server";
import { getTopPredictions } from "@/lib/football-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "5", 10);

  const matches = getTopPredictions(limit);
  return NextResponse.json({
    ok: true,
    count: matches.length,
    predictions: matches,
    timestamp: new Date().toISOString(),
  });
}
