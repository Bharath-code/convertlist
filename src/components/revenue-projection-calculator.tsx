"use client";

import { useState } from "react";
import { Calculator, TrendingUp, DollarSign } from "lucide-react";

interface RevenueProjectionCalculatorProps {
  hotLeadCount: number;
  warmLeadCount: number;
  coldLeadCount: number;
  recommendedPrice: string;
}

export default function RevenueProjectionCalculator({
  hotLeadCount,
  warmLeadCount,
  coldLeadCount,
  recommendedPrice,
}: RevenueProjectionCalculatorProps) {
  const [customPrice, setCustomPrice] = useState(recommendedPrice);
  const [hotConversionRate, setHotConversionRate] = useState(50);
  const [warmConversionRate, setWarmConversionRate] = useState(25);
  const [coldConversionRate, setColdConversionRate] = useState(10);

  const parsePrice = (priceStr: string): number => {
    const match = priceStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const price = parsePrice(customPrice);

  const hotRevenue = Math.round(hotLeadCount * (hotConversionRate / 100) * price);
  const warmRevenue = Math.round(warmLeadCount * (warmConversionRate / 100) * price);
  const coldRevenue = Math.round(coldLeadCount * (coldConversionRate / 100) * price);
  const totalRevenue = hotRevenue + warmRevenue + coldRevenue;

  const totalConversions = Math.round(
    hotLeadCount * (hotConversionRate / 100) +
    warmLeadCount * (warmConversionRate / 100) +
    coldLeadCount * (coldConversionRate / 100)
  );

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-bold text-slate-900">Revenue Projection Calculator</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Price Point ($)
          </label>
          <input
            type="text"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Hot Conversion (%)
            </label>
            <input
              type="number"
              value={hotConversionRate}
              onChange={(e) => setHotConversionRate(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Warm Conversion (%)
            </label>
            <input
              type="number"
              value={warmConversionRate}
              onChange={(e) => setWarmConversionRate(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cold Conversion (%)
            </label>
            <input
              type="number"
              value={coldConversionRate}
              onChange={(e) => setColdConversionRate(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-green-50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-slate-600">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-slate-600">Conversions</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {totalConversions}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Hot Leads Revenue</span>
            <span className="font-medium text-slate-900">${hotRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Warm Leads Revenue</span>
            <span className="font-medium text-slate-900">${warmRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Cold Leads Revenue</span>
            <span className="font-medium text-slate-900">${coldRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
