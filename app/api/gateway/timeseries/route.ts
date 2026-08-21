import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gte, or, isNull } from 'drizzle-orm';
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

  const rows = await db
    .select({
      createdAt: gatewayRequests.createdAt,
      costUsd: gatewayRequests.costUsd,
      baselineCostUsd: gatewayRequests.baselineCostUsd,
      savingsUsd: gatewayRequests.savingsUsd,
    })
    .from(gatewayRequests)
    .where(and(or(eq(gatewayRequests.teamId, teamId), isNull(gatewayRequests.teamId)), gte(gatewayRequests.createdAt, since)));

  // Group by UK date (Europe/London — BST/GMT)
  const byDate: Record<string, { cost: number; baseline: number; savings: number; requests: number }> = {};
  const ukDateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' });
  for (const r of rows) {
    const parts = ukDateFmt.formatToParts(r.createdAt);
    const y = parts.find(p => p.type === 'year')!.value;
    const m = parts.find(p => p.type === 'month')!.value;
    const d = parts.find(p => p.type === 'day')!.value;
    const date = `${y}-${m}-${d}`;
    if (!byDate[date]) byDate[date] = { cost: 0, baseline: 0, savings: 0, requests: 0 };
    byDate[date].cost += parseFloat(String(r.costUsd));
    byDate[date].baseline += parseFloat(String(r.baselineCostUsd));
    byDate[date].savings += parseFloat(String(r.savingsUsd));
    byDate[date].requests++;
  }

  const data = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({ date, ...d }));

  return NextResponse.json({ data });
}
