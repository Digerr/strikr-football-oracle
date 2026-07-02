import { NextResponse } from "next/server";
import { getTopCappers } from "@/lib/predictions";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "30", 10);

  const cappers = await getTopCappers(limit);

  return NextResponse.json({
    ok: true,
    count: cappers.length,
    cappers,
    timestamp: new Date().toISOString(),
  });
}
