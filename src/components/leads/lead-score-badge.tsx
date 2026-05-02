'use client';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LeadScoreBadgeProps {
  score: number | null;
  reason?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export function LeadScoreBadge({
  score,
  reason,
  size = 'md',
  showTooltip = true,
  className,
}: LeadScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-400 font-semibold',
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-1 text-sm': size === 'md',
            'px-3 py-1.5 text-base': size === 'lg',
          },
          className
        )}
      >
        N/A
      </span>
    );
  }

  const { color, gradient, label, icon } = getScoreVisuals(score);
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs min-w-[60px]',
    md: 'px-2.5 py-1 text-sm min-w-[70px]',
    lg: 'px-3 py-1.5 text-base min-w-[80px]',
  };

  const badgeContent = (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full font-bold shadow-sm transition-all duration-200 hover:shadow-md',
        gradient,
        sizeClasses[size],
        className
      )}
    >
      {icon}
      <span>{score}</span>
    </span>
  );

  if (!showTooltip || !reason) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-3 bg-white border border-gray-200 shadow-lg"
          sideOffset={8}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn('text-lg', color)}>{icon}</span>
              <span className="font-semibold text-gray-900">
                {label} Lead ({score})
              </span>
            </div>
            {reason && (
              <p className="text-xs text-gray-600 leading-relaxed">{reason}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getScoreVisuals(score: number) {
  if (score >= 70) {
    return {
      color: 'text-emerald-600',
      gradient: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200',
      label: 'Hot',
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };
  }

  if (score >= 40) {
    return {
      color: 'text-amber-600',
      gradient: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200',
      label: 'Warm',
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
            clipRule="evenodd"
          />
        </svg>
      ),
    };
  }

  return {
    color: 'text-rose-600',
    gradient: 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200',
    label: 'Cold',
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };
}
