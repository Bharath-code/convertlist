"use client";

import { useState, useEffect } from "react";
import { Users, Share2, TrendingUp, Award } from "lucide-react";

interface ReferralTrackingProps {
  waitlistId: string;
}

interface ReferralData {
  totalReferrals: number;
  activeAdvocates: number;
  referralRate: number;
  topAdvocates: Array<{
    id: string;
    name: string;
    email: string;
    referralCount: number;
    conversionRate: number;
  }>;
}

export default function ReferralTracking({ waitlistId }: ReferralTrackingProps) {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Simulate fetching referral data
        const mockData: ReferralData = {
          totalReferrals: 0,
          activeAdvocates: 0,
          referralRate: 0,
          topAdvocates: [],
        };
        setReferralData(mockData);
      } catch (error) {
        console.error("Failed to fetch referral data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [waitlistId]);

  if (loading) {
    return <div className="card p-6">Loading referral tracking data...</div>;
  }

  if (!referralData) {
    return (
      <div className="card p-6">
        <p className="text-slate-500">Referral tracking not yet available.</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Share2 className="w-5 h-5 text-pink-600" />
        <h3 className="text-lg font-bold text-slate-900">Referral Tracking</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-pink-50 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-pink-600" />
            <span className="text-sm text-slate-600">Total Referrals</span>
          </div>
          <div className="text-2xl font-bold text-pink-600">
            {referralData.totalReferrals}
          </div>
        </div>
        <div className="p-4 bg-purple-50 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-slate-600">Active Advocates</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {referralData.activeAdvocates}
          </div>
        </div>
        <div className="p-4 bg-blue-50 rounded">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-slate-600">Referral Rate</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {referralData.referralRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {referralData.topAdvocates.length > 0 ? (
        <div>
          <h4 className="font-medium text-slate-900 mb-3">Top Advocates</h4>
          <div className="space-y-2">
            {referralData.topAdvocates.slice(0, 5).map((advocate, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <div>
                  <div className="font-medium text-slate-900">{advocate.name}</div>
                  <div className="text-xs text-slate-600">{advocate.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">
                    {advocate.referralCount} referrals
                  </div>
                  <div className="text-xs text-slate-500">
                    {advocate.conversionRate.toFixed(0)}% conversion
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Share2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No referral data yet</p>
          <p className="text-xs text-slate-400 mt-2">
            Referrals will be tracked when advocates share your product
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-slate-50 rounded">
        <p className="text-sm text-slate-600">
          <strong>How it works:</strong> Track which advocates are referring others and their conversion rates to identify your most valuable promoters.
        </p>
      </div>
    </div>
  );
}
