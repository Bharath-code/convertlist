'use client';

import React from 'react';

interface ForecastData {
  month: string;
  predicted: number;
  lower?: number;
  upper?: number;
}

interface ForecastChartProps {
  data: ForecastData[];
  className?: string;
  currency?: string;
}

export function ForecastChart({ data, className = '', currency = '$' }: ForecastChartProps) {
  const maxValue = Math.max(...data.map((d) => d.upper || d.predicted));
  const chartHeight = 200;
  const padding = 40;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${currency}${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${currency}${(value / 1000).toFixed(0)}K`;
    return `${currency}${value.toFixed(0)}`;
  };

  return (
    <div className={`relative ${className}`} style={{ height: chartHeight + padding * 2 }}>
      <svg width="100%" height={chartHeight + padding * 2} className="overflow-visible">
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <g key={ratio}>
            <line
              x1={padding}
              y1={padding + chartHeight * (1 - ratio)}
              x2={`100%`}
              y2={padding + chartHeight * (1 - ratio)}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="4 4"
            />
            <text
              x={padding - 8}
              y={padding + chartHeight * (1 - ratio) + 4}
              textAnchor="end"
              className="text-[10px] fill-muted-foreground"
            >
              {formatCurrency(maxValue * ratio)}
            </text>
          </g>
        ))}

        {/* Confidence Interval Area */}
        <path
          d={data
            .map((d, i) => {
              const x = padding + (i * (100 - padding)) / (data.length - 1);
              const yLower = padding + chartHeight * (1 - (d.upper || d.predicted) / maxValue);
              const yUpper = padding + chartHeight * (1 - (d.lower || d.predicted) / maxValue);
              return `${i === 0 ? 'M' : 'L'} ${x} ${yLower}`;
            })
            .join(' ') +
            ' ' +
            data
              .reverse()
              .map((d, i) => {
                const x = padding + ((data.length - 1 - i) * (100 - padding)) / (data.length - 1);
                const y = padding + chartHeight * (1 - (d.lower || d.predicted) / maxValue);
                return `L ${x} ${y}`;
              })
              .join(' ') +
            ' Z'}
          fill="currentColor"
          fillOpacity={0.1}
          className="text-blue-500"
        />

        {/* Predicted Line */}
        <path
          d={data
            .map((d, i) => {
              const x = padding + (i * (100 - padding)) / (data.length - 1);
              const y = padding + chartHeight * (1 - d.predicted / maxValue);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="text-blue-600 dark:text-blue-400"
        />

        {/* Data Points */}
        {data.map((d, i) => {
          const x = padding + (i * (100 - padding)) / (data.length - 1);
          const y = padding + chartHeight * (1 - d.predicted / maxValue);
          return (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={x}
                cy={y}
                r={4}
                className="fill-white stroke-blue-600 dark:stroke-blue-400 transition-all group-hover:r-6"
                strokeWidth={2}
              />
              <title>{`${d.month}: ${formatCurrency(d.predicted)}`}</title>
            </g>
          );
        })}

        {/* X-Axis Labels */}
        {data.map((d, i) => {
          const x = padding + (i * (100 - padding)) / (data.length - 1);
          return (
            <text
              key={i}
              x={x}
              y={chartHeight + padding + 16}
              textAnchor="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {d.month}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
