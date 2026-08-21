import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { gatewayApiKeys } from '@/lib/db/schema';
import { getUser, getUserWithTeam } from '@/lib/db/queries';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const row = await getUserWithTeam(user.id);
  if (!row?.teamId) return NextResponse.json({ error: 'No team' }, { status: 401 });

  const { id } = await params;
  await db
    .update(gatewayApiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(gatewayApiKeys.id, parseInt(id)), eq(gatewayApiKeys.teamId, row.teamId)));

  return NextResponse.json({ ok: true });
}
