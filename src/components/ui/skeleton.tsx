import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerItemVariants, transitionPresets } from "@/lib/animations";

/**
 * ConvertList Skeleton Component
 * 
 * World-class skeleton loading component following the new design system:
 * - Indigo theme colors for consistency
 * - Smooth pulse animation
 * - Pre-configured variants for common use cases
 * - WCAG AA compliant colors
 * 
 * @example
 * <Skeleton className="h-4 w-32" />
 * <LeadCardSkeleton />
 * <StatsCardSkeleton />
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-indigo-100", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-white border border-indigo-100">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function LeadCardSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-white border border-indigo-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-white border border-indigo-100">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          variants={staggerItemVariants}
          initial="initial"
          animate="animate"
          transition={{ ...transitionPresets.default, delay: i * 0.05 }}
          className="flex items-center gap-4 p-4 rounded-lg bg-white border border-indigo-100"
        >
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-24 rounded" />
        </motion.div>
      ))}
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          variants={staggerItemVariants}
          initial="initial"
          animate="animate"
          transition={{ ...transitionPresets.default, delay: i * 0.05 }}
        >
          <Skeleton className="h-16 w-full" />
        </motion.div>
      ))}
    </div>
  );
}
