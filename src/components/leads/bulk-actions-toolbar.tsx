'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LeadScoreBadge } from './lead-score-badge';

interface Lead {
  id: string;
  email: string;
  name?: string | null;
  company?: string | null;
  score?: number | null;
  reason?: string | null;
  status: string;
}

interface BulkActionsToolbarProps {
  leads: Lead[];
  onBulkAction: (action: string, leadIds: string[]) => Promise<void>;
  selectedLeadIds: Set<string>;
  onSelectionChange: (leadIds: Set<string>) => void;
}

export function BulkActionsToolbar({
  leads,
  onBulkAction,
  selectedLeadIds,
  onSelectionChange,
}: BulkActionsToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const selectedCount = selectedLeadIds.size;
  const allSelected = leads.length > 0 && selectedCount === leads.length;
  const someSelected = selectedCount > 0 && selectedCount < leads.length;

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        onSelectionChange(new Set(leads.map((lead) => lead.id)));
      } else {
        onSelectionChange(new Set());
      }
    },
    [leads, onSelectionChange]
  );

  const handleBulkAction = useCallback(
    async (action: string) => {
      if (selectedCount === 0) return;

      setIsProcessing(true);
      try {
        await onBulkAction(action, Array.from(selectedLeadIds));
        onSelectionChange(new Set());
      } catch (error) {
        console.error(`Bulk action ${action} failed:`, error);
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedCount, selectedLeadIds, onBulkAction, onSelectionChange]
  );

  if (selectedCount === 0) {
    return (
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            aria-label="Select all leads"
          />
          <span className="text-sm text-gray-500">
            {leads.length} lead{leads.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Actions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 bg-blue-50/50 px-4 -mx-4">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          aria-label="Select all leads"
        />
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {selectedCount} selected
        </Badge>
        {someSelected && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-blue-600 hover:text-blue-700"
            onClick={() => handleSelectAll(true)}
          >
            Select all {leads.length}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="sm"
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => handleBulkAction('approve')}
              disabled={isProcessing}
              className="gap-2"
            >
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleBulkAction('reject')}
              disabled={isProcessing}
              className="gap-2"
            >
              <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleBulkAction('enrich')}
              disabled={isProcessing}
              className="gap-2"
            >
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Enrich Data
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleBulkAction('sequence')}
              disabled={isProcessing}
              className="gap-2"
            >
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Add to Sequence
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectionChange(new Set())}
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
