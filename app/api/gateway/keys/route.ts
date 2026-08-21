import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { gatewayApiKeys } from '@/lib/db/schema';
import { getUser, getUserWithTeam } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const row = await getUserWithTeam(user.id);
  if (!row?.teamId) return NextResponse.json({ error: 'No team' }, { status: 401 });

  const keys = await db
    .select()
    .from(gatewayApiKeys)
    .where(and(eq(gatewayApiKeys.teamId, row.teamId), isNull(gatewayApiKeys.revokedAt)));

  return NextResponse.json(keys.map(k => ({
    id: k.id,
    keyPrefix: k.keyPrefix,
    name: k.name,
    createdAt: k.createdAt,
  })));
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const row = await getUserWithTeam(user.id);
  if (!row?.teamId) return NextResponse.json({ error: 'No team' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name: string | null = body.name?.trim() || null;

  const raw = 'iok_' + randomBytes(24).toString('hex');
  const keyHash = createHash('sha256').update(raw).digest('hex');
  const keyPrefix = raw.slice(0, 8);

  await db.insert(gatewayApiKeys).values({
    teamId: row.teamId,
    keyHash,
    keyPrefix,
    name,
  });

  return NextResponse.json({ key: raw, keyPrefix, name });
}
