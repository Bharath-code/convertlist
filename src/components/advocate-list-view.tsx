"use client";

import { useEffect, useState } from "react";
import { Award, Mail, MessageSquare } from "lucide-react";

interface AdvocateList {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  viralityScore: number;
  sharePropensity: number;
  networkReach: number;
  advocatePotential: number;
}

interface AdvocateListViewProps {
  waitlistId: string;
}

export default function AdvocateListView({ waitlistId }: AdvocateListViewProps) {
  const [advocates, setAdvocates] = useState<AdvocateList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/waitlist/${waitlistId}/virality`);
        if (response.ok) {
          const result = await response.json();
          if (result.hasViralityData && result.leads) {
            const sortedAdvocates = result.leads
              .filter((l: any) => l.advocatePotential >= 0.6)
              .sort((a: any, b: any) => b.advocatePotential - a.advocatePotential);
            setAdvocates(sortedAdvocates);
          }
        }
      } catch (error) {
        console.error("Failed to fetch advocates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [waitlistId]);

  if (loading) {
    return <div className="card p-6">Loading advocates...</div>;
  }

  if (advocates.length === 0) {
    return (
      <div className="card p-6">
        <p className="text-slate-500">No advocates found yet. Run virality analysis to identify advocates.</p>
      </div>
    );
  }

  const getAdvocateLevel = (score: number): string => {
    if (score >= 0.8) return "Super Advocate";
    if (score >= 0.6) return "Advocate";
    return "Potential";
  };

  const getAdvocateColor = (score: number): string => {
    if (score >= 0.8) return "text-purple-600";
    if (score >= 0.6) return "text-blue-600";
    return "text-slate-600";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Advocates ({advocates.length})</h3>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email All
          </button>
          <button className="btn-secondary text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Generate Outreach
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {advocates.map((advocate) => (
          <div key={advocate.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-slate-900">
                    {advocate.name || advocate.email}
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getAdvocateColor(advocate.advocatePotential)}`}
                  >
                    {getAdvocateLevel(advocate.advocatePotential)}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{advocate.company || "No company"}</p>
                <p className="text-xs text-slate-500 mt-1">{advocate.email}</p>
              </div>
              <div className="text-right ml-4">
                <div className="flex items-center gap-1 mb-1">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span className="text-lg font-bold text-slate-900">
                    {(advocate.advocatePotential * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-slate-500">Advocate Score</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
              <div>
                <div className="text-xs text-slate-500 mb-1">Share Propensity</div>
                <div className="text-sm font-medium text-slate-900">
                  {(advocate.sharePropensity * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Network Reach</div>
                <div className="text-sm font-medium text-slate-900">
                  {advocate.networkReach.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Virality Score</div>
                <div className="text-sm font-medium text-slate-900">
                  {advocate.viralityScore}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
