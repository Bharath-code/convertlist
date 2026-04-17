/**
 * Zod validation schemas for API endpoints
 * 
 * This file contains reusable validation schemas for common data types
 * and specific schemas for API request bodies.
 */

import { z } from "zod";

// CUID validation pattern
const CUID_REGEX = /^[a-z0-9]{24,}$/i;

// Common validators
export const cuidSchema = z.string().regex(CUID_REGEX, "Invalid ID format");

export const emailSchema = z.string().email("Invalid email address");

export const urlSchema = z.string().url("Invalid URL");

// Lead-related schemas
export const leadIdSchema = cuidSchema;

export const waitlistIdSchema = cuidSchema;

export const sequenceIdSchema = cuidSchema;

// Lead status validation
export const leadStatusSchema = z.enum(["UNCONTACTED", "CONTACTED", "REPLIED", "INTERESTED", "PAID"]);

// Confidence level validation
export const confidenceSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);

// Segment validation
export const segmentSchema = z.enum(["HOT", "WARM", "COLD"]);

// Enrichment answers schema
export const enrichmentAnswersSchema = z.object({
  urgency: z.enum(["low", "medium", "high"]),
  budget: z.enum(["none", "small", "significant", "enterprise"]),
  role: z.enum(["founder", "employee", "manager", "other"]),
  timeline: z.enum(["exploring", "soon", "immediate", "already_paid"]),
});

// Lead enrichment request schema
export const leadEnrichRequestSchema = z.object({
  leadId: leadIdSchema,
  answers: enrichmentAnswersSchema,
});

// Lead status update schema
export const leadStatusUpdateSchema = z.object({
  status: leadStatusSchema,
});

// Outreach generation schema
export const outreachRequestSchema = z.object({
  leadId: leadIdSchema,
  sequenceId: sequenceIdSchema.optional(),
});

// Instantly campaign launch schema
export const instantlyCampaignSchema = z.object({
  waitlistId: waitlistIdSchema,
  leadIds: z.array(leadIdSchema).min(1, "At least one lead ID required").max(100, "Maximum 100 leads per campaign"),
  fromEmail: emailSchema,
});

// Sequence creation schema
export const sequenceCreateSchema = z.object({
  waitlistId: waitlistIdSchema,
  name: z.string().min(1, "Sequence name required").max(200, "Sequence name too long"),
  steps: z.array(z.object({
    subject: z.string().min(1, "Subject required").max(200, "Subject too long"),
    body: z.string().min(1, "Body required").max(5000, "Body too long"),
    delayDays: z.number().int().min(0).max(365).default(0),
    order: z.number().int().min(0),
  })).min(1, "At least one step required").max(10, "Maximum 10 steps per sequence"),
});

// Sequence update schema
export const sequenceUpdateSchema = z.object({
  name: z.string().min(1, "Sequence name required").max(200).optional(),
  steps: z.array(z.object({
    id: cuidSchema.optional(),
    subject: z.string().min(1, "Subject required").max(200),
    body: z.string().min(1, "Body required").max(5000),
    delayDays: z.number().int().min(0).max(365).default(0),
    order: z.number().int().min(0),
  })).min(1).max(10).optional(),
});

// Lead magnet capture schema
export const leadMagnetCaptureSchema = z.object({
  email: emailSchema,
  magnetType: z.enum(["CHECKLIST", "EMAIL_TEMPLATES", "PLAYBOOK"]),
  name: z.string().max(200).optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  utmContent: z.string().max(100).optional(),
  utmTerm: z.string().max(100).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Query parameter schemas
export const leadsQuerySchema = z.object({
  waitlistId: waitlistIdSchema.optional(),
  status: leadStatusSchema.optional(),
  segment: segmentSchema.optional(),
  ...paginationSchema.shape,
});

// Utility function to validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }
  return result.data;
}

// Utility function to validate query parameters
export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: URLSearchParams): T {
  const obj = Object.fromEntries(params.entries());
  const result = schema.safeParse(obj);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    throw new Error(`Query validation failed: ${JSON.stringify(errors)}`);
  }
  return result.data;
}
