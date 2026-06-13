import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import Link from "next/link";
import { DashboardSkeleton } from "./dashboard-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#050505]">
      <header className="border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-2xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link
            href={userId ? "/dashboard" : "/"}
            className="flex items-center gap-2 group"
          >
            <span className="size-7 rounded-lg bg-gradient-to-br from-emerald-400/30 to-violet-400/20 border border-white/10 flex items-center justify-center text-[10px] font-medium">
              C
            </span>
            <span className="font-medium text-white text-sm tracking-tight">ConvertList</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/upload" label="Upload" />
            <NavLink href="/connections" label="Connections" />
            <NavLink href="/pricing" label="Pricing" />
          </nav>
        </div>
      </header>
      <main>
        <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
      </main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3.5 py-1.5 text-white/50 hover:text-white hover:bg-white/5 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
    >
      {label}
    </Link>
  );
}
