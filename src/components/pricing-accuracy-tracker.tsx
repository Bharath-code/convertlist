"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Target, CheckCircle } from "lucide-react";

interface PricingAccuracyTrackerProps {
  waitlistId: string;
}

interface Prediction {
  id: string;
  predictedPrice: string;
  actualPrice: string | null;
  accuracy: number | null;
  status: "pending" | "accurate" | "inaccurate";
}

export default function PricingAccuracyTracker({ waitlistId }: PricingAccuracyTrackerProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    // Simulate fetching prediction history
    const mockPredictions: Prediction[] = [];
    setPredictions(mockPredictions);
  }, [waitlistId]);

  const overallAccuracy = predictions.length > 0
    ? predictions.reduce((sum, p) => sum + (p.accuracy || 0), 0) / predictions.length
    : 0;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-bold text-slate-900">Pricing Prediction Accuracy</h3>
      </div>

      {predictions.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No pricing predictions recorded yet</p>
          <p className="text-xs text-slate-400 mt-2">
            Accuracy tracking will begin after your first pricing decision
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-slate-600">Overall Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {overallAccuracy.toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-slate-600">Predictions</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {predictions.length}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="p-4 bg-slate-50 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      Predicted: {prediction.predictedPrice}
                    </div>
                    <div className="text-xs text-slate-600">
                      {prediction.actualPrice
                        ? `Actual: ${prediction.actualPrice}`
                        : "Pending decision"}
                    </div>
                  </div>
                  <div className="text-right">
                    {prediction.accuracy !== null ? (
                      <span className="text-sm font-medium text-slate-900">
                        {prediction.accuracy.toFixed(1)}% accurate
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Awaiting decision</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-4 p-3 bg-slate-50 rounded">
        <p className="text-sm text-slate-600">
          <strong>How it works:</strong> After each pricing decision, we compare the predicted optimal price with your actual price to improve future recommendations.
        </p>
      </div>
    </div>
  );
}
