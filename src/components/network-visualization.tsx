"use client";

import { useState } from "react";
import { Network, Users2, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

type NetworkNode = {
  id: string;
  email: string;
  name?: string | null;
  influenceScore: number;
  connections: string[];
};

type NetworkEdge = {
  source: string;
  target: string;
  type: 'company' | 'community' | 'other';
};

type Props = {
  nodes?: NetworkNode[];
  edges?: NetworkEdge[];
  topInfluencers?: Array<{ email: string; score: number }>;
  averageInfluenceScore?: number;
};

export default function NetworkVisualization({
  nodes = [],
  edges = [],
  topInfluencers = [],
  averageInfluenceScore = 0,
}: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Network className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-600">Network Size</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{nodes.length}</p>
          <p className="text-xs text-slate-500 mt-1">leads in network</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users2 className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-600">Connections</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{edges.length}</p>
          <p className="text-xs text-slate-500 mt-1">total relationships</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-slate-600">Avg Influence</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{averageInfluenceScore}</p>
          <p className="text-xs text-slate-500 mt-1">score (0-100)</p>
        </div>
      </div>

      {/* Top Influencers */}
      <CollapsibleSection
        title="Top Influencers"
        icon={TrendingUp}
        expanded={expandedSection === "influencers"}
        onToggle={() => setExpandedSection(expandedSection === "influencers" ? null : "influencers")}
      >
        {topInfluencers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No influencers identified yet
          </div>
        ) : (
          <div className="space-y-3">
            {topInfluencers.slice(0, 10).map((influencer, index) => (
              <div
                key={influencer.email}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-slate-900">{influencer.email}</p>
                    <p className="text-xs text-slate-500">{influencer.email.split('@')[0]}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{influencer.score}</p>
                  <p className="text-xs text-slate-500">influence score</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Network Graph (Simplified) */}
      <CollapsibleSection
        title="Network Graph"
        icon={Network}
        expanded={expandedSection === "graph"}
        onToggle={() => setExpandedSection(expandedSection === "graph" ? null : "graph")}
      >
        <div className="p-4 bg-slate-50 rounded-lg min-h-[300px] flex items-center justify-center">
          {nodes.length === 0 ? (
            <div className="text-center text-slate-500">
              <Network className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No network data available</p>
            </div>
          ) : (
            <div className="text-center text-slate-500">
              <Network className="w-12 h-12 mx-auto mb-2 text-blue-600" />
              <p className="font-medium text-slate-900">Network Visualization</p>
              <p className="text-sm mt-1">
                {nodes.length} nodes, {edges.length} connections
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Full graph visualization requires additional library integration
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Connection Types */}
      {edges.length > 0 && (
        <CollapsibleSection
          title="Connection Types"
          icon={Users2}
          expanded={expandedSection === "connections"}
          onToggle={() => setExpandedSection(expandedSection === "connections" ? null : "connections")}
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">
                {edges.filter(e => e.type === 'company').length}
              </p>
              <p className="text-sm text-blue-600 mt-1">Company</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">
                {edges.filter(e => e.type === 'community').length}
              </p>
              <p className="text-sm text-purple-600 mt-1">Community</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-700">
                {edges.filter(e => e.type === 'other').length}
              </p>
              <p className="text-sm text-slate-600 mt-1">Other</p>
            </div>
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
