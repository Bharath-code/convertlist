"use client";

import { StatsCardSkeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-4" />
      
      <div className="space-y-3">
        <div className="card h-24 bg-slate-100 animate-pulse" />
        <div className="card h-24 bg-slate-100 animate-pulse" />
        <div className="card h-24 bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}
