import { Input as ShadcnInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: "default" | "error" | "success";
  inputSize?: "sm" | "md" | "lg";
}

/**
 * ConvertList Input Component
 * 
 * Follows design system input patterns:
 * - Default: Standard input with subtle border
 * - Error: Input with red border for validation errors
 * - Success: Input with green border for successful validation
 * 
 * @example
 * <Input variant="default" inputSize="md" placeholder="Email" />
 * <Input variant="error" inputSize="md" placeholder="Email" />
 * <Input variant="success" inputSize="md" placeholder="Email" />
 */
export function Input({
  variant = "default",
  inputSize = "md",
  className,
  ...props
}: InputProps) {
  const variantStyles = {
    default: "border-slate-200 focus:border-slate-400 focus:ring-slate-200",
    error: "border-red-300 focus:border-red-500 focus:ring-red-200",
    success: "border-green-300 focus:border-green-500 focus:ring-green-200",
  };
  
  const sizeStyles = {
    sm: "px-3 py-2 text-sm rounded-lg",
    md: "px-4 py-3 text-base rounded-xl",
    lg: "px-6 py-4 text-lg rounded-xl",
  };
  
  return (
    <ShadcnInput
      className={cn(
        "w-full transition-all duration-200 outline-none focus:ring-2",
        variantStyles[variant],
        sizeStyles[inputSize],
        className
      )}
      {...props}
    />
  );
}
