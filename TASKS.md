# Waitlist Conversion Assistant — Atomic Task Breakdown

51 atomic tasks across 5 phases. Last updated: 2026-03-23.

---

## Phase 1: Foundation

### 7.1: Initialize Next.js 16.2 App Router project
**Task ID:** 1
**Status:** completed
**Deliverable:** `package.json`, `next.config.ts`, `tsconfig.json` with strict mode
**Note:** Next.js 16.2.0 (March 2026) with Turbopack improvements

### 7.2: Install project dependencies
**Task ID:** 2
**Status:** completed
**Blocked by:** 1, 3
**Deliverable:** prisma, @prisma/client, @clerk/nextjs, inngest, inngest-next, DodoPayments SDK, resend, papaparse, zod, lucide-react, tailwindcss

### 7.3: Configure Prisma schema + PlanetScale
**Task ID:** 3
**Status:** completed
**Blocked by:** 1, 2
**Deliverable:** `prisma/schema.prisma` with User, Waitlist, Lead models + Sequence, SequenceStep, LeadStatusHistory

### 7.4: Set up Clerk auth (magic link)
**Task ID:** 4
**Status:** completed
**Blocked by:** 2
**Deliverable:** `middleware.ts`, `app/(auth)/sign-in/page.tsx`, `app/(auth)/sign-up/page.tsx`

### 7.5: Set up Inngest client + dev server
**Task ID:** 5
**Status:** completed
**Blocked by:** 2
**Deliverable:** `inngest/client.ts`, `inngest/dev.ts`

### 7.6: Create base layout + global CSS
**Task ID:** 6
**Status:** completed
**Blocked by:** 2
**Deliverable:** `app/layout.tsx`, `app/globals.css` with Tailwind + design tokens

### 7.7: Create lib/db.ts singleton
**Task ID:** 7
**Status:** completed
**Blocked by:** 2
**Deliverable:** `lib/db.ts` Prisma client singleton

### 7.8: Create .env.example
**Task ID:** 41
**Status:** completed
**Deliverable:** `.env.example` with all required env vars

---

## Phase 2: Scoring Engine

### 1.1: Create upload page UI
**Task ID:** 8
**Status:** completed
**Blocked by:** 6
**Deliverable:** `app/upload/page.tsx` with file drop zone + paste textarea + free tier banner + lead limit display

### 1.2: Implement CSV parser
**Task ID:** 10
**Status:** completed
**Blocked by:** 8
**Deliverable:** `lib/csv/parse.ts` — email required, others optional

### 1.3: Implement paste email list parser
**Task ID:** 9
**Status:** completed
**Blocked by:** 8
**Deliverable:** Inline in upload route — newline/comma/semicolon separated

### 1.4: Create Server Action createWaitlist
**Task ID:** 13
**Status:** completed
**Blocked by:** 8
**Deliverable:** Bulk insert via `POST /api/upload` with plan limit enforcement

### 1.5: Implement lead deduplication
**Task ID:** 14
**Status:** completed
**Blocked by:** 8
**Deliverable:** Skip duplicate emails within same waitlist (Set-based dedup)

### 1.6: Handle missing data gracefully
**Task ID:** 12
**Status:** completed
**Blocked by:** 8
**Deliverable:** All lead fields nullable, email-only accepted

### 9.1: Create Inngest scoring function
**Task ID:** 11
**Status:** completed
**Blocked by:** 8
**Deliverable:** `inngest/functions/score-waitlist.ts`

### 9.2: Implement domain quality signal
**Task ID:** 20
**Status:** completed
**Blocked by:** 11
**Deliverable:** Inline in score-waitlist.ts — company +20, gmail/outlook +10, disposable +2

### 9.3: Implement recency signal
**Task ID:** 15
**Status:** completed
**Blocked by:** 11
**Deliverable:** Inline in score-waitlist.ts — <7d +20, <30d +15, <90d +10, older +5

### 9.4: Implement source signal
**Task ID:** 23
**Status:** completed
**Blocked by:** 11
**Deliverable:** Inline in score-waitlist.ts — referral +15, niche +10, launch +7, unknown +5

