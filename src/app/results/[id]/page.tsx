import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ResultsClient from "./results-client";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const waitlist = await db.waitlist.findUnique({
    where: { id, userId },
    include: {
      leads: {
        orderBy: [{ segment: "asc" }, { score: "desc" }],
      },
    },
  });

  const user = await db.user.findUnique({ where: { clerkId: userId } });

  if (!waitlist) redirect("/dashboard");

  const hotLeads = waitlist.leads.filter((l) => l.segment === "HOT");
  const warmLeads = waitlist.leads.filter((l) => l.segment === "WARM");
  const coldLeads = waitlist.leads.filter((l) => l.segment === "COLD");

  const top10Percent = Math.ceil(waitlist.leads.length * 0.1);

  return (
    <ErrorBoundary>
      <ResultsClient
        waitlist={{
          id: waitlist.id,
          name: waitlist.name,
          totalLeads: waitlist.totalLeads,
        }}
        hotLeads={hotLeads.map(serializeLead)}
        warmLeads={warmLeads.map(serializeLead)}
        coldLeads={coldLeads.map(serializeLead)}
        top10Percent={top10Percent}
        userPlan={user?.plan ?? "FREE"}
      />
    </ErrorBoundary>
  );
}

function serializeLead(lead: {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  signupNote: string | null;
  source: string | null;
  score: number | null;
  confidence: "HIGH" | "MEDIUM" | "LOW" | null;
  reason: string | null;
  segment: "HOT" | "WARM" | "COLD" | null;
  status: "UNCONTACTED" | "CONTACTED" | "REPLIED" | "INTERESTED" | "PAID";
}) {
  return {
    id: lead.id,
    email: lead.email,
    name: lead.name,
    company: lead.company,
    signupNote: lead.signupNote,
    source: lead.source,
    score: lead.score ?? 0,
    confidence: lead.confidence ?? "LOW",
    reason: lead.reason ?? "",
    segment: lead.segment ?? "COLD",
    status: lead.status,
  };
}
