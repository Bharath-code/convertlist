import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import Link from "next/link";
import { DashboardSkeleton } from "./dashboard-client";
import { RepliesLive } from "@/components/replies/replies-live";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">ConvertList</h1>
          <nav className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </a>
            <a href="/upload" className="text-sm text-slate-600 hover:text-slate-900">
              Upload
            </a>
            <Link href="/connections" className="text-sm text-slate-600 hover:text-slate-900">
              Connections
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Suspense fallback={<DashboardSkeleton />}>
          {children}
        </Suspense>
      </main>
      {userId && <RepliesLive />}
    </div>
  );
}
