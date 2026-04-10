"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Target, Calculator } from "lucide-react";

interface PricingData {
  recommendedPricePoint: string | null;
  priceConfidence: number | null;
  willingnessToPayScore: number | null;
  discountStrategy: string | null;
}

interface PricingIntelligenceDashboardProps {
  waitlistId: string;
}

export default function PricingIntelligenceDashboard({ waitlistId }: PricingIntelligenceDashboardProps) {
  const [data, setData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/waitlist/${waitlistId}/pricing`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch pricing data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [waitlistId]);

  if (loading) {
    return <div className="card p-6">Loading pricing intelligence data...</div>;
  }

  if (!data || !data.recommendedPricePoint) {
    return (
      <div className="card p-6">
        <p className="text-slate-500">
          Pricing analysis not yet available. Run the analysis to see recommendations.
        </p>
      </div>
    );
  }

  const confidenceLevel = data.priceConfidence ? (data.priceConfidence * 100).toFixed(0) : "0";

  return (
    <div className="space-y-6">
      {/* Recommended Price */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Recommended Price Point</h3>
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
        <div className="text-4xl font-bold text-green-600 mb-2">
          {data.recommendedPricePoint}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <TrendingUp className="w-4 h-4" />
          <span>{confidenceLevel}% confidence based on lead quality</span>
        </div>
      </div>

      {/* Willingness to Pay Score */}
      {data.willingnessToPayScore !== null && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Willingness to Pay</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-slate-900">
              {(data.willingnessToPayScore * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-slate-600">
              Average willingness to pay across all leads
            </div>
          </div>
        </div>
      )}

      {/* Discount Strategy */}
      {data.discountStrategy && (
        <div className="card p-6 border-2 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3 mb-3">
            <Calculator className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-slate-900">Discount Strategy</h3>
          </div>
          <p className="text-slate-700">{data.discountStrategy}</p>
        </div>
      )}

      {/* Revenue Projection Calculator */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-slate-900">Revenue Projection</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <span className="text-sm text-slate-600">At {data.recommendedPricePoint}</span>
            <span className="font-medium text-slate-900">
              Calculate based on lead count
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Revenue projections will be available after tier analysis is complete
          </p>
        </div>
      </div>
    </div>
  );
}
