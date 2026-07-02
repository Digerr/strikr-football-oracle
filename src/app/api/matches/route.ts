import { NextResponse } from "next/server";
import {
  getAllMatches,
  getLiveMatches,
  getUpcomingMatches,
  getHotMatches,
  getFinishedMatches,
} from "@/lib/football-data";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";

  let matches;
  switch (filter) {
    case "live":
      matches = await getLiveMatches();
      break;
    case "upcoming":
      matches = await getUpcomingMatches();
      break;
    case "hot":
      matches = await getHotMatches();
      break;
    case "finished":
      matches = await getFinishedMatches();
      break;
    default:
      matches = await getAllMatches();
  }

  return NextResponse.json({
    ok: true,
    count: matches.length,
    matches,
    source: process.env.FOOTBALL_DATA_API_KEY ? "live" : "mock",
    timestamp: new Date().toISOString(),
  });
}
