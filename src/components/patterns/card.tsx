import { Card as ShadcnCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "featured" | "elevated";
  children: React.ReactNode;
  noPadding?: boolean;
}

/**
 * ConvertList Card Component
 * 
 * Follows design system card patterns:
 * - Default: Standard white card with subtle border
 * - Featured: Dark gradient card for emphasis
 * - Elevated: Card with more shadow for prominence
 * 
 * @example
 * <Card variant="default">Content</Card>
 * <Card variant="featured">Featured content</Card>
 * <Card variant="elevated">Elevated content</Card>
 * <Card variant="default" noPadding>Content without default padding</Card>
 */
export function Card({
  variant = "default",
  className,
  children,
  noPadding = false,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
    featured: "bg-gradient-to-br from-slate-900 to-slate-800 text-white border-2 border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl",
    elevated: "bg-white rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
  };
  
  return (
    <ShadcnCard
      className={cn(variantStyles[variant], noPadding ? "" : "p-8", className)}
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
    <h3 className={cn("text-xl font-bold leading-none", className)} {...props} />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-slate-600", className)} {...props} />
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
