import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { gatewayApiKeys } from '@/lib/db/schema';
import { getUser, getUserWithTeam } from '@/lib/db/queries';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const row = await getUserWithTeam(user.id);
  if (!row?.teamId) return NextResponse.json({ error: 'No team' }, { status: 401 });

  const { id } = await params;
  const keyId = Number(id);
  if (!Number.isInteger(keyId) || keyId <= 0 || keyId > Number.MAX_SAFE_INTEGER) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const limit = body.daily_spend_limit_usd;
  const limitValue = limit === null || limit === undefined || limit === '' ? null : String(parseFloat(limit));

  await db
    .update(gatewayApiKeys)
    .set({ dailySpendLimitUsd: limitValue })
    .where(and(eq(gatewayApiKeys.id, keyId), eq(gatewayApiKeys.teamId, row.teamId)));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const row = await getUserWithTeam(user.id);
  if (!row?.teamId) return NextResponse.json({ error: 'No team' }, { status: 401 });

  const { id } = await params;
  const keyId = Number(id);
  if (!Number.isInteger(keyId) || keyId <= 0 || keyId > Number.MAX_SAFE_INTEGER) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await db
    .update(gatewayApiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(gatewayApiKeys.id, keyId), eq(gatewayApiKeys.teamId, row.teamId)));

  return NextResponse.json({ ok: true });
}
