import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { gatewayRequests } from '@/lib/db/schema';
import { getUser, getUserWithTeam } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const row = await getUserWithTeam(user.id);
  const teamId = row?.teamId;
  if (!teamId) return NextResponse.json({ error: 'No team' }, { status: 401 });

  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50', 10);
  const offset = parseInt(req.nextUrl.searchParams.get('offset') ?? '0', 10);

  const rows = await db
    .select()
    .from(gatewayRequests)
    .where(eq(gatewayRequests.teamId, teamId))
    .orderBy(desc(gatewayRequests.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({ data: rows, total: rows.length });
}
