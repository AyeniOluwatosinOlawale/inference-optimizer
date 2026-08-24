import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gte, sum, count, avg } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { gatewayRequests } from '@/lib/db/schema';
import { getUser, getUserWithTeam } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const row = await getUserWithTeam(user.id);
  const teamId = row?.teamId;
  if (!teamId) return NextResponse.json({ error: 'No team' }, { status: 401 });

  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10);
  const since = new Date(Date.now() - days * 86400_000);

  const [agg] = await db
    .select({
      totalRequests: count(),
      totalCost: sum(gatewayRequests.costUsd),
      totalBaseline: sum(gatewayRequests.baselineCostUsd),
      totalSavings: sum(gatewayRequests.savingsUsd),
      avgTtft: avg(gatewayRequests.ttftMs),
    })
    .from(gatewayRequests)
    .where(and(eq(gatewayRequests.teamId, teamId), gte(gatewayRequests.createdAt, since)));

  const allReqs = await db
    .select({
      modelUsed: gatewayRequests.modelUsed,
      fromCache: gatewayRequests.fromCache,
      optimizations: gatewayRequests.optimizations,
      savingsUsd: gatewayRequests.savingsUsd,
    })
    .from(gatewayRequests)
    .where(and(eq(gatewayRequests.teamId, teamId), gte(gatewayRequests.createdAt, since)));

  const modelDist: Record<string, number> = {};
  const optBreakdown: Record<string, { count: number; savings: number }> = {};
  let cacheHits = 0;
  for (const r of allReqs) {
    modelDist[r.modelUsed] = (modelDist[r.modelUsed] ?? 0) + 1;
    if (r.fromCache) cacheHits++;
    const opts: string[] = Array.isArray(r.optimizations) ? (r.optimizations as string[]) : [];
    if (opts.length > 0) {
      const savings = Math.max(0, parseFloat(String(r.savingsUsd ?? '0')));
      const share = savings / opts.length;
      for (const opt of opts) {
        if (!optBreakdown[opt]) optBreakdown[opt] = { count: 0, savings: 0 };
        optBreakdown[opt].count++;
        optBreakdown[opt].savings += share;
      }
    }
  }

  const totalReqs = Number(agg.totalRequests ?? 0);
  const totalCost = parseFloat(String(agg.totalCost ?? '0'));
  const totalBaseline = parseFloat(String(agg.totalBaseline ?? '0'));
  const totalSavings = Math.max(0, parseFloat(String(agg.totalSavings ?? '0')));

  return NextResponse.json({
    total_requests: totalReqs,
    total_cost_usd: totalCost,
    total_baseline_usd: totalBaseline,
    total_savings_usd: totalSavings,
    savings_pct: totalBaseline > 0 ? (totalSavings / totalBaseline) * 100 : 0,
    cache_hit_rate: totalReqs > 0 ? (cacheHits / totalReqs) * 100 : 0,
    avg_ttft_ms: Math.round(parseFloat(String(agg.avgTtft ?? '0'))),
    model_distribution: modelDist,
    optimization_breakdown: optBreakdown,
  });
}
