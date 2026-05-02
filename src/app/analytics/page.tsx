import { Suspense } from 'react';
import { getAnalyticsMetrics } from '@/lib/analytics/metrics';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

async function AnalyticsContent() {
  const metrics = await getAnalyticsMetrics();
  return <AnalyticsDashboard metrics={metrics} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Deep insights into conversion funnels, cohorts, and forecasts
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
