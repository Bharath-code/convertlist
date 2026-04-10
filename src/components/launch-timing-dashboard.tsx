"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, TrendingUp, AlertCircle } from "lucide-react";

interface LaunchTimingData {
  launchReadinessScore: number | null;
  recommendedLaunchDate: string | null;
  engagementHeatmap: any | null;
  seasonalityData: any | null;
}

interface LaunchTimingDashboardProps {
  waitlistId: string;
}

export default function LaunchTimingDashboard({ waitlistId }: LaunchTimingDashboardProps) {
  const [data, setData] = useState<LaunchTimingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/waitlist/${waitlistId}/launch-timing`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch launch timing data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [waitlistId]);

  if (loading) {
    return <div className="card p-6">Loading launch timing data...</div>;
  }

  if (!data || !data.launchReadinessScore) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 text-slate-500">
          <AlertCircle className="w-5 h-5" />
          <p>Launch timing analysis not yet available. Run the analysis to see recommendations.</p>
        </div>
      </div>
    );
  }

  const readinessColor =
    data.launchReadinessScore >= 80
      ? "text-green-600"
      : data.launchReadinessScore >= 60
      ? "text-amber-600"
      : "text-red-600";

  const recommendation =
    data.launchReadinessScore >= 80
      ? "Launch Now"
      : data.launchReadinessScore >= 60
      ? "Launch Soon"
      : "Wait & Nurture";

  return (
    <div className="space-y-6">
      {/* Readiness Score Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Launch Readiness</h3>
          <TrendingUp className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex items-center gap-4">
          <div className={`text-5xl font-bold ${readinessColor}`}>
            {data.launchReadinessScore}
          </div>
          <div className="text-sm text-slate-600">
            <div className="font-medium">{recommendation}</div>
            <div className="text-xs text-slate-500">out of 100</div>
          </div>
        </div>
      </div>

      {/* Recommended Launch Date */}
      {data.recommendedLaunchDate && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Recommended Launch Date</h3>
          </div>
          <p className="text-2xl font-semibold text-slate-900">
            {new Date(data.recommendedLaunchDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {data.seasonalityData && (
            <p className="text-sm text-slate-600 mt-2">
              Based on peak engagement patterns from your signups
            </p>
          )}
        </div>
      )}

      {/* Engagement Heatmap Summary */}
      {data.engagementHeatmap && data.engagementHeatmap.peakTimes && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900">Peak Engagement Times</h3>
          </div>
          <div className="space-y-2">
            {data.engagementHeatmap.peakTimes.slice(0, 3).map((peak: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {peak.day} at {peak.hour}:00
                </span>
                <span className="font-medium text-slate-900">
                  {peak.score.toFixed(1)} engagement score
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Launch Recommendation */}
      <div className="card p-6 border-2 border-blue-200 bg-blue-50">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">AI Recommendation</h3>
        </div>
        <p className="text-slate-700">
          {recommendation === "Launch Now"
            ? "Your waitlist has strong engagement with plenty of hot leads ready to convert. This is an optimal time to launch."
            : recommendation === "Launch Soon"
            ? "Your waitlist shows good momentum. Consider launching within the next 1-2 weeks while nurturing warm leads."
            : "Your waitlist needs more engagement. Focus on nurturing cold leads and building more signups before launching."}
        </p>
      </div>
    </div>
  );
}
