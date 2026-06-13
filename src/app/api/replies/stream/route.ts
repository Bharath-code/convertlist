/**
 * Server-Sent Events stream of recent reply events for the dashboard.
 *
 * On connect: sends all leads in REPLIED/INTERESTED/PAID status (last 50).
 * Then polls DB every 5s for any updates with `updatedAt` newer than the
 * last seen timestamp, and pushes them as `reply` events.
 *
 * Authentication: requires an active Clerk session. The userId query param
 * is intentionally ignored — we always stream the authenticated user's data.
 */

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLL_MS = 5000;

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let lastSeen = new Date(Date.now() - 60_000); // 1 min backfill on first connect
      let closed = false;

      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      const backfill = async () => {
        const leads = await db.lead.findMany({
          where: {
            waitlist: { userId: user.id },
            status: { in: ["REPLIED", "INTERESTED", "PAID"] },
            updatedAt: { gt: lastSeen },
          },
          include: { waitlist: { select: { id: true, name: true } } },
          orderBy: { updatedAt: "desc" },
          take: 50,
        });
        for (const l of leads) {
          send("reply", {
            leadId: l.id,
            email: l.email,
            name: l.name,
            company: l.company,
            status: l.status,
            waitlistId: l.waitlistId,
            waitlistName: l.waitlist.name,
            updatedAt: l.updatedAt,
          });
          if (l.updatedAt > lastSeen) lastSeen = l.updatedAt;
        }
      };

      // Initial backfill
      await backfill();
      send("ready", { ts: Date.now() });

      const interval = setInterval(async () => {
        if (closed) return;
        try {
          await backfill();
        } catch (err) {
          send("error", { message: err instanceof Error ? err.message : "poll error" });
        }
      }, POLL_MS);

      // Keep-alive ping every 25s (proxies kill idle connections)
      const keepAlive = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          closed = true;
        }
      }, 25_000);

      const cleanup = () => {
        closed = true;
        clearInterval(interval);
        clearInterval(keepAlive);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      // Vercel/Next will close after the configured max duration
      const maxDuration = setTimeout(cleanup, 5 * 60_000); // 5 min cap, client will reconnect
      // Best-effort cleanup when the client disconnects (not always reliable in Node)
      const abort = () => {
        clearTimeout(maxDuration);
        cleanup();
      };
      // @ts-expect-error — signal isn't part of the ReadableStream controller type but is supported
      controller.signal?.addEventListener?.("abort", abort);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
