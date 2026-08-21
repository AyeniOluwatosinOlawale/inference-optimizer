import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { providerKeys } from '@/lib/db/schema';
import { getUser, getUserWithTeam } from '@/lib/db/queries';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const row = await getUserWithTeam(user.id);
  const teamId = row?.teamId;
  if (!teamId) return NextResponse.json({ error: 'No team' }, { status: 401 });

  const { id } = await params;
  const keyId = parseInt(id, 10);
  if (isNaN(keyId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const result = await db
    .delete(providerKeys)
    .where(and(eq(providerKeys.id, keyId), eq(providerKeys.teamId, teamId)))
    .returning({ id: providerKeys.id });

  if (result.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
