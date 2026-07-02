import { NextResponse } from "next/server";
import {
  getAllMatches,
  getLiveMatches,
  getUpcomingMatches,
  getHotMatches,
} from "@/lib/football-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";

  let matches;
  switch (filter) {
    case "live":
      matches = getLiveMatches();
      break;
    case "upcoming":
      matches = getUpcomingMatches();
      break;
    case "hot":
      matches = getHotMatches();
      break;
    default:
      matches = getAllMatches();
  }

  return NextResponse.json({
    ok: true,
    count: matches.length,
    matches,
    timestamp: new Date().toISOString(),
  });
}
