'use client';

import React from 'react';

interface SourceData {
  source: string;
  count: number;
  conversionRate: number;
}

interface SourceAttributionProps {
  data: SourceData[];
  className?: string;
}

export function SourceAttribution({ data, className = '' }: SourceAttributionProps) {
  const totalLeads = data.reduce((sum, s) => sum + s.count, 0);
  
  // Sort by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-muted/30">
          <div className="text-2xl font-bold">{totalLeads.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Leads</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-emerald-500/10">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {(data.reduce((sum, s) => sum + (s.count * s.conversionRate), 0) / totalLeads).toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">Avg Conversion</div>
        </div>
      </div>

      {/* Source List */}
      <div className="space-y-3">
        {sortedData.map((source, index) => {
          const percentage = (source.count / totalLeads) * 100;
          const maxCount = sortedData[0].count;
          const barWidth = (source.count / maxCount) * 100;
          
          // Color based on conversion rate
          const getColor = (rate: number) => {
            if (rate >= 50) return 'bg-emerald-500';
            if (rate >= 30) return 'bg-blue-500';
            if (rate >= 15) return 'bg-amber-500';
            return 'bg-orange-500';
          };

          return (
            <div key={source.source} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="font-medium text-sm">{source.source}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{source.count.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {source.conversionRate.toFixed(1)}% conv.
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${getColor(source.conversionRate)}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              
              {/* Hover Details */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 text-xs text-muted-foreground">
                {percentage.toFixed(1)}% of total leads • {source.count} leads
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights */}
      {sortedData.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">💡 Insight</h4>
          <p className="text-xs text-muted-foreground">
            Top performing source is <strong>{sortedData[0].source}</strong> with{' '}
            <strong>{sortedData[0].conversionRate.toFixed(1)}%</strong> conversion rate.
            {sortedData.length > 1 && (
              <>
                {' '}Consider allocating more resources to this channel while optimizing{' '}
                <strong>{sortedData[sortedData.length - 1].source}</strong> which has the lowest conversion.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
