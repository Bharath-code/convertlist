import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  Users,
  TrendingUp,
  Mail,
  DollarSign,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { EmptyWaitlist } from "@/components/ui/empty-state";
import { Button } from "@/components/patterns";
import { Card, CardContent } from "@/components/patterns";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      waitlists: {
        include: {
          leads: {
            select: {
              id: true,
              segment: true,
              status: true,
              score: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/sign-in");

  const waitlists = user.waitlists;

  const totalLeads = waitlists.reduce((sum, w) => sum + w.totalLeads, 0);
  const totalHot = waitlists.reduce(
    (sum, w) => sum + w.leads.filter((l) => l.segment === "HOT").length,
    0
  );
  const totalWarm = waitlists.reduce(
    (sum, w) => sum + w.leads.filter((l) => l.segment === "WARM").length,
    0
  );
  const totalCold = waitlists.reduce(
    (sum, w) => sum + w.leads.filter((l) => l.segment === "COLD").length,
    0
  );

  const contacted = waitlists.reduce(
    (sum, w) =>
      sum + w.leads.filter((l) => l.status !== "UNCONTACTED").length,
    0
  );
  const replied = waitlists.reduce(
    (sum, w) => sum + w.leads.filter((l) => l.status === "REPLIED" || l.status === "INTERESTED" || l.status === "PAID").length,
    0
  );
  const paid = waitlists.reduce(
    (sum, w) => sum + w.leads.filter((l) => l.status === "PAID").length,
    0
  );

  const stats = [
    {
      label: "Total Leads",
      value: totalLeads,
      icon: Users,
      color: "text-slate-700",
    },
    {
      label: "Hot Leads",
      value: totalHot,
      icon: TrendingUp,
      color: "text-red-600",
      sub: totalLeads > 0 ? `${Math.round((totalHot / totalLeads) * 100)}%` : "0%",
    },
    {
      label: "Contacted",
      value: contacted,
      icon: Mail,
      color: "text-blue-600",
      sub: totalLeads > 0 ? `${Math.round((contacted / totalLeads) * 100)}%` : "0%",
    },
    {
      label: "Paid",
      value: paid,
      icon: DollarSign,
      color: "text-green-600",
      sub: totalLeads > 0 ? `${Math.round((paid / totalLeads) * 100)}%` : "0%",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            {waitlists.length} waitlist{waitlists.length !== 1 ? "es" : ""} &middot;{" "}
            {user.plan === "FREE"
              ? "Free tier"
              : user.plan === "PRO"
              ? "Pro plan"
              : user.plan === "PRO_PLUS"
              ? "Pro Plus"
              : user.plan === "LAUNCH"
              ? "Lifetime"
              : "Free tier"}
          </p>
        </div>
        <Link href="/upload">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            New Waitlist
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} variant="default" className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {stat.value}
              </span>
              {stat.sub && (
                <span className="text-sm text-slate-500 mb-1">{stat.sub}</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-6 flex gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-slate-600">Hot ({totalHot})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-sm text-slate-600">Warm ({totalWarm})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-slate-600">Cold ({totalCold})</span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Waitlists</h2>

      {waitlists.length === 0 ? (
        <div className="max-w-2xl mx-auto">
          <EmptyWaitlist />
          
          <Card variant="default" className="border-2 border-dashed border-slate-200 mt-8">
            <CardContent>
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                Get started in 3 steps
              </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-slate-900">Upload your waitlist</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Drop a CSV file or paste emails. We'll parse and deduplicate automatically.
                  </p>
                  <Link href="/upload" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                    Upload now &rarr;
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-4 opacity-50">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-slate-900">Review AI scores</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Each lead gets scored 0-90 based on domain quality, intent, recency, and source.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Hot ≥60 · Warm 35-59 · Cold &lt;35</p>
                </div>
              </div>

              <div className="flex items-start gap-4 opacity-50">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-slate-900">Send personalized outreach</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Generate AI-powered emails for each lead. Export and start converting.
                  </p>
                </div>
              </div>
            </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  <strong>Free plan:</strong> 50 lead analyses, no credit card required.
                </p>
                <Link href="/pricing" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                  View pricing &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-3">
          {waitlists.map((waitlist) => (
            <Link
              key={waitlist.id}
              href={
                waitlist.status === "COMPLETED"
                  ? `/results/${waitlist.id}`
                  : `/processing/${waitlist.id}`
              }
            >
              <Card variant="default" className="flex items-center justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-slate-900">{waitlist.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      waitlist.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : waitlist.status === "PROCESSING"
                        ? "bg-blue-100 text-blue-700"
                        : waitlist.status === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {waitlist.status.toLowerCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {waitlist.totalLeads} leads &middot;{" "}
                  {waitlist.leads.filter((l) => l.segment === "HOT").length} hot
                </p>
              </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; 2026 ConvertList</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-700">Terms</Link>
            <a href="mailto:support@convertlist.ai" className="hover:text-slate-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
