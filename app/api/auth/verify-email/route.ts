import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, emailVerifications } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });

  const [record] = await db
    .select()
    .from(emailVerifications)
    .where(and(
      eq(emailVerifications.token, token),
      isNull(emailVerifications.verifiedAt),
      gt(emailVerifications.expiresAt, new Date()),
    ))
    .limit(1);

  if (!record) {
    return NextResponse.json({ error: 'Invalid or expired verification link.' }, { status: 400 });
  }

  await Promise.all([
    db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, record.userId)),
    db.update(emailVerifications).set({ verifiedAt: new Date() }).where(eq(emailVerifications.id, record.id)),
  ]);

  return NextResponse.json({ ok: true });
}
