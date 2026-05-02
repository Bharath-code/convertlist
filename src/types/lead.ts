/**
 * Shared type definitions for the application
 */

import { LeadStatus } from "@prisma/client";

/**
 * Lead data transfer object used across the application
 */
export interface LeadDTO {
  id?: string;
  email: string;
  name?: string | null;
  company?: string | null;
  signupNote?: string | null;
  source?: string | null;
  score?: number | null;
  reason?: string | null;
  status?: LeadStatus | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

/**
 * Query parameters for listing leads
 */
export interface ListLeadsQuery {
  waitlistId?: string;
  cursor?: string;
  limit?: number;
}

/**
 * Paginated response for leads
 */
export interface PaginatedLeadsResponse {
  leads: LeadDTO[];
  nextCursor: string | null;
  hasMore: boolean;
}
