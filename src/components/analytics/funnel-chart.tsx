'use client';

import React from 'react';

interface FunnelStage {
  label: string;
  count: number;
  color: string;
}

interface FunnelChartProps {
  data: FunnelStage[];
  className?: string;
}

export function FunnelChart({ data, className = '' }: FunnelChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count));
  const totalHeight = 300;
  const segmentHeight = totalHeight / data.length;

  return (
    <div className={`relative w-full ${className}`} style={{ height: totalHeight }}>
      <svg width="100%" height={totalHeight} className="overflow-visible">
        {data.map((stage, index) => {
          const widthPercent = (stage.count / maxCount) * 100;
          const y = index * segmentHeight;
          const height = segmentHeight - 4; // 4px gap
          const x = (100 - widthPercent) / 2; // Center align

          return (
            <g key={stage.label} className="group cursor-pointer">
              {/* Gradient Definition */}
              <defs>
                <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={stage.color} stopOpacity={0.6} />
                  <stop offset="50%" stopColor={stage.color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={stage.color} stopOpacity={0.6} />
                </linearGradient>
              </defs>

              {/* Funnel Segment */}
              <rect
                x={`${x}%`}
                y={y + 2}
                width={`${widthPercent}%`}
                height={height}
                rx={4}
                fill={`url(#grad-${index})`}
                className="transition-all duration-300 group-hover:opacity-100"
              />

              {/* Label & Count */}
              <text
                x="50%"
                y={y + segmentHeight / 2 + 6}
                textAnchor="middle"
                className="fill-current text-sm font-medium opacity-90"
                style={{ fontSize: '14px' }}
              >
                {stage.label}
              </text>
              
              {/* Hidden tooltip data for interaction */}
              <title>{`${stage.label}: ${stage.count} (${((stage.count / data[0].count) * 100).toFixed(1)}%)`}</title>
            </g>
          );
        })}
      </svg>
      
      {/* Drop-off indicators */}
      <div className="absolute right-0 top-0 h-full w-1/4 flex flex-col justify-around items-end text-xs text-muted-foreground pr-2">
        {data.slice(0, -1).map((stage, i) => {
          const next = data[i + 1];
          const dropOff = ((stage.count - next.count) / stage.count) * 100;
          return (
            <div key={i} className="text-right">
              <span className="text-red-500 font-medium">↓ {dropOff.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
