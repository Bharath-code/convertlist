"use client";

import { useState } from "react";
import { UserPlus, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

type WarmIntroSuggestion = {
  leadId: string;
  leadName: string;
  leadEmail: string;
  suggestedIntroFrom: string;
  reason: string;
  confidence: number;
};

type Props = {
  suggestions?: WarmIntroSuggestion[];
};

export default function WarmIntroSuggestions({ suggestions = [] }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-slate-900">
            Warm Intro Suggestions ({suggestions.length})
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="p-4 pt-0 space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.leadId}
              className="p-3 bg-purple-50 rounded-lg border border-purple-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{suggestion.leadName}</p>
                  <p className="text-sm text-slate-600">{suggestion.leadEmail}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                    <p className="text-sm text-purple-700">
                      Ask for intro from: {suggestion.suggestedIntroFrom}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{suggestion.reason}</p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-lg font-bold text-purple-700">
                    {suggestion.confidence}%
                  </p>
                  <p className="text-xs text-slate-500">confidence</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
