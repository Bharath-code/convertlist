"use client";

import { useState } from "react";
import { Rocket, Calendar, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  readinessScore?: number;
  readinessLevel?: 'not_ready' | 'almost_ready' | 'ready' | 'highly_ready';
  recommendedLaunchDate?: Date;
  peakEngagementDay?: string;
  peakEngagementHour?: number;
  season?: string;
  recommendations?: string[];
};

export default function LaunchDayCommandCenter({
  readinessScore = 0,
  readinessLevel = 'not_ready',
  recommendedLaunchDate,
  peakEngagementDay,
  peakEngagementHour,
  season,
  recommendations = [],
}: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const readinessColors = {
    highly_ready: 'bg-green-100 text-green-700 border-green-300',
    ready: 'bg-blue-100 text-blue-700 border-blue-300',
    almost_ready: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    not_ready: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-600">Readiness Score</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{readinessScore}</p>
          <p className="text-xs text-slate-500 mt-1">out of 100</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-600">Launch Date</span>
          </div>
          <p className="text-lg font-bold text-slate-900">
            {recommendedLaunchDate ? recommendedLaunchDate.toLocaleDateString() : 'TBD'}
          </p>
          <p className="text-xs text-slate-500 mt-1">recommended</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-slate-600">Peak Day</span>
          </div>
          <p className="text-lg font-bold text-slate-900">{peakEngagementDay || 'N/A'}</p>
          <p className="text-xs text-slate-500 mt-1">best engagement</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-slate-600">Season</span>
          </div>
          <p className="text-lg font-bold text-slate-900 capitalize">{season || 'N/A'}</p>
          <p className="text-xs text-slate-500 mt-1">current</p>
        </div>
      </div>

      {/* Readiness Status */}
      <CollapsibleSection
        title="Launch Readiness"
        icon={Rocket}
        expanded={expandedSection === "readiness"}
        onToggle={() => setExpandedSection(expandedSection === "readiness" ? null : "readiness")}
      >
        <div className={`p-4 rounded-lg border ${readinessColors[readinessLevel]}`}>
          <p className="font-semibold capitalize">{readinessLevel.replace('_', ' ')}</p>
          <p className="text-sm mt-1">
            Score: {readinessScore}/100
          </p>
        </div>
      </CollapsibleSection>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <CollapsibleSection
          title="Recommendations"
          icon={AlertCircle}
          expanded={expandedSection === "recommendations"}
          onToggle={() => setExpandedSection(expandedSection === "recommendations" ? null : "recommendations")}
        >
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-purple-600 mt-1">•</span>
                <span className="text-slate-700">{rec}</span>
              </li>
            ))}
          </ul>
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
