import { Flame } from "lucide-react";

interface ViralityBadgeProps {
  score: number | null;
}

export default function ViralityBadge({ score }: ViralityBadgeProps) {
  if (score === null || score === undefined) {
    return null;
  }

  let colorClass = "bg-slate-100 text-slate-700";
  let iconColor = "text-slate-500";

  if (score >= 80) {
    colorClass = "bg-orange-100 text-orange-700";
    iconColor = "text-orange-600";
  } else if (score >= 60) {
    colorClass = "bg-red-100 text-red-700";
    iconColor = "text-red-600";
  } else if (score >= 40) {
    colorClass = "bg-amber-100 text-amber-700";
    iconColor = "text-amber-600";
  }

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      <Flame className={`w-3 h-3 ${iconColor}`} />
      <span>{score}%</span>
    </div>
  );
}
