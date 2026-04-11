import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * ConvertList Button Component
 * 
 * Follows design system button patterns:
 * - Primary: Main CTAs with slate-900 background
 * - Secondary: Secondary actions with white background
 * - Outline: Bordered buttons
 * - Ghost: Subtle buttons without background
 * 
 * @example
 * <Button variant="primary" size="lg">Sign Up</Button>
 * <Button variant="secondary" size="md">Cancel</Button>
 * <Button variant="primary" size="lg" loading>Processing...</Button>
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "font-medium transition-all duration-300";
  
  const variantStyles = {
    primary: "bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md",
    outline: "bg-transparent border-2 border-slate-900 text-slate-900 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100",
  };
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-xl",
  };
  
  return (
    <ShadcnButton
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-lg",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </ShadcnButton>
  );
}
