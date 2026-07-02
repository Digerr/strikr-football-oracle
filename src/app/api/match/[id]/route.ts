import { NextResponse } from "next/server";
import { getMatchById } from "@/lib/football-data";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    return NextResponse.json(
      { ok: false, error: "Match not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    match,
    timestamp: new Date().toISOString(),
  });
}
