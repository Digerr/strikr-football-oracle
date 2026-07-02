import { NextResponse } from "next/server";
import { getMatches } from "@/lib/predictions";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");

  let matches = await getMatches();

  if (sport && sport !== "all") {
    matches = matches.filter((m) => m.sport === sport);
  }

  return NextResponse.json({
    ok: true,
    count: matches.length,
    matches,
    timestamp: new Date().toISOString(),
  });
}
