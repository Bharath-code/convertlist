'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FunnelChart } from './funnel-chart';
import { CohortHeatmap } from './cohort-heatmap';
import { ForecastChart } from './forecast-chart';
import { SourceAttribution } from './source-attribution';

interface AnalyticsDashboardProps {
  metrics: {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    averageScore: number;
    funnelData: Array<{ label: string; count: number; color: string }>;
    cohortData: Array<{ period: string; total: number; retention: number[] }>;
    forecastData: Array<{ month: string; predicted: number; lower?: number; upper?: number }>;
    sourceData: Array<{ source: string; count: number; conversionRate: number }>;
  };
}

export function AnalyticsDashboard({ metrics }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalLeads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all sources</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-emerald-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.convertedLeads.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.conversionRate.toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.averageScore.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-purple-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {metrics.sourceData.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active channels</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Track lead progression through stages</CardDescription>
        </CardHeader>
        <CardContent>
          <FunnelChart data={metrics.funnelData} />
        </CardContent>
      </Card>

      {/* Cohort Analysis & Forecast */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cohort Retention</CardTitle>
            <CardDescription>User retention by signup period</CardDescription>
          </CardHeader>
          <CardContent>
            <CohortHeatmap data={metrics.cohortData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
            <CardDescription>Predicted conversions with confidence intervals</CardDescription>
          </CardHeader>
          <CardContent>
            <ForecastChart data={metrics.forecastData} />
          </CardContent>
        </Card>
      </div>

      {/* Source Attribution */}
      <Card>
        <CardHeader>
          <CardTitle>Source Attribution</CardTitle>
          <CardDescription>Performance by acquisition channel</CardDescription>
        </CardHeader>
        <CardContent>
          <SourceAttribution data={metrics.sourceData} />
        </CardContent>
      </Card>
    </div>
  );
}
