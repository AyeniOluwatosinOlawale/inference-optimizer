import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json().catch(() => ({}));
  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const [record] = await db
    .select()
    .from(passwordResetTokens)
    .where(and(
      eq(passwordResetTokens.token, token),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, new Date()),
    ))
    .limit(1);

  if (!record) {
    return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await Promise.all([
    db.update(users).set({ passwordHash }).where(eq(users.id, record.userId)),
    db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id)),
  ]);

  return NextResponse.json({ ok: true });
}
