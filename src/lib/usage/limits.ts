/**
 * Per-user usage tracking + plan-based limits.
 *
 * Scope: "leads_scored" (lifetime, counts against free tier) and
 *        "outreach_launched" (monthly, counts against Pro tier)
 *        + AI token budgets (tracked per request via `recordTokenUse`).
 *
 * Usage:
 *   const { allowed, remaining, limit } = await checkLimit(userId, "leads_scored");
 *   if (!allowed) throw new Error(`Limit reached: ${limit}`);
 *   await recordUse(userId, "leads_scored", leads.length);
 */

import { db } from "@/lib/db";

export type UsageScope = "leads_scored" | "outreach_launched" | "ai_tokens_in" | "ai_tokens_out";

interface PlanLimits {
  leadsScored: number; // -1 = unlimited
  outreachPerMonth: number; // -1 = unlimited
  aiTokensPerMonth: number; // -1 = unlimited
}

const LIMITS: Record<string, PlanLimits> = {
  FREE: { leadsScored: 25, outreachPerMonth: 0, aiTokensPerMonth: 10_000 },
  LAUNCH: { leadsScored: 500, outreachPerMonth: 1, aiTokensPerMonth: 100_000 },
  PRO: { leadsScored: -1, outreachPerMonth: 500, aiTokensPerMonth: 1_000_000 },
  PRO_PLUS: { leadsScored: -1, outreachPerMonth: -1, aiTokensPerMonth: 5_000_000 },
};

export function getLimitsForPlan(plan: string): PlanLimits {
  return LIMITS[plan] ?? LIMITS.FREE;
}

function currentPeriod(scope: UsageScope): string {
  if (scope === "leads_scored") return "lifetime";
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getCurrentUse(
  userId: string,
  scope: UsageScope
): Promise<number> {
  const period = currentPeriod(scope);
  const row = await db.usageCounter.findUnique({
    where: { userId_scope_period: { userId, scope, period } },
    select: { count: true },
  });
  return row?.count ?? 0;
}

export interface CheckResult {
  allowed: boolean;
  remaining: number; // -1 = unlimited
  limit: number; // -1 = unlimited
  used: number;
  reason?: "plan_upgrade_required" | "free_tier_exhausted" | "monthly_quota_exceeded";
}

export async function checkLimit(
  userId: string,
  scope: UsageScope,
  requestedDelta: number = 0
): Promise<CheckResult> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } });
  if (!user) return { allowed: false, remaining: 0, limit: 0, used: 0 };

  const limits = getLimitsForPlan(user.plan);

  let limit: number;
  switch (scope) {
    case "leads_scored":
      limit = limits.leadsScored;
      break;
    case "outreach_launched":
      limit = limits.outreachPerMonth;
      break;
    case "ai_tokens_in":
    case "ai_tokens_out":
      limit = limits.aiTokensPerMonth;
      break;
  }

  const used = await getCurrentUse(userId, scope);

  if (limit === -1) {
    return { allowed: true, remaining: -1, limit: -1, used };
  }

  const remaining = Math.max(0, limit - used);
  const allowed = used + requestedDelta <= limit;
  const reason: CheckResult["reason"] =
    user.plan === "FREE" ? "free_tier_exhausted" : "monthly_quota_exceeded";

  return { allowed, remaining, limit, used, reason };
}

export async function recordUse(
  userId: string,
  scope: UsageScope,
  delta: number
): Promise<void> {
  if (delta <= 0) return;
  const period = currentPeriod(scope);
  await db.usageCounter.upsert({
    where: { userId_scope_period: { userId, scope, period } },
    create: { userId, scope, period, count: delta },
    update: { count: { increment: delta } },
  });
}

export async function checkAndRecord(
  userId: string,
  scope: UsageScope,
  delta: number
): Promise<CheckResult> {
  const result = await checkLimit(userId, scope, delta);
  if (!result.allowed) return result;
  await recordUse(userId, scope, delta);
  return result;
}
