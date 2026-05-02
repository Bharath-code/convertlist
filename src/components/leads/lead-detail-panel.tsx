'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { LeadScoreBadge } from './lead-score-badge';

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

interface LeadDetailPanelProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (leadId: string, status: string) => Promise<void>;
  onEnrich?: (leadId: string) => Promise<void>;
  onGenerateOutreach?: (leadId: string) => Promise<void>;
}

const statusOptions = [
  { value: 'UNCONTACTED', label: 'Uncontacted', color: 'bg-slate-100 text-slate-600' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-blue-100 text-blue-700' },
  { value: 'REPLIED', label: 'Replied', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'INTERESTED', label: 'Interested', color: 'bg-purple-100 text-purple-700' },
  { value: 'PAID', label: 'Paid', color: 'bg-amber-100 text-amber-700' },
];

export function LeadDetailPanel({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onEnrich,
  onGenerateOutreach,
}: LeadDetailPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'activity'>('overview');

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!lead || !onStatusChange) return;

      setIsUpdating(true);
      try {
        await onStatusChange(lead.id, newStatus);
      } catch (error) {
        console.error('Failed to update status:', error);
      } finally {
        setIsUpdating(false);
      }
    },
    [lead, onStatusChange]
  );

  const handleEnrich = useCallback(async () => {
    if (!lead || !onEnrich) return;

    setIsUpdating(true);
    try {
      await onEnrich(lead.id);
    } catch (error) {
      console.error('Failed to enrich lead:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [lead, onEnrich]);

  const handleGenerateOutreach = useCallback(async () => {
    if (!lead || !onGenerateOutreach) return;

    setIsUpdating(true);
    try {
      await onGenerateOutreach(lead.id);
    } catch (error) {
      console.error('Failed to generate outreach:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [lead, onGenerateOutreach]);

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {(lead.name || lead.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {lead.name || lead.email}
                </DialogTitle>
                {lead.name && (
                  <p className="text-sm text-gray-500">{lead.email}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <LeadScoreBadge score={lead.score ?? null} reason={lead.reason} size="md" />
                  {lead.segment && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs',
                        lead.segment === 'HOT' && 'bg-red-100 text-red-700',
                        lead.segment === 'WARM' && 'bg-amber-100 text-amber-700',
                        lead.segment === 'COLD' && 'bg-blue-100 text-blue-700'
                      )}
                    >
                      {lead.segment === 'HOT' && '🔥'}
                      {lead.segment === 'WARM' && '☀️'}
                      {lead.segment === 'COLD' && '❄️'}
                      {' '}{lead.segment}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 mt-4">
          {(['overview', 'notes', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleGenerateOutreach}
                  disabled={isUpdating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Generate Outreach
                </Button>
                <Button
                  onClick={handleEnrich}
                  disabled={isUpdating}
                  variant="outline"
                  className="w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Enrich Data
                </Button>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Status</h3>
                <div className="grid grid-cols-3 gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value)}
                      disabled={isUpdating || lead.status === option.value}
                      className={cn(
                        'px-3 py-2 text-xs font-medium rounded-lg border transition-all',
                        option.color,
                        lead.status === option.value
                          ? 'ring-2 ring-offset-2 ring-gray-900 scale-105'
                          : 'hover:opacity-80'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Company
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {lead.company || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Source
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {lead.source || '—'}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Current Status
                  </dt>
                  <dd className="mt-1">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-sm',
                        statusOptions.find((s) => s.value === lead.status)?.color ||
                          'bg-slate-100 text-slate-600'
                      )}
                    >
                      {lead.status.replace('_', ' ')}
                    </Badge>
                  </dd>
                </div>
              </div>

              {/* Signup Note */}
              {lead.signupNote && (
                <div className="pt-4 border-t border-gray-200">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Signup Note
                  </dt>
                  <dd className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {lead.signupNote}
                  </dd>
                </div>
              )}

              {/* AI Reasoning */}
              {lead.reason && (
                <div className="pt-4 border-t border-gray-200">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    AI Score Reasoning
                  </dt>
                  <dd className="text-sm text-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border border-purple-100">
                    {lead.reason}
                  </dd>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-sm">Notes will appear here</p>
                <p className="text-xs mt-1">Add context about this lead for your team</p>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">Activity timeline</p>
                <p className="text-xs mt-1">Track all interactions with this lead</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-gray-200 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