### 9.5: Implement AI intent classification batch
**Task ID:** 16
**Status:** completed
**Blocked by:** 11
**Deliverable:** `inngest/functions/score-waitlist.ts` — batch 50 leads, Gemini 2.5 Flash-Lite

### 9.6: Implement minimum signal logic
**Task ID:** 18
**Status:** completed
**Blocked by:** 11
**Deliverable:** email-only → cap score 55, confidence LOW

### 9.7: Implement score aggregation + segments
**Task ID:** 19
**Status:** completed
**Blocked by:** 11
**Deliverable:** Hot ≥60, Warm 35-59, Cold <35

### 9.8: Generate score explanation per lead
**Task ID:** 17
**Status:** completed
**Blocked by:** 11
**Deliverable:** 1-sentence reason per lead

### 9.9: Implement batch processing (50/batch)
**Task ID:** 21
**Status:** completed
**Blocked by:** 11
**Deliverable:** Process in chunks, update DB each batch

### 9.10: Store scoring results in DB
**Task ID:** 22
**Status:** completed
**Blocked by:** 11, 15, 16, 17, 18, 19, 20, 23
**Deliverable:** Update Lead records + Waitlist.processedLeads + generate reply addresses

### 3.1: Create processing page UI
**Task ID:** 24
**Status:** completed
**Blocked by:** 8
**Deliverable:** `app/processing/[id]/page.tsx` with progress indicator + auto-poll

### 3.2: Implement polling endpoint
**Task ID:** 29
**Status:** completed
**Blocked by:** 11
**Deliverable:** `GET /api/waitlist/[id]/status/route.ts`

### 3.3: Auto-redirect on completion
**Task ID:** 33
**Status:** completed
**Blocked by:** 24, 29
**Deliverable:** Redirect to results when status='completed'

### 3.4: Show error state + retry button
**Task ID:** 47
**Status:** completed
**Blocked by:** 24, 29
**Deliverable:** Error display + retry button in processing page

### 12.1: Create results page with lead cards
**Task ID:** 25
**Status:** completed
**Blocked by:** 22
**Deliverable:** `app/results/[id]/page.tsx` + `results-client.tsx` — Hot/Warm/Cold columns

### 12.2: Implement Top 10% prioritization view
**Task ID:** 30
**Status:** completed
**Blocked by:** 25
**Deliverable:** Top 10% highlighted view toggle

### 12.3: Implement search within results
**Task ID:** 32
**Status:** completed
**Blocked by:** 25
**Deliverable:** Filter by email/name/company

---

## Phase 3: Outreach & Sequences

### 4.1: Create Sequence model in Prisma
**Task ID:** 28
**Status:** completed
**Blocked by:** 3
**Deliverable:** Sequence + SequenceStep models

### 4.2-4.5: Create sequences CRUD API routes
**Task ID:** 40
**Status:** completed
**Blocked by:** 28
**Deliverable:** POST/GET `/api/sequences`, PATCH/DELETE `/api/sequences/[id]`

### 4.6: Create sequence builder UI
**Task ID:** 37
**Status:** completed
**Blocked by:** 28
**Deliverable:** `app/results/[id]/sequences/sequence-builder.tsx` — inline edit, add/remove steps

### 10.1: Create POST /api/outreach endpoint
**Task ID:** 26
**Status:** completed
**Blocked by:** 25
**Deliverable:** `app/api/outreach/route.ts`

### 10.2-10.6: Implement outreach message generation
**Task ID:** 31
**Status:** completed
**Blocked by:** 25
**Deliverable:** `lib/ai/generate-outreach.ts` — subject, body, CTA

### 10.7: Implement bulk outreach generation
**Task ID:** 27
**Status:** completed
**Blocked by:** 31
**Deliverable:** Per-lead outreach generation via /api/outreach

### 8.1: Create enrichment workflow prompt
**Task ID:** 34
**Status:** completed
**Blocked by:** 25
**Deliverable:** `app/results/[id]/enrichment-modal.tsx` — urgency/budget/role/timeline survey

### 8.2: Handle enrichment survey responses
**Task ID:** 35
**Status:** completed
**Blocked by:** 37, 40
**Deliverable:** `POST /api/leads/[id]/enrich` — recalculate score + confidence on survey completion

---

## Phase 4: Conversion & Payments

