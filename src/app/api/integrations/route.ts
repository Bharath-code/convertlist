/**
 * Per-user integration management.
 *
 *   GET  /api/integrations        → list the caller's integrations (no secrets)
 *   POST /api/integrations        → upsert one (provider + config + optional secret)
 *   DEL  /api/integrations?id=... → disable / delete
 *
 * All secrets are encrypted at rest with AES-256-GCM (see lib/integrations/crypto).
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { encryptSecret } from "@/lib/integrations/crypto";

export const dynamic = "force-dynamic";

const PROVIDERS = ["instantly", "slack", "discord", "gmail"] as const;

const upsertSchema = z.object({
  provider: z.enum(PROVIDERS),
  enabled: z.boolean().default(true),
  config: z.record(z.string(), z.string().max(500)).optional(),
  secret: z.string().max(4000).optional(),
});

async function getOrCreateDbUser(clerkId: string) {
  const existing = await db.user.findUnique({ where: { clerkId } });
  if (existing) return existing;
  // Should be created at sign-up, but be defensive
  return db.user.create({
    data: { clerkId, email: `${clerkId}@unknown.local` },
  });
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await getOrCreateDbUser(clerkId);

    const rows = await db.integration.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        provider: true,
        enabled: true,
        config: true,
        lastSyncedAt: true,
        lastErrorAt: true,
        lastError: true,
        createdAt: true,
        updatedAt: true,
        // never return the encrypted blobs
      },
    });

    return NextResponse.json({ integrations: rows });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await getOrCreateDbUser(clerkId);

    const body = await req.json();
    const parsed = upsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { provider, enabled, config, secret } = parsed.data;
    const data: Record<string, unknown> = { enabled };
    if (config) data.config = JSON.stringify(config);
    if (secret && secret.length > 0) {
      // Decide which column the secret goes into
      const enc = encryptSecret(secret);
      if (provider === "instantly") data.accessTokenEnc = enc;
      else if (provider === "slack" || provider === "discord") data.webhookSecretEnc = enc;
      else data.accessTokenEnc = enc;
    }

    const row = await db.integration.upsert({
      where: { userId_provider: { userId: user.id, provider } },
      create: { userId: user.id, provider, ...data },
      update: data,
    });

    return NextResponse.json({
      ok: true,
      integration: {
        id: row.id,
        provider: row.provider,
        enabled: row.enabled,
        config: row.config,
        lastSyncedAt: row.lastSyncedAt,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await getOrCreateDbUser(clerkId);

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const row = await db.integration.findUnique({ where: { id } });
    if (!row || row.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await db.integration.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
