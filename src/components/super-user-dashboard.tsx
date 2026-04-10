"use client";

import { useState } from "react";
import { Crown, Star, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

type SuperUser = {
  id: string;
  email: string;
  superUserScore: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  totalProducts: number;
  predictedLTV: number;
  earlyAdopterScore: number;
};

type Props = {
  superUsers?: SuperUser[];
  tierDistribution?: Record<string, number>;
  averageLTV?: number;
};

export default function SuperUserDashboard({
  superUsers = [],
  tierDistribution = { diamond: 0, platinum: 0, gold: 0, silver: 0, bronze: 0 },
  averageLTV = 0,
}: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const tierColors = {
    diamond: 'bg-purple-100 text-purple-700 border-purple-300',
    platinum: 'bg-slate-100 text-slate-700 border-slate-300',
    gold: 'bg-amber-100 text-amber-700 border-amber-300',
    silver: 'bg-gray-100 text-gray-700 border-gray-300',
    bronze: 'bg-orange-100 text-orange-700 border-orange-300',
  };

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-600">Super-Users</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{superUsers.length}</p>
          <p className="text-xs text-slate-500 mt-1">total identified</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-slate-600">Avg Score</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {superUsers.length > 0 
              ? Math.round(superUsers.reduce((sum, u) => sum + u.superUserScore, 0) / superUsers.length)
              : 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">out of 100</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-slate-600">Avg LTV</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">${averageLTV}</p>
          <p className="text-xs text-slate-500 mt-1">predicted value</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-600">Diamond Tier</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{tierDistribution.diamond}</p>
          <p className="text-xs text-slate-500 mt-1">elite users</p>
        </div>
      </div>

      {/* Tier Distribution */}
      <CollapsibleSection
        title="Tier Distribution"
        icon={Crown}
        expanded={expandedSection === "tiers"}
        onToggle={() => setExpandedSection(expandedSection === "tiers" ? null : "tiers")}
      >
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(tierDistribution).map(([tier, count]) => (
            <div
              key={tier}
              className={`text-center p-3 rounded-lg border ${tierColors[tier as keyof typeof tierColors]}`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs capitalize">{tier}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Top Super-Users */}
      <CollapsibleSection
        title="Top Super-Users"
        icon={Star}
        expanded={expandedSection === "users"}
        onToggle={() => setExpandedSection(expandedSection === "users" ? null : "users")}
      >
        {superUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No super-users identified yet
          </div>
        ) : (
          <div className="space-y-3">
            {superUsers.slice(0, 20).map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-slate-900">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded border ${tierColors[user.tier]}`}>
                        {user.tier}
                      </span>
                      <span className="text-xs text-slate-500">{user.totalProducts} products</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">{user.superUserScore}</p>
                  <p className="text-xs text-slate-500">${user.predictedLTV} LTV</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>
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
