import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cta" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * ConvertList Button Component
 * 
 * World-class button component following the new design system:
 * - Primary: Main CTAs with indigo-500 background
 * - Secondary: Secondary actions with white background
 * - CTA: Conversion-focused with emerald-500 background
 * - Ghost: Subtle buttons without background
 * - Destructive: Destructive actions with red-500 background
 * 
 * Features:
 * - Enhanced hover states with shadow and translate
 * - Active state feedback
 * - Loading state with spinner
 * - WCAG AA compliant colors
 * - Smooth transitions (300ms)
 * - cursor-pointer for better UX
 * 
 * @example
 * <Button variant="primary" size="lg">Sign Up</Button>
 * <Button variant="secondary" size="md">Cancel</Button>
 * <Button variant="cta" size="lg">Get Started Free</Button>
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
  const baseStyles = "font-medium transition-all duration-300 cursor-pointer";
  
  const variantStyles = {
    primary: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
    secondary: "bg-white text-indigo-900 border border-indigo-200 hover:border-indigo-300 shadow-sm hover:shadow-md",
    cta: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
    ghost: "bg-transparent text-indigo-600 hover:bg-indigo-50",
    destructive: "bg-red-500 hover:bg-red-600 text-white",
  };
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-lg",
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
