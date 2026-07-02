import { NextResponse } from "next/server";
import { refreshAllSources } from "@/lib/predictions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron endpoint to refresh predictions cache.
 * Set up Vercel Cron to hit this every 30 minutes:
 *   vercel.json crons: path "/api/cron/refresh", schedule "0,30 * * * *"
 *
 * Security: requires CRON_SECRET header to prevent abuse.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const result = await refreshAllSources();
  const duration = Date.now() - start;

  return NextResponse.json({
    ok: true,
    refreshed: result,
    durationMs: duration,
    timestamp: new Date().toISOString(),
  });
}
