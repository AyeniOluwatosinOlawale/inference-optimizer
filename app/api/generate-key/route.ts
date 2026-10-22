import { NextRequest, NextResponse } from 'next/server';

const LITELLM_URL = 'https://api.136.65.123.94.nip.io';
const MASTER_KEY  = process.env.LITELLM_MASTER_KEY ?? 'sk-b0454325deddc837764f88240c8f7986';

export async function POST(req: NextRequest) {
  try {
    const { user, budget = 5, rpm = 30 } = await req.json();
    if (!user || typeof user !== 'string' || user.trim().length === 0) {
      return NextResponse.json({ error: 'user is required' }, { status: 400 });
    }

    const res = await fetch(`${LITELLM_URL}/key/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MASTER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.trim(),
        max_budget: budget,
        budget_duration: '30d',
        rpm_limit: rpm,
        models: ['AnaModel'],
        metadata: { created_via: 'inference-web', created_at: new Date().toISOString() },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
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
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
