 Waitlist Conversion Assistant — MVP Build Plan

     Context

     Building an MVP for a Waitlist Conversion Assistant that helps indie founders convert waitlist signups into early paying customers. The product has 3 core workflows: lead scoring/segmentation, outreach generation, and contact tracking with a reply detection flywheel.

     Task Breakdown (51 atomic tasks)

     Phase 1: Foundation

     ┌─────┬────────────────────────────────────────────────────────────┬────────────┐
     │  #  │                            Task                            │ Dependency │
     ├─────┼────────────────────────────────────────────────────────────┼────────────┤
     │ 7   │ Set up Next.js 16 + Prisma + PlanetScale + Clerk + Inngest │ None       │
     ├─────┼────────────────────────────────────────────────────────────┼────────────┤
     │ 1   │ CSV upload + paste email list features                     │ Task 7     │
     └─────┴────────────────────────────────────────────────────────────┴────────────┘

     Phase 2: Scoring Engine

     ┌─────┬──────────────────────────────────────────────────────────────────┬────────────┐
     │  #  │                               Task                               │ Dependency │
     ├─────┼──────────────────────────────────────────────────────────────────┼────────────┤
     │ 9   │ Inngest background scoring job (Gemini 2.5 Flash-Lite, 50/batch) │ Tasks 7, 1 │
     ├─────┼──────────────────────────────────────────────────────────────────┼────────────┤
     │ 3   │ Processing status page with polling                              │ Task 7     │
     ├─────┼──────────────────────────────────────────────────────────────────┼────────────┤
     │ 12  │ Results dashboard with Hot/Warm/Cold segmentation + Top 10% view │ Task 9     │
     └─────┴──────────────────────────────────────────────────────────────────┴────────────┘

     Phase 3: Outreach & Sequences

     ┌─────┬────────────────────────────────────────────────────────────────┬─────────────┐
     │  #  │                              Task                              │ Dependency  │
     ├─────┼────────────────────────────────────────────────────────────────┼─────────────┤
     │ 10  │ Outreach message generator (subject, body, CTA, timing)        │ Tasks 7, 12 │
     ├─────┼────────────────────────────────────────────────────────────────┼─────────────┤
     │ 4   │ Email sequences CRUD (3-5 step sequences)                      │ Task 7      │
     ├─────┼────────────────────────────────────────────────────────────────┼─────────────┤
     │ 8   │ Enrichment workflow prompts (micro-survey, urgency collection) │ Task 12     │
     └─────┴────────────────────────────────────────────────────────────────┴─────────────┘

     Phase 4: Conversion & Payments

     ┌─────┬──────────────────────────────────────────────────────────┬────────────┐
     │  #  │                           Task                           │ Dependency │
     ├─────┼──────────────────────────────────────────────────────────┼────────────┤
     │ 2   │ Contact tracker (Contacted→Replied→Interested→Paid flow) │ Task 7     │
     ├─────┼──────────────────────────────────────────────────────────┼────────────┤
     │ 6   │ Reply detection webhook (POST /api/webhooks/email/reply) │ Task 12    │
     ├─────┼──────────────────────────────────────────────────────────┼────────────┤
     │ 11  │ DodoPayments integration + pricing tiers                 │ Task 7     │
     └─────┴──────────────────────────────────────────────────────────┴────────────┘

     Phase 5: Dashboard

     ┌─────┬─────────────────────────────────────────────────────────────────────────┬────────────────┐
     │  #  │                                  Task                                   │   Dependency   │
     ├─────┼─────────────────────────────────────────────────────────────────────────┼────────────────┤
     │ 5   │ Main dashboard (total leads, distribution, contacted/reply/paid counts) │ Tasks 9, 12, 2 │
     └─────┴─────────────────────────────────────────────────────────────────────────┴────────────────┘

     Critical Path

     7 (setup) → 1 (upload) → 9 (scoring) → 12 (results) → 6 (reply webhook)
                                                              ↓
                                                         5 (dashboard)

     Tech Stack (Updated: March 2026)

     ┌────────────────────┬────────────────────────────────────────────────────────────────────────┐
     │       Layer        │                                  Tool                                  │
     ├────────────────────┼────────────────────────────────────────────────────────────────────────┤
     │ Frontend + Backend │ Next.js 16.2 (App Router) — latest stable, Turbopack improved          │
     ├────────────────────┼────────────────────────────────────────────────────────────────────────┤
     │ Auth               │ Clerk (magic link only)                                                │
     ├────────────────────┼────────────────────────────────────────────────────────────────────────┤
     │ Database           │ PlanetScale (MySQL) + Prisma                                           │
     ├────────────────────┼────────────────────────────────────────────────────────────────────────┤
     │ Background Jobs    │ Inngest                                                                │
     ├────────────────────┼────────────────────────────────────────────────────────────────────────┤
     │ AI Scoring         │ Gemini 2.5 Flash-Lite — free tier: 15 RPM, 1K RPD, 250K TPM          │
     │                    │ 1M context window, no credit card required                             │
     ├────────────────────┼────────────────────────────────────────────────────────────────────────┤
     │ Payments           │ DodoPayments                                                           │
     ├────────────────────┼────────────────────────────────────────────────────────────────────────┤
     │ Email              │ Resend (transactional + inbound reply parsing)                        │
     │ Reply Detection    │ Email forwarding (Phase 1), Instantly (Phase 2, $47/mo)              │
     ├────────────────────┼────────────────────────────────────────────────────────────────────────┤
     │ Hosting            │ Vercel                                                                 │
     └────────────────────┴────────────────────────────────────────────────────────────────────────┘

     Scoring Model (v1)

     ┌────────────────┬───────────────────────────────────────────────────────────────────┬────────────┐
     │     Signal     │                              Weight                               │ Max Points │
     ├────────────────┼───────────────────────────────────────────────────────────────────┼────────────┤
     │ Domain quality │ Company domain +20, Gmail/Outlook +10, Disposable +2              │ 25         │
     ├────────────────┼───────────────────────────────────────────────────────────────────┼────────────┤
     │ Intent (AI)    │ Urgent pain 25-30, Specific use case 15-25, Vague 5-10, Missing 0 │ 30         │
     ├────────────────┼───────────────────────────────────────────────────────────────────┼────────────┤
     │ Recency        │ <7d +20, <30d +15, <90d +10, older +5                             │ 20         │
     ├────────────────┼───────────────────────────────────────────────────────────────────┼────────────┤
     │ Source         │ Referral +15, Niche community +10, Launch platform +7, Unknown +5 │ 15         │
     └────────────────┴───────────────────────────────────────────────────────────────────┴────────────┘

     Total max: 90 → Hot ≥60 / Warm 35-59 / Cold <35

     Minimum Signal Logic: Lead with email only → cap score at 55, mark confidence LOW.

     Data Model (Prisma)

     User → has many Waitlists
     Waitlist → has many Leads
     Lead: email, name, company, signupNote, source, createdAt, score, confidence, reason, segment, status

     Key Files to Create/Modify

     app/
     ├── (auth)/sign-in/page.tsx, sign-up/page.tsx
     ├── (dashboard)/
     │   ├── upload/page.tsx           # Screen 1
     │   ├── processing/[id]/page.tsx  # Screen 2
     │   └── results/[id]/page.tsx     # Screen 3
     ├── api/
     │   ├── waitlist/[id]/status/route.ts
     │   ├── outreach/route.ts
     │   ├── leads/[id]/status/route.ts
     │   ├── sequences/route.ts
     │   └── webhooks/
     │       ├── dodo/route.ts
     │       └── email/reply/route.ts  # CRITICAL
     inngest/functions/
     ├── score-waitlist.ts
     └── send-sequence-step.ts
     lib/
     ├── ai/score-batch.ts, generate-outreach.ts
     ├── scoring/compute-score.ts
     ├── sequences/generate-sequence.ts
     ├── email/reply-detector.ts
     ├── csv/parse.ts
     └── db.ts
     prisma/schema.prisma

     Critical Rules

     1. Batching required: Always batch AI calls (50 leads/prompt) using Gemini 2.5 Flash-Lite. Never score per-lead.
     2. Background jobs: All AI work via Inngest. Server Actions for fast DB ops only.
     3. Score explanation: Every lead must show a 1-sentence reason for its score.
     4. Reply detection: Email forwarding approach — generate unique reply address per lead, parse inbound emails. This spins the contact tracker flywheel at zero cost. Instantly integration deferred to Phase 2.
     5. Email sequences: Support 3-5 step sequences.
     6. Contact tracker flywheel: Every "Paid" mark improves future scoring.

     Pricing Tiers

     ┌──────────┬────────┬─────────────────────────────────────────────────────────┐
     │   Tier   │ Price  │                         Limits                          │
     ├──────────┼────────┼─────────────────────────────────────────────────────────┤
     │ Free     │ $0     │ 50 lead analysis                                        │
     ├──────────┼────────┼─────────────────────────────────────────────────────────┤
     │ Pro      │ $9/mo  │ 2,000 leads, 3-step sequences, basic reply detection    │
     ├──────────┼────────┼─────────────────────────────────────────────────────────┤
     │ Pro+     │ $29/mo │ Unlimited leads, 5-step sequences, full reply detection │
     ├──────────┼────────┼─────────────────────────────────────────────────────────┤
     │ Lifetime │ $49    │ All Pro+ features forever                               │
     └──────────┴────────┴─────────────────────────────────────────────────────────┘

     Verification

     - Upload CSV with 100+ leads → all scored in batches of 50
     - Processing page shows accurate batch progress
     - Results dashboard shows correct Hot/Warm/Cold distribution
     - Reply webhook fires → lead status auto-updates to "Replied"
     - Manual status updates (Contacted→Interested→Paid) persist
     - Outreach generator produces personalized messages
     - 5-step email sequence can be created and attached to leads
     - Payment webhook correctly grants tier access
     - Free tier users see upgrade prompt at 50 leads