import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { providerKeys } from '@/lib/db/schema';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { encryptKey, makeHint } from '@/lib/crypto';

const VALID_PROVIDERS = ['anthropic', 'openai', 'gemini', 'groq', 'openai-compat'];

async function getTeamId(): Promise<number | null> {
  const user = await getUser();
  if (!user) return null;
  const row = await getUserWithTeam(user.id);
  return row?.teamId ?? null;
}

export async function GET() {
  const teamId = await getTeamId();
  if (!teamId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await db
    .select({
      id: providerKeys.id,
      provider: providerKeys.provider,
      keyHint: providerKeys.keyHint,
      baseUrl: providerKeys.baseUrl,
      name: providerKeys.name,
      createdAt: providerKeys.createdAt,
    })
    .from(providerKeys)
    .where(eq(providerKeys.teamId, teamId))
    .orderBy(providerKeys.createdAt);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const teamId = await getTeamId();
  if (!teamId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { provider, api_key, base_url, name } = body;

  if (!VALID_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }
  if (!api_key || api_key.length < 8) {
    return NextResponse.json({ error: 'API key too short' }, { status: 400 });
  }
  if (provider === 'openai-compat' && !base_url) {
    return NextResponse.json({ error: 'base_url required for openai-compat' }, { status: 400 });
  }

  // Upsert: delete existing for same provider then insert
  await db.delete(providerKeys).where(
    and(eq(providerKeys.teamId, teamId), eq(providerKeys.provider, provider))
  );

  const [row] = await db.insert(providerKeys).values({
    teamId,
    provider,
    keyHint: makeHint(api_key),
    keyEnc: encryptKey(api_key),
    baseUrl: base_url || null,
    name: name || null,
  }).returning({
    id: providerKeys.id,
    provider: providerKeys.provider,
    keyHint: providerKeys.keyHint,
    baseUrl: providerKeys.baseUrl,
    name: providerKeys.name,
    createdAt: providerKeys.createdAt,
  });

  return NextResponse.json(row, { status: 201 });
}
