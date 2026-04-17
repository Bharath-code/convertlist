import { Card as ShadcnCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "featured" | "glass";
  hoverable?: boolean;
  children: React.ReactNode;
  noPadding?: boolean;
}

/**
 * ConvertList Card Component
 * 
 * World-class card component following the new design system:
 * - Default: Standard white card with indigo border
 * - Elevated: Card with medium shadow for prominence
 * - Featured: Indigo gradient card for emphasis
 * - Glass: Glass morphism with backdrop blur
 * 
 * Features:
 * - Optional hover behavior with shadow and translate
 * - Consistent rounded-xl (12px) for modern feel
 * - Better shadow hierarchy (sm, md, lg, xl, 2xl)
 * - Smooth transitions (300ms)
 * - WCAG AA compliant colors
 * 
 * @example
 * <Card variant="default">Content</Card>
 * <Card variant="featured">Featured content</Card>
 * <Card variant="glass" hoverable>Interactive card</Card>
 * <Card variant="default" noPadding>Content without padding</Card>
 */
export function Card({
  variant = "default",
  hoverable = true,
  className,
  children,
  noPadding = false,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-white rounded-xl border border-indigo-100 shadow-sm",
    elevated: "bg-white rounded-xl border border-indigo-100 shadow-md",
    featured: "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-xl",
    glass: "bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-sm",
  };
  
  const hoverStyles = hoverable 
    ? "hover:shadow-lg hover:-translate-y-1 transition-all duration-300" 
    : "";
  
  return (
    <ShadcnCard
      className={cn(
        variantStyles[variant],
        hoverStyles,
        noPadding ? "" : "p-6",
        className
      )}
      {...props}
    >
      {children}
    </ShadcnCard>
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 mb-6", className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-xl font-bold leading-none text-indigo-900", className)} {...props} />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-indigo-600", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center pt-6 mt-auto", className)} {...props} />
  );
}
