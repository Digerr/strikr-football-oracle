import { NextResponse } from "next/server";
import { getSports } from "@/lib/predictions";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  const sports = await getSports();

  return NextResponse.json({
    ok: true,
    count: sports.length,
    sports,
    timestamp: new Date().toISOString(),
  });
}
