import { NextRequest } from 'next/server';
import { and, desc, gt, isNull, or, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { gatewayRequests } from '@/lib/db/schema';
import { getUser, getUserWithTeam } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';
export const maxDuration = 55;

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const row = await getUserWithTeam(user.id);
  const teamId = row?.teamId;
  if (!teamId) return new Response('No team', { status: 401 });

  const lastId = parseInt(req.nextUrl.searchParams.get('last_id') ?? '0', 10);
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let currentLastId = lastId;
      const POLL_MS = 2500;
      const MAX_MS = 48_000; // close before Vercel timeout; EventSource auto-reconnects
      const startAt = Date.now();

      const send = (chunk: string) => {
        try { controller.enqueue(enc.encode(chunk)); } catch { /* closed */ }
      };

      send(': connected\n\n');

      while (!req.signal.aborted && Date.now() - startAt < MAX_MS) {
        try {
          const rows = await db
            .select()
            .from(gatewayRequests)
            .where(and(
              or(eq(gatewayRequests.teamId, teamId), isNull(gatewayRequests.teamId)),
              gt(gatewayRequests.id, currentLastId),
            ))
            .orderBy(desc(gatewayRequests.id))
            .limit(20);

          if (rows.length > 0) {
            currentLastId = rows[0].id; // highest id
            const payload = JSON.stringify(rows.reverse()); // oldest-first for the client
            send(`id:${currentLastId}\ndata:${payload}\n\n`);
          } else {
            send(': heartbeat\n\n');
          }
        } catch {
          send(': error\n\n');
        }

        // Sleep between polls, but wake immediately on client disconnect
        await new Promise<void>((resolve) => {
          const t = setTimeout(resolve, POLL_MS);
          req.signal.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
        });
      }

      // Tell client to reconnect in 100ms from where we left off
      send(`retry:100\nid:${currentLastId}\n: reconnect\n\n`);
      try { controller.close(); } catch { /* already closed */ }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
