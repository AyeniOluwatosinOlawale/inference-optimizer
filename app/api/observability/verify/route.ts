import { NextRequest, NextResponse } from 'next/server';

const PASSWORD = process.env.OBSERVABILITY_PASSWORD;

export async function POST(req: NextRequest) {
  if (!PASSWORD) {
    return NextResponse.json({ error: 'Observability access is not configured' }, { status: 503 });
  }

  const { password } = await req.json();

  if (!password || password !== PASSWORD) {
    await new Promise(r => setTimeout(r, 500)); // slow brute-force
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: 'obs_access_v2',
    value: '1',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });
  return res;
}
