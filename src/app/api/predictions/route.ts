import { NextResponse } from "next/server";
import { getAllPredictions } from "@/lib/predictions";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 min

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  let predictions = await getAllPredictions();

  if (sport && sport !== "all") {
    predictions = predictions.filter((p) => p.sport === sport);
  }
  if (status && status !== "all") {
    predictions = predictions.filter((p) => p.status === status);
  }

  predictions = predictions
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);

  return NextResponse.json({
    ok: true,
    count: predictions.length,
    predictions,
    timestamp: new Date().toISOString(),
  });
}
