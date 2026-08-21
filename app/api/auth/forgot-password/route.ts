import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Always return 200 — never reveal whether the email exists
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (user) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });
    sendPasswordResetEmail(email, token).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
