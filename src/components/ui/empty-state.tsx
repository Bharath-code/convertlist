import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="card text-center py-12">
      {Icon && (
        <Icon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      )}
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action.href ? (
            <Link href={action.href} className="btn-primary">
              {action.label}
            </Link>
          ) : (
            <button onClick={action.onClick} className="btn-primary">
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <Link href={secondaryAction.href} className="btn-secondary">
              {secondaryAction.label}
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
      description="Upload your first waitlist to start analyzing and converting your leads."
      action={{ label: "Upload your first waitlist", href: "/upload" }}
    />
  );
}

export function EmptyLeads() {
  return (
    <EmptyState
      icon={require('lucide-react').Mail}
      title="No leads found"
      description="There are no leads in this segment yet."
    />
  );
}

export function EmptySearch() {
  return (
    <EmptyState
      icon={require('lucide-react').Search}
      title="No results found"
      description="Try adjusting your search terms or filters."
    />
  );
}

export function EmptyEnrichment() {
  return (
    <EmptyState
      icon={require('lucide-react').Sparkles}
      title="No enrichment data"
      description="Enrichment data will appear here after processing."
    />
  );
}
