import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface LaunchRecommendationProps {
  readinessScore: number;
  hotLeadCount: number;
  warmLeadCount: number;
  coldLeadCount: number;
}

export default function LaunchRecommendation({
  readinessScore,
  hotLeadCount,
  warmLeadCount,
  coldLeadCount,
}: LaunchRecommendationProps) {
  let recommendation: "Launch Now" | "Launch Soon" | "Wait & Nurture";
  let icon: React.ReactNode;
  let colorClass: string;
  let bgColorClass: string;
  let reasoning: string;

  if (readinessScore >= 80) {
    recommendation = "Launch Now";
    icon = <CheckCircle className="w-6 h-6" />;
    colorClass = "text-green-600";
    bgColorClass = "bg-green-50 border-green-200";
    reasoning = `Excellent readiness with ${hotLeadCount} hot leads ready to convert. Launch now for maximum impact.`;
  } else if (readinessScore >= 60) {
    recommendation = "Launch Soon";
    icon = <Clock className="w-6 h-6" />;
    colorClass = "text-amber-600";
    bgColorClass = "bg-amber-50 border-amber-200";
    reasoning = `Good readiness with ${hotLeadCount} hot leads and ${warmLeadCount} warm leads. Consider launching within 1-2 weeks.`;
  } else {
    recommendation = "Wait & Nurture";
    icon = <AlertTriangle className="w-6 h-6" />;
    colorClass = "text-red-600";
    bgColorClass = "bg-red-50 border-red-200";
    reasoning = `Low readiness with ${coldLeadCount} cold leads. Focus on nurturing before launching.`;
  }

  return (
    <div className={`card p-6 border-2 ${bgColorClass}`}>
      <div className="flex items-start gap-4">
        <div className={`${colorClass} mt-1`}>{icon}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{recommendation}</h3>
          <p className="text-slate-700 mb-4">{reasoning}</p>
          
          <div className="grid grid-cols-3 gap-4 p-4 bg-white/50 rounded">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{hotLeadCount}</div>
              <div className="text-xs text-slate-600">Hot Leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{warmLeadCount}</div>
              <div className="text-xs text-slate-600">Warm Leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{coldLeadCount}</div>
              <div className="text-xs text-slate-600">Cold Leads</div>
            </div>
          </div>

          {recommendation === "Wait & Nurture" && (
            <div className="mt-4 p-3 bg-white/70 rounded">
              <p className="text-sm text-slate-600">
                <strong>Suggested actions:</strong> Send nurture emails to cold leads, run a referral campaign, or offer early bird discounts to warm up your audience.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
