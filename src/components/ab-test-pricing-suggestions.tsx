"use client";

import { useState } from "react";
import { GitBranch, Scale, Play } from "lucide-react";

interface ABTestPricingSuggestionsProps {
  recommendedPrice: string;
  hotLeadCount: number;
  warmLeadCount: number;
}

export default function ABTestPricingSuggestions({
  recommendedPrice,
  hotLeadCount,
  warmLeadCount,
}: ABTestPricingSuggestionsProps) {
  const [testVariantA, setTestVariantA] = useState(recommendedPrice);
  const [testVariantB, setTestVariantB] = useState("");
  const [trafficSplit, setTrafficSplit] = useState(50);

  const parsePrice = (priceStr: string): number => {
    const match = priceStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const priceA = parsePrice(testVariantA);
  const priceB = parsePrice(testVariantB);

  const generateSuggestions = () => {
    const basePrice = parsePrice(recommendedPrice);
    return [
      { label: `${basePrice - 10}`, value: `${basePrice - 10}` },
      { label: `${basePrice}`, value: `${basePrice}` },
      { label: `${basePrice + 10}`, value: `${basePrice + 10}` },
      { label: `${basePrice + 20}`, value: `${basePrice + 20}` },
    ];
  };

  const suggestions = generateSuggestions();

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <GitBranch className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-slate-900">A/B Test Pricing Suggestions</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Variant A Price ($)
            </label>
            <select
              value={testVariantA}
              onChange={(e) => setTestVariantA(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {suggestions.map((suggestion) => (
                <option key={suggestion.value} value={suggestion.value}>
                  ${suggestion.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Variant B Price ($)
            </label>
            <select
              value={testVariantB}
              onChange={(e) => setTestVariantB(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a price</option>
              {suggestions.map((suggestion) => (
                <option key={suggestion.value} value={suggestion.value}>
                  ${suggestion.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Traffic Split ({trafficSplit}%/{100 - trafficSplit}%)
          </label>
          <input
            type="range"
            min="10"
            max="90"
            step="10"
            value={trafficSplit}
            onChange={(e) => setTrafficSplit(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {testVariantB ? (
        <div className="p-4 bg-indigo-50 rounded mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-slate-900">Test Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Variant A:</span>
              <span className="font-medium text-slate-900 ml-2">${priceA}</span>
            </div>
            <div>
              <span className="text-slate-600">Variant B:</span>
              <span className="font-medium text-slate-900 ml-2">${priceB}</span>
            </div>
            <div>
              <span className="text-slate-600">Difference:</span>
              <span className="font-medium text-slate-900 ml-2">${Math.abs(priceA - priceB)}</span>
            </div>
            <div>
              <span className="text-slate-600">Duration:</span>
              <span className="font-medium text-slate-900 ml-2">7 days</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded mb-4 text-sm text-slate-600">
          Select both Variant A and Variant B prices to see test summary
        </div>
      )}

      <button
        disabled={!testVariantB}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Play className="w-4 h-4" />
        Launch A/B Test
      </button>

      <div className="mt-4 p-3 bg-slate-50 rounded">
        <p className="text-sm text-slate-600">
          <strong>Recommendation:</strong> Test prices within ±$20 of the recommended price to find the optimal conversion rate without alienating your audience.
        </p>
      </div>
    </div>
  );
}
