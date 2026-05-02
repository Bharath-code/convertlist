'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { LeadScoreBadge } from './lead-score-badge';
import { BulkActionsToolbar } from './bulk-actions-toolbar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Lead {
  id: string;
  email: string;
  name?: string | null;
  company?: string | null;
  score?: number | null;
  reason?: string | null;
  status: string;
  segment?: 'HOT' | 'WARM' | 'COLD' | null;
  source?: string | null;
  signupNote?: string | null;
}

interface LeadsTableProps {
  leads: Lead[];
  onBulkAction?: (action: string, leadIds: string[]) => Promise<void>;
  onLeadSelect?: (lead: Lead) => void;
  onStatusChange?: (leadId: string, status: string) => Promise<void>;
  className?: string;
}

const statusColors: Record<string, string> = {
  UNCONTACTED: 'bg-slate-100 text-slate-600',
  CONTACTED: 'bg-blue-100 text-blue-700',
  REPLIED: 'bg-emerald-100 text-emerald-700',
  INTERESTED: 'bg-purple-100 text-purple-700',
  PAID: 'bg-amber-100 text-amber-700',
};

const segmentIcons: Record<string, string> = {
  HOT: '🔥',
  WARM: '☀️',
  COLD: '❄️',
};

export function LeadsTable({
  leads,
  onBulkAction,
  onLeadSelect,
  onStatusChange,
  className,
}: LeadsTableProps) {
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Lead;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(['email', 'company', 'score', 'status', 'segment'])
  );

  const handleSelectionChange = useCallback((newSelection: Set<string>) => {
    setSelectedLeadIds(newSelection);
  }, []);

  const handleSort = useCallback((key: keyof Lead) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const sortedLeads = useMemo(() => {
    if (!sortConfig) return leads;

    return [...leads].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });
  }, [leads, sortConfig]);

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(column)) {
        next.delete(column);
      } else {
        next.add(column);
      }
      return next;
    });
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Toolbar */}
      {onBulkAction && (
        <BulkActionsToolbar
          leads={leads}
          onBulkAction={onBulkAction}
          selectedLeadIds={selectedLeadIds}
          onSelectionChange={handleSelectionChange}
        />
      )}

      {/* Column Toggle */}
      <div className="flex items-center justify-end gap-2 py-3">
        <span className="text-xs text-gray-500 mr-2">Columns:</span>
        {['company', 'source', 'signupNote'].map((col) => (
          <button
            key={col}
            onClick={() => toggleColumn(col)}
            className={cn(
              'text-xs px-2 py-1 rounded border transition-colors',
              visibleColumns.has(col)
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            )}
          >
            {col === 'signupNote' ? 'Notes' : col.charAt(0).toUpperCase() + col.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {onBulkAction && (
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={selectedLeadIds.size === leads.length && leads.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedLeadIds(new Set(leads.map((l) => l.id)));
                      } else {
                        setSelectedLeadIds(new Set());
                      }
                    }}
                  />
                </th>
              )}
              <SortableHeader
                label="Email"
                isActive={sortConfig?.key === 'email'}
                direction={sortConfig?.key === 'email' ? sortConfig.direction : undefined}
                onSort={() => handleSort('email')}
              />
              {visibleColumns.has('company') && (
                <SortableHeader
                  label="Company"
                  isActive={sortConfig?.key === 'company'}
                  direction={sortConfig?.key === 'company' ? sortConfig.direction : undefined}
                  onSort={() => handleSort('company')}
                />
              )}
              <SortableHeader
                label="Score"
                isActive={sortConfig?.key === 'score'}
                direction={sortConfig?.key === 'score' ? sortConfig.direction : undefined}
                onSort={() => handleSort('score')}
                align="right"
              />
              {visibleColumns.has('segment') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Segment
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              {visibleColumns.has('source') && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Source
                </th>
              )}
              <th className="w-16 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedLeads.map((lead, index) => (
              <tr
                key={lead.id}
                className={cn(
                  'transition-colors hover:bg-gray-50 cursor-pointer',
                  selectedLeadIds.has(lead.id) && 'bg-blue-50 hover:bg-blue-50'
                )}
                onClick={() => onLeadSelect?.(lead)}
              >
                {onBulkAction && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedLeadIds.has(lead.id)}
                      onCheckedChange={() => {
                        const newSelected = new Set(selectedLeadIds);
                        if (newSelected.has(lead.id)) {
                          newSelected.delete(lead.id);
                        } else {
                          newSelected.add(lead.id);
                        }
                        setSelectedLeadIds(newSelected);
                      }}
                    />
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {(lead.name || lead.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {lead.name || lead.email}
                      </div>
                      {lead.name && (
                        <div className="text-sm text-gray-500 truncate">{lead.email}</div>
                      )}
                    </div>
                  </div>
                </td>
                {visibleColumns.has('company') && (
                  <td className="px-4 py-3">
                    {lead.company ? (
                      <div className="text-sm text-gray-900">{lead.company}</div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <LeadScoreBadge
                    score={lead.score ?? null}
                    reason={lead.reason}
                    size="sm"
                  />
                </td>
                {visibleColumns.has('segment') && (
                  <td className="px-4 py-3">
                    {lead.segment && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-sm',
                          lead.segment === 'HOT' && 'bg-red-100 text-red-700',
                          lead.segment === 'WARM' && 'bg-amber-100 text-amber-700',
                          lead.segment === 'COLD' && 'bg-blue-100 text-blue-700'
                        )}
                      >
                        <span className="mr-1">{segmentIcons[lead.segment]}</span>
                        {lead.segment}
                      </Badge>
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  <Badge
                    variant="secondary"
                    className={cn('text-sm', statusColors[lead.status] || statusColors.UNCONTACTED)}
                  >
                    {lead.status.replace('_', ' ')}
                  </Badge>
                </td>
                {visibleColumns.has('source') && (
                  <td className="px-4 py-3">
                    {lead.source ? (
                      <div className="text-sm text-gray-600">{lead.source}</div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onStatusChange?.(lead.id, 'CONTACTED')}
                      >
                        Mark as Contacted
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange?.(lead.id, 'REPLIED')}
                      >
                        Mark as Replied
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onStatusChange?.(lead.id, 'INTERESTED')}
                      >
                        Mark as Interested
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No leads found</h3>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or upload more leads
          </p>
        </div>
      )}
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  isActive: boolean;
  direction?: 'asc' | 'desc';
  onSort: () => void;
  align?: 'left' | 'right' | 'center';
}

function SortableHeader({
  label,
  isActive,
  direction,
  onSort,
  align = 'left',
}: SortableHeaderProps) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center'
      )}
      onClick={onSort}
    >
      <div className={cn('flex items-center gap-1', align === 'right' && 'justify-end')}>
        {label}
        {isActive && (
          <svg
            className={cn(
              'w-3 h-3 transition-transform',
              direction === 'desc' && 'rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        )}
      </div>
    </th>
  );
}
