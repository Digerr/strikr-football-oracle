import { NextResponse } from "next/server";
import { getCapperById } from "@/lib/predictions";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await getCapperById(id);

  if (!result) {
    return NextResponse.json(
      { ok: false, error: "Capper not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    capper: result.capper,
    predictions: result.predictions,
    timestamp: new Date().toISOString(),
  });
}
