"use client";

import { useState } from "react";
import { Target, TrendingUp, AlertTriangle, BarChart3, ChevronDown, ChevronUp } from "lucide-react";

type CompetitorStats = {
  name: string;
  count: number;
  percentage: number;
};

type FeatureGap = {
  feature: string;
  mentionedBy: number;
  priority: "high" | "medium" | "low";
};

type SwitchingCostStats = {
  lowCost: number;
  mediumCost: number;
  highCost: number;
  averageScore: number;
};

type Props = {
  competitorStats?: Record<string, { count: number; percentage: number }>;
  featureGaps?: FeatureGap[];
  switchingCostStats?: SwitchingCostStats;
  leadsAnalyzed?: number;
  leadsWithCompetitors?: number;
};

export default function CompetitorInsightsDashboard({
  competitorStats = {},
  featureGaps = [],
  switchingCostStats,
  leadsAnalyzed = 0,
  leadsWithCompetitors = 0,
}: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const competitorArray: CompetitorStats[] = Object.entries(competitorStats).map(
    ([name, stats]) => ({
      name,
      count: stats.count,
      percentage: stats.percentage,
    })
  );

  const highPriorityGaps = featureGaps.filter(g => g.priority === "high");
  const competitorPenetrationRate = leadsAnalyzed > 0 
    ? Math.round((leadsWithCompetitors / leadsAnalyzed) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-slate-600">Competitor Penetration</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{competitorPenetrationRate}%</p>
          <p className="text-xs text-slate-500 mt-1">
            {leadsWithCompetitors} of {leadsAnalyzed} leads
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-600">Top Competitor</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {competitorArray.length > 0 ? competitorArray[0].name : "N/A"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {competitorArray.length > 0 ? `${competitorArray[0].percentage}% of leads` : ""}
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-slate-600">Feature Gaps</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{highPriorityGaps.length}</p>
          <p className="text-xs text-slate-500 mt-1">High priority opportunities</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-slate-600">Avg Switching Cost</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {switchingCostStats ? switchingCostStats.averageScore : "N/A"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Score (0-100, higher = harder)</p>
        </div>
      </div>

      {/* Competitor Breakdown */}
      <CollapsibleSection
        title="Competitor Breakdown"
        icon={Target}
        expanded={expandedSection === "competitors"}
        onToggle={() => setExpandedSection(expandedSection === "competitors" ? null : "competitors")}
      >
        {competitorArray.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No competitors detected yet
          </div>
        ) : (
          <div className="space-y-3">
            {competitorArray.map((competitor) => (
              <div key={competitor.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{competitor.name}</p>
                  <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${competitor.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-lg font-bold text-slate-900">{competitor.percentage}%</p>
                  <p className="text-xs text-slate-500">{competitor.count} leads</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Feature Gaps */}
      <CollapsibleSection
        title="Feature Gaps Analysis"
        icon={TrendingUp}
        expanded={expandedSection === "gaps"}
        onToggle={() => setExpandedSection(expandedSection === "gaps" ? null : "gaps")}
      >
        {featureGaps.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No feature gaps detected
          </div>
        ) : (
          <div className="space-y-3">
            {featureGaps.slice(0, 10).map((gap) => (
              <div
                key={gap.feature}
                className={`p-3 rounded-lg border ${
                  gap.priority === "high"
                    ? "bg-red-50 border-red-200"
                    : gap.priority === "medium"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{gap.feature}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      gap.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : gap.priority === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {gap.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Mentioned by {gap.mentionedBy} leads
                </p>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Switching Cost Analysis */}
      {switchingCostStats && (
        <CollapsibleSection
          title="Switching Cost Analysis"
          icon={AlertTriangle}
          expanded={expandedSection === "switching"}
          onToggle={() => setExpandedSection(expandedSection === "switching" ? null : "switching")}
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{switchingCostStats.lowCost}</p>
              <p className="text-sm text-green-600 mt-1">Low Cost</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-700">{switchingCostStats.mediumCost}</p>
              <p className="text-sm text-amber-600 mt-1">Medium Cost</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{switchingCostStats.highCost}</p>
              <p className="text-sm text-red-600 mt-1">High Cost</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Recommendation:</strong>{" "}
              {switchingCostStats.averageScore < 40
                ? "Most leads have low switching costs - emphasize quick wins and easy migration."
                : switchingCostStats.averageScore < 70
                ? "Mixed switching costs - tailor messaging based on lead's situation."
                : "High switching costs detected - focus on ROI and long-term benefits to justify switching."}
            </p>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: any;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-slate-600" />
          <span className="font-semibold text-slate-900">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {expanded && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}
