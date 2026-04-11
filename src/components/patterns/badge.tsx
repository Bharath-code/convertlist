import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

/**
 * ConvertList Badge Component
 * 
 * Follows design system badge patterns:
 * - Default: Neutral gray badge
 * - Primary: Dark slate badge for emphasis
 * - Success: Green badge for positive status
 * - Warning: Amber badge for caution
 * - Error: Red badge for negative status
 * - Info: Blue badge for informational content
 * 
 * @example
 * <Badge variant="default">Default</Badge>
 * <Badge variant="success">Success</Badge>
 * <Badge variant="error">Error</Badge>
 */
export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-slate-900 text-white border-slate-800",
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    error: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
  };
  
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };
  
  return (
    <ShadcnBadge
      className={cn(
        "inline-flex items-center font-medium border rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </ShadcnBadge>
  );
}
