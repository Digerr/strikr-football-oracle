import { NextResponse } from "next/server";
import { getExpresses } from "@/lib/predictions";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  const expresses = await getExpresses();

  return NextResponse.json({
    ok: true,
    count: expresses.length,
    expresses,
    timestamp: new Date().toISOString(),
  });
}
