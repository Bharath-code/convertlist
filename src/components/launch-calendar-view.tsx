"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface LaunchCalendarViewProps {
  recommendedDate: Date | null;
  seasonalityData: any | null;
}

export default function LaunchCalendarView({ recommendedDate, seasonalityData }: LaunchCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getDayScore = (date: Date): number => {
    if (!seasonalityData || !seasonalityData.recommendedLaunchWindows) return 0;
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();
    const window = seasonalityData.recommendedLaunchWindows.find((w: any) => w.day === day);
    return window ? window.confidence * 10 : 0;
  };

  const isRecommendedDate = (date: Date): boolean => {
    if (!recommendedDate) return false;
    return date.toDateString() === recommendedDate.toDateString();
  };

  const isPastDate = (date: Date): boolean => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">Launch Calendar</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-slate-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-slate-900 min-w-[150px] text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-slate-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-xs font-medium text-slate-500 text-center py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="p-2" />;
          }

          const score = getDayScore(day);
          const isRecommended = isRecommendedDate(day);
          const isPast = isPastDate(day);

          let bgClass = "bg-slate-50";
          if (isRecommended) {
            bgClass = "bg-green-100 border-2 border-green-500";
          } else if (!isPast && score > 5) {
            bgClass = "bg-green-50";
          } else if (!isPast && score > 3) {
            bgClass = "bg-amber-50";
          } else if (isPast) {
            bgClass = "bg-slate-100 opacity-50";
          }

          return (
            <div
              key={index}
              className={`p-2 rounded text-center ${bgClass} cursor-pointer hover:opacity-80 transition-opacity`}
            >
              <div className="text-sm font-medium text-slate-900">{day.getDate()}</div>
              {!isPast && score > 0 && (
                <div className="text-xs text-slate-600 mt-1">
                  {score.toFixed(1)}
                </div>
              )}
              {isRecommended && (
                <div className="text-xs text-green-600 font-medium mt-1">Best</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-100 border-2 border-green-500" />
          <span>Recommended</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-50" />
          <span>High Engagement</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-50" />
          <span>Medium Engagement</span>
        </div>
      </div>
    </div>
  );
}
