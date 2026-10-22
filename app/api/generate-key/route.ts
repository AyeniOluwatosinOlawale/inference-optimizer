import { NextRequest, NextResponse } from 'next/server';

const LITELLM_URL = 'https://api.136.65.123.94.nip.io';
const MASTER_KEY  = process.env.LITELLM_MASTER_KEY;

// Simple in-memory rate limiter: max 3 keys per IP per hour
const _rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = _rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    _rateLimitMap.set(ip, { count: 1, resetAt: now + 3_600_000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  if (!MASTER_KEY) {
    console.error('LITELLM_MASTER_KEY env var is not set');
    return NextResponse.json({ error: 'Service misconfigured' }, { status: 503 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded — max 3 keys per hour' }, { status: 429 });
  }

  try {
    const { user, budget = 5, rpm = 30 } = await req.json();
    if (!user || typeof user !== 'string' || user.trim().length === 0) {
      return NextResponse.json({ error: 'user is required' }, { status: 400 });
    }
    // Sanitise: only alphanumeric, dots, hyphens, underscores, @
    if (!/^[\w.\-@+]+$/.test(user.trim())) {
      return NextResponse.json({ error: 'Invalid user format' }, { status: 400 });
    }
    // Cap budget and rpm to prevent abuse
    const safeBudget = Math.min(Number(budget) || 5, 20);
    const safeRpm    = Math.min(Number(rpm) || 30, 100);

    const res = await fetch(`${LITELLM_URL}/key/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MASTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.trim(),
        max_budget: safeBudget,
        budget_duration: '30d',
        rpm_limit: safeRpm,
        models: ['AnaModel'],
        metadata: { created_via: 'inference-web', created_at: new Date().toISOString() },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'Key generation failed' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      key: data.key,
      user_id: data.user_id,
      max_budget: data.max_budget,
      rpm_limit: data.rpm_limit,
      models: data.models,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
