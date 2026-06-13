import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ConnectionsClient } from "./connections-client";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-in");

  const [integrations, recentSends, repliedCount] = await Promise.all([
    db.integration.findMany({
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
      },
      orderBy: { createdAt: "asc" },
    }),
    db.outreachSend.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { waitlist: { select: { name: true, id: true } } },
    }),
    db.lead.count({
      where: { waitlist: { userId: user.id }, status: { in: ["REPLIED", "INTERESTED", "PAID"] } },
    }),
  ]);

  return (
    <ConnectionsClient
      integrations={integrations.map((i) => ({
        ...i,
        lastError: i.lastError ?? null,
        lastErrorAt: i.lastErrorAt?.toISOString() ?? null,
        lastSyncedAt: i.lastSyncedAt?.toISOString() ?? null,
        createdAt: i.createdAt.toISOString(),
        config: i.config ?? null,
      }))}
      recentSends={recentSends.map((s) => ({
        id: s.id,
        status: s.status,
        leadCount: s.leadCount,
        fromEmail: s.fromEmail,
        errorMessage: s.errorMessage,
        createdAt: s.createdAt.toISOString(),
        waitlist: s.waitlist,
        instantlyCampaignId: s.instantlyCampaignId,
      }))}
      repliedCount={repliedCount}
      instantlyConfigured={!!process.env.INSTANTLY_API_KEY}
    />
  );
}
