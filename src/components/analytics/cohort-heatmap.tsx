'use client';

import React, { useMemo } from 'react';

interface CohortData {
  period: string;
  total: number;
  retention: number[]; // Array of retention percentages for each subsequent period
}

interface CohortHeatmapProps {
  data: CohortData[];
  className?: string;
}

export function CohortHeatmap({ data, className = '' }: CohortHeatmapProps) {
  const maxRetention = 100;
  
  // Generate color based on retention percentage
  const getColor = (percentage: number | null) => {
    if (percentage === null) return 'bg-muted/30';
    if (percentage >= 80) return 'bg-emerald-500/80 hover:bg-emerald-500';
    if (percentage >= 60) return 'bg-emerald-400/70 hover:bg-emerald-400';
    if (percentage >= 40) return 'bg-amber-400/60 hover:bg-amber-400';
    if (percentage >= 20) return 'bg-orange-400/50 hover:bg-orange-400';
    return 'bg-red-400/40 hover:bg-red-400';
  };

  const periods = ['Start', '+1', '+2', '+3', '+4', '+5+'];

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="min-w-[600px]">
        {/* Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          <div className="text-xs font-medium text-muted-foreground p-2">Cohort</div>
          {periods.map((p) => (
            <div key={p} className="text-xs font-medium text-muted-foreground text-center p-2">
              {p}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-1">
          {data.map((cohort) => (
            <div key={cohort.period} className="grid grid-cols-7 gap-1 items-center">
              {/* Period Label */}
              <div className="text-xs font-medium text-foreground p-2 truncate" title={cohort.period}>
                {cohort.period}
                <div className="text-[10px] text-muted-foreground">{cohort.total} users</div>
              </div>

              {/* Retention Cells */}
              {cohort.retention.map((rate, idx) => (
                <div
                  key={idx}
                  className={`h-10 rounded-md flex items-center justify-center transition-all duration-200 cursor-default ${getColor(rate)}`}
                  title={`${rate}% retained`}
                >
                  {rate !== null && (
                    <span className="text-xs font-semibold text-white drop-shadow-sm">
                      {rate}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>Low</span>
          <div className="w-4 h-4 rounded bg-red-400/40"></div>
          <div className="w-4 h-4 rounded bg-orange-400/50"></div>
          <div className="w-4 h-4 rounded bg-amber-400/60"></div>
          <div className="w-4 h-4 rounded bg-emerald-400/70"></div>
          <div className="w-4 h-4 rounded bg-emerald-500/80"></div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
