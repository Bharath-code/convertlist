import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/patterns';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "cta" | "secondary";
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  illustration?: React.ReactNode;
}

/**
 * ConvertList Empty State Component
 * 
 * World-class empty state component following the new design system:
 * - Optional custom illustration for visual appeal
 * - Better visual hierarchy with enhanced spacing
 * - Improved typography with indigo theme
 * - Action buttons for user guidance
 * - WCAG AA compliant colors
 * 
 * @example
 * <EmptyState icon={Users} title="No waitlists" description="Upload your first waitlist" action={{ label: "Upload", href: "/upload" }} />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {illustration ? (
        <div className="w-64 h-64 mb-8 opacity-50">
          {illustration}
        </div>
      ) : Icon && (
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-indigo-500" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-indigo-900 mb-2">{title}</h3>
      <p className="text-indigo-600 max-w-md mb-8 leading-relaxed">{description}</p>
      {action && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action.href ? (
            <Link href={action.href}>
              <Button variant={action.variant || "primary"}>
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button variant={action.variant || "primary"} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Link href={secondaryAction.href}>
              <Button variant="secondary">
                {secondaryAction.label}
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states
export function EmptyWaitlist() {
  return (
    <EmptyState
      icon={require('lucide-react').Users}
      title="No waitlists yet"
      description="Upload your first waitlist to start analyzing and converting your leads with AI-powered scoring."
      action={{ label: "Upload your first waitlist", href: "/upload", variant: "cta" }}
    />
  );
}

export function EmptyLeads() {
  return (
    <EmptyState
      icon={require('lucide-react').Mail}
      title="No leads found"
      description="There are no leads in this segment yet. Try adjusting your filters or upload a new waitlist."
    />
  );
}

export function EmptySearch() {
  return (
    <EmptyState
      icon={require('lucide-react').Search}
      title="No results found"
      description="Try adjusting your search terms or filters to find what you're looking for."
    />
  );
}

export function EmptyEnrichment() {
  return (
    <EmptyState
      icon={require('lucide-react').Sparkles}
      title="No enrichment data"
      description="Enrichment data will appear here after processing. Check back once analysis is complete."
    />
  );
}
