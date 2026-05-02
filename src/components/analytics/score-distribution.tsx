'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ScoreDistributionProps {
  leads: Array<{
    id: string;
    score: number | null;
    segment: 'HOT' | 'WARM' | 'COLD' | null;
    status: string;
  }>;
  className?: string;
}

export function ScoreDistribution({ leads, className }: ScoreDistributionProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');

  const distribution = useMemo(() => {
    const hotLeads = leads.filter((l) => l.segment === 'HOT');
    const warmLeads = leads.filter((l) => l.segment === 'WARM');
    const coldLeads = leads.filter((l) => l.segment === 'COLD');

    const total = leads.length;

    return [
      {
        segment: 'HOT' as const,
        count: hotLeads.length,
        percentage: total > 0 ? (hotLeads.length / total) * 100 : 0,
        avgScore:
          hotLeads.length > 0
            ? Math.round(
                hotLeads.reduce((sum, l) => sum + (l.score ?? 0), 0) / hotLeads.length
              )
            : 0,
        color: 'from-red-500 to-rose-600',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        icon: '🔥',
      },
      {
        segment: 'WARM' as const,
        count: warmLeads.length,
        percentage: total > 0 ? (warmLeads.length / total) * 100 : 0,
        avgScore:
          warmLeads.length > 0
            ? Math.round(
                warmLeads.reduce((sum, l) => sum + (l.score ?? 0), 0) / warmLeads.length
              )
            : 0,
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        icon: '☀️',
      },
      {
        segment: 'COLD' as const,
        count: coldLeads.length,
        percentage: total > 0 ? (coldLeads.length / total) * 100 : 0,
        avgScore:
          coldLeads.length > 0
            ? Math.round(
                coldLeads.reduce((sum, l) => sum + (l.score ?? 0), 0) / coldLeads.length
              )
            : 0,
        color: 'from-blue-500 to-cyan-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        icon: '❄️',
      },
    ] as const;
  }, [leads]);

  const scoreRanges = useMemo(() => {
    const ranges = [
      { label: '90-100', min: 90, max: 100, count: 0, color: 'bg-emerald-500' },
      { label: '80-89', min: 80, max: 89, count: 0, color: 'bg-green-500' },
      { label: '70-79', min: 70, max: 79, count: 0, color: 'bg-lime-500' },
      { label: '60-69', min: 60, max: 69, count: 0, color: 'bg-yellow-500' },
      { label: '50-59', min: 50, max: 59, count: 0, color: 'bg-amber-500' },
      { label: '40-49', min: 40, max: 49, count: 0, color: 'bg-orange-500' },
      { label: '30-39', min: 30, max: 39, count: 0, color: 'bg-red-400' },
      { label: '20-29', min: 20, max: 29, count: 0, color: 'bg-red-500' },
      { label: '10-19', min: 10, max: 19, count: 0, color: 'bg-red-600' },
      { label: '0-9', min: 0, max: 9, count: 0, color: 'bg-rose-700' },
    ];

    leads.forEach((lead) => {
      const score = lead.score ?? 0;
      const range = ranges.find((r) => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    const maxCount = Math.max(...ranges.map((r) => r.count), 1);

    return ranges.map((range) => ({
      ...range,
      height: (range.count / maxCount) * 100,
    }));
  }, [leads]);

  const stats = useMemo(() => {
    const validScores = leads.filter((l) => l.score !== null).map((l) => l.score!);
    if (validScores.length === 0) {
      return { avg: 0, median: 0, top10Percent: 0 };
    }

    const sorted = [...validScores].sort((a, b) => a - b);
    const avg = Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
    const median =
      sorted.length % 2 === 0
        ? Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
        : sorted[Math.floor(sorted.length / 2)];
    const top10Count = Math.ceil(validScores.length * 0.1);
    const top10Percent = validScores.slice(-top10Count).reduce((a, b) => a + b, 0) / top10Count;

    return { avg, median, top10Percent: Math.round(top10Percent) };
  }, [leads]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Score Distribution</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {leads.length} leads analyzed
          </p>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">Average Score</div>
            <div className="text-2xl font-bold text-gray-900">{stats.avg}</div>
            <div className="text-xs text-gray-400 mt-1">Across all leads</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="text-xs text-gray-500 mb-1">Median Score</div>
            <div className="text-2xl font-bold text-gray-900">{stats.median}</div>
            <div className="text-xs text-gray-400 mt-1">50th percentile</div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 border-2 bg-purple-50/50">
          <CardContent className="p-4">
            <div className="text-xs text-purple-600 mb-1 font-medium">Top 10% Average</div>
            <div className="text-2xl font-bold text-purple-700">{stats.top10Percent}</div>
            <div className="text-xs text-purple-500 mt-1">Highest performers</div>
          </CardContent>
        </Card>
      </div>

      {/* Segment Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {distribution.map((segment) => (
          <Card
            key={segment.segment}
            className={cn('border-2 overflow-hidden', segment.borderColor)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="text-lg">{segment.icon}</span>
                {segment.segment} Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {segment.count}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {segment.percentage.toFixed(1)}% of total
                  </div>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('absolute inset-y-0 left-0 rounded-full', `bg-gradient-to-r ${segment.color}`)}
                    style={{ width: `${segment.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Avg Score:</span>
                  <span className={cn('font-semibold', segment.textColor)}>
                    {segment.avgScore}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Histogram */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            Score Range Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-1 h-32">
            {scoreRanges.map((range) => (
              <div key={range.label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn('w-full rounded-t transition-all hover:opacity-80', range.color)}
                  style={{ height: `${Math.max(range.height, 4)}%` }}
                  title={`${range.count} leads`}
                />
                <div className="text-[10px] text-gray-500 rotate-0 whitespace-nowrap">
                  {range.label}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Lower Quality ←</span>
              <span>→ Higher Quality</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-blue-200 border-2 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">AI Insights</h3>
              <p className="text-sm text-gray-600">
                {distribution[0].percentage >= 30 ? (
                  <>
                    <strong className="text-red-700">Excellent!</strong> You have{' '}
                    <strong>{distribution[0].count} hot leads</strong> ({distribution[0].percentage.toFixed(1)}%). 
                    Focus your outreach efforts here for maximum conversion potential.
                  </>
                ) : distribution[0].percentage >= 15 ? (
                  <>
                    <strong className="text-amber-700">Good start!</strong> Consider enriching 
                    warm leads to identify additional high-potential prospects.
                  </>
                ) : (
                  <>
                    <strong className="text-blue-700">Opportunity:</strong> Most leads are in the 
                    cold segment. Try re-engagement campaigns or review your sourcing strategy.
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