### 2.1: Create Lead status enum + transitions
**Task ID:** 38
**Status:** completed
**Blocked by:** 3
**Deliverable:** `LeadStatus` enum in Prisma — UNCONTACTED/CONTACTED/REPLIED/INTERESTED/PAID

### 2.2: Create PATCH /api/leads/[id]/status endpoint
**Task ID:** 42
**Status:** completed
**Blocked by:** 39
**Deliverable:** `app/api/leads/[id]/status/route.ts`

### 2.3: Track status change history
**Task ID:** 39
**Status:** completed
**Blocked by:** 42
**Deliverable:** LeadStatusHistory model + logged on every status change

### 6.1: Create reply detection webhook
**Task ID:** 43
**Status:** completed
**Blocked by:** 42
**Deliverable:** `POST /api/webhooks/email/reply/route.ts`

### 6.2: Implement email forwarding reply detection
**Task ID:** 36
**Status:** completed
**Blocked by:** 25
**Deliverable:** `lib/email/reply-address.ts` — `lead_{id}@reply.convertlist.ai` generated per lead on scoring

### 6.3: Configure Resend inbound email parsing
**Task ID:** TBD
**Status:** completed
**Blocked by:** 6
**Deliverable:** Set up Resend inbound email route to parse forwarded replies.

### 11.1: Create DodoPayments webhook handler
**Task ID:** 49
**Status:** completed
**Blocked by:** 6
**Deliverable:** `POST /api/webhooks/dodo/route.ts`

### 11.2: Verify DodoPayments webhook signature
**Task ID:** 51
**Status:** completed
**Blocked by:** 49
**Deliverable:** HMAC SHA-256 signature verification + event logging

### 11.3: Grant tier access on payment
**Task ID:** 45
**Status:** completed
**Blocked by:** 51
**Deliverable:** Update User.plan, set planExpiry on payment.completed/subscription.activated

### 11.6: Create pricing page UI
**Task ID:** 44
**Status:** completed
**Blocked by:** 45
**Deliverable:** `app/pricing/page.tsx` with Free/Pro/Pro+/Lifetime tier comparison

### 11.8: Implement plan limits enforcement
**Task ID:** 48
**Status:** completed
**Blocked by:** 45
**Deliverable:** Check limits before processing — `POST /api/upload` rejects when batch would exceed plan limit

---

## Phase 5: Dashboard

### 5.1-5.4: Create main dashboard UI
**Task ID:** 50
**Status:** completed
**Blocked by:** 25, 26, 27, 30, 32, 36, 46
**Deliverable:** Stats cards (total leads, hot/warm/cold, contacted, paid) + waitlist list + CTAs

### 5.5: Show upgrade prompts for free users
**Task ID:** 46
**Status:** completed
**Blocked by:** 22, 25, 28
**Deliverable:** Free tier banner in upload page (40+ leads) + results page (40+ leads) + inline on submit

---

## Critical Path

```
7.1 → 7.2 → 7.3 → 7.4 → 7.5 → 7.6 → 7.7 → 7.8
                                            ↓
1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6
        ↓
9.1 → 9.2 → 9.3 → 9.4 → 9.5 → 9.6 → 9.7 → 9.8 → 9.9 → 9.10
                                                        ↓
                                                12.1 → 12.2 → 12.3
                                                        ↓
10.1 → 10.2-10.6 → 10.7              4.1 → 4.2-4.5 → 4.6 → 8.1 → 8.2
        ↓                                                       ↓
6.1 → 6.2                                            2.1 → 2.2 → 2.3
        ↓                                                       ↓
11.1 → 11.2 → 11.3 → 11.6 → 11.8 ←———————————————————————————————————┐
                                                            ↓
                                                    5.1-5.4 → 5.5
```

## Dependency Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 1 | 1-7, 41 | All completed |
| 2 | 8-33 | All completed |
| 3 | 26-37 | All completed |
| 4 | 38-48 | All completed |
| 5 | 50, 46 | All completed |

## Remaining Work

| Task | Description | Priority |
|------|-------------|----------|
| Bulk export | Export leads to CSV | Low |
| Instantly integration | Phase 2 cold email + reply detection ($47/mo) | Phase 2 |
