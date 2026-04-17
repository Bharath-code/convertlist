/**
 * Environment variable validation using Zod
 * 
 * This validates all required and optional environment variables at startup.
 * Call validateEnv() in your application entry point to ensure all required
 * environment variables are present and properly formatted.
 */

import { z } from "zod";

const envSchema = z.object({
  // Required: Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "Clerk publishable key is required"),
  CLERK_SECRET_KEY: z.string().min(1, "Clerk secret key is required"),

  // Required: Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // Required: Inngest
  INNGEST_EVENT_KEY: z.string().min(1, "Inngest event key is required"),
  INNGEST_DEV_SERVER_URL: z.string().default("http://localhost:8288"),

  // Required: Google Gemini AI
  GEMINI_API_KEY: z.string().min(1, "Gemini API key is required"),

  // Optional: Resend (Email)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  RESEND_WEBHOOK_SECRET: z.string().optional(),

  // Optional: Instantly.ai (Cold Email)
  INSTANTLY_API_KEY: z.string().optional(),

  // Optional: Clearbit (Lead Enrichment)
  CLEARBIT_API_KEY: z.string().optional(),

  // Optional: DodoPayments (Payments)
  DODO_WEBHOOK_SECRET: z.string().optional(),
  DODO_PRICE_ID_STARTER: z.string().optional(),
  DODO_PRICE_ID_PRO: z.string().optional(),
  DODO_PRICE_ID_PRO_PLUS: z.string().optional(),
  DODO_PRICE_ID_LAUNCH: z.string().optional(),

  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validate all environment variables
 * Call this at application startup
 * 
 * @throws Error if validation fails
 */
export function validateEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return `${path}: ${issue.message}`;
      });

      console.error("❌ Environment variable validation failed:");
      console.error(missingVars.join("\n"));
      console.error("\nPlease check your .env file and ensure all required variables are set.");

      throw new Error(
        `Environment variable validation failed:\n${missingVars.join("\n")}`
      );
    }

    console.error("❌ Unexpected error validating environment variables:", error);
    throw error;
  }
}

/**
 * Get validated environment variables
 * Returns null if not yet validated
 */
export function getEnv(): Env | null {
  return validatedEnv;
}

/**
 * Check if a specific optional feature is configured
 */
export function isFeatureConfigured(feature: "resend" | "instantly" | "clearbit" | "dodo"): boolean {
  const env = getEnv();
  if (!env) return false;

  switch (feature) {
    case "resend":
      return !!env.RESEND_API_KEY;
    case "instantly":
      return !!env.INSTANTLY_API_KEY;
    case "clearbit":
      return !!env.CLEARBIT_API_KEY;
    case "dodo":
      return !!env.DODO_WEBHOOK_SECRET;
    default:
      return false;
  }
}

/**
 * Validate environment variables and log warnings for missing optional features
 */
export function validateAndLogEnv(): Env {
  const env = validateEnv();

  // Log warnings for missing optional features
  if (!env.RESEND_API_KEY) {
    console.warn("⚠️  RESEND_API_KEY not set - email features will be disabled");
  }
  if (!env.INSTANTLY_API_KEY) {
    console.warn("⚠️  INSTANTLY_API_KEY not set - cold email integration will be disabled");
  }
  if (!env.CLEARBIT_API_KEY) {
    console.warn("⚠️  CLEARBIT_API_KEY not set - lead enrichment will be limited");
  }
  if (!env.DODO_WEBHOOK_SECRET) {
    console.warn("⚠️  DODO_WEBHOOK_SECRET not set - payment webhooks will not be verified");
  }

  return env;
}
