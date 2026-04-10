"use client";

import { useEffect, useState } from "react";
import { Flame, Users, TrendingUp, Award } from "lucide-react";

interface ViralityData {
  hasViralityData: boolean;
  stats: {
    avgViralityScore: number;
    avgAdvocatePotential: number;
    superAdvocates: number;
    advocates: number;
    totalAnalyzed: number;
  } | null;
  leads: any[];
}

interface ViralityAnalyticsDashboardProps {
  waitlistId: string;
}

export default function ViralityAnalyticsDashboard({ waitlistId }: ViralityAnalyticsDashboardProps) {
  const [data, setData] = useState<ViralityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/waitlist/${waitlistId}/virality`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch virality data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [waitlistId]);

  if (loading) {
    return <div className="card p-6">Loading virality analytics data...</div>;
  }

  if (!data || !data.hasViralityData || !data.stats) {
    return (
      <div className="card p-6">
        <p className="text-slate-500">
          Virality analysis not yet available. Run the analysis to see advocate potential.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-slate-600">Avg Virality Score</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data.stats.avgViralityScore}%
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-slate-600">Avg Advocate Potential</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data.stats.avgAdvocatePotential}%
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-slate-600">Super Advocates</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data.stats.superAdvocates}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-slate-600">Total Advocates</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data.stats.advocates}
          </div>
        </div>
      </div>

      {/* Super Advocates List */}
      {data.stats.superAdvocates > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900">Super Advocates</h3>
          </div>
          <div className="space-y-2">
            {data.leads
              .filter((l: any) => (l.advocatePotential || 0) >= 0.8)
              .slice(0, 5)
              .map((lead: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded">
                  <div>
                    <div className="font-medium text-slate-900">
                      {lead.name || lead.email}
                    </div>
                    <div className="text-xs text-slate-600">{lead.company || "No company"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-600">
                      {((lead.advocatePotential || 0) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-slate-500">Advocate Score</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Outreach Recommendation */}
      <div className="card p-6 border-2 border-purple-200 bg-purple-50">
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-slate-900">Outreach Recommendation</h3>
        </div>
        <p className="text-slate-700">
          {data.stats.superAdvocates > 0
            ? `You have ${data.stats.superAdvocates} super advocates who are likely to spread the word about your launch. Consider reaching out to them personally for testimonials and social media shares.`
            : `You have ${data.stats.advocates} potential advocates. Focus on nurturing these leads to increase their advocacy potential before launch.`}
        </p>
      </div>
    </div>
  );
}
