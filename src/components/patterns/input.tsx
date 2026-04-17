import { Input as ShadcnInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: "default" | "error" | "success";
  inputSize?: "sm" | "md" | "lg";
  label?: string;
  helperText?: string;
  error?: string;
}

/**
 * ConvertList Input Component
 * 
 * World-class input component following the new design system:
 * - Default: Standard input with indigo border
 * - Error: Input with red border for validation errors
 * - Success: Input with emerald border for successful validation
 * 
 * Features:
 * - Enhanced focus ring (4px) for accessibility
 * - Label integration for form semantics
 * - Helper text for guidance
 * - Error message display
 * - WCAG AA compliant colors
 * - Consistent rounded-lg (8px)
 * 
 * @example
 * <Input label="Email" placeholder="john@example.com" />
 * <Input label="Email" error="Invalid email format" />
 * <Input label="Password" helperText="Minimum 8 characters" />
 */
export function Input({
  variant = "default",
  inputSize = "md",
  label,
  helperText,
  error,
  className,
  ...props
}: InputProps) {
  const variantStyles = error
    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
    : variant === "success"
    ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20"
    : "border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500/20";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-4 py-3 text-base rounded-lg",
    lg: "px-6 py-4 text-lg rounded-lg",
  };
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-indigo-900">
          {label}
        </label>
      )}
      <ShadcnInput
        className={cn(
          "w-full transition-all duration-200 outline-none focus:ring-4",
          variantStyles,
          sizeStyles[inputSize],
          className
        )}
        {...props}
      />
      {(helperText || error) && (
        <p className={cn(
          "text-xs",
          error ? "text-red-600" : "text-indigo-600"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
