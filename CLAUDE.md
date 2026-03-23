# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Waitlist Conversion Assistant helps indie founders convert waitlist signups into early paying customers through lead scoring, AI-powered segmentation, and outreach message generation.

**Target Users:** Indie hackers launching SaaS, AI tool founders, solo dev founders, Chrome extension builders (typical waitlist: 50–3000 leads)

**Core philosophy:** Decision-support workflow tool — not CRM, email sender, or magical AI predictor. Reduces uncertainty, improves launch execution.

**Core workflow:** Upload CSV → Batch AI scoring → Hot/Warm/Cold segmentation → Generate outreach message → Track conversion

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Frontend + Backend | Next.js 16.2 (App Router) | Latest stable, Turbopack improved |
| Auth | Clerk | Magic link only |
| Database | PlanetScale (MySQL, serverless) + Prisma | |
| Background Jobs | Inngest | |
| AI Scoring | Gemini 2.5 Flash-Lite | Free tier: 15 RPM, 1K RPD, 250K TPM, 1M context |
| Payments | DodoPayments | |
| Email | Resend | Transactional + inbound reply parsing |
| Reply Detection | Email forwarding (Phase 1) | Zero-cost approach; Instantly deferred to Phase 2 |
| Hosting | Vercel | |

## Architecture

```
User → Upload/Paste → Server Action → CSV Parse → Inngest (background)
                                                      ↓
UI polls status ← DB ← Batch AI scoring (Gemini, 50/batch)
                    ↓
              Results Dashboard → Outreach Generator
                    ↓
              Email Sequences (3-5 step) → User exports to their email tool
                    ↓
              Reply Detection: Email forwarding addresses → Resend inbound parse
                    ↓
              Contact Tracker (Contacted→Replied→Interested→Paid → updates confidence)
```

**Phase 2:** Add Instantly.ai for automated cold email sending + reply detection (after revenue justifies $47/mo).

**Critical constraint:** Never run AI scoring in Server Actions. Vercel times out at 60s. All AI work must be in Inngest background jobs.

**Reply Detection Strategy:** Generate unique reply-forwarding address per lead (e.g., `lead_{id}@reply.convertlist.ai`). User configures email forward. Parse inbound emails via Resend to detect replies. Zero-cost approach that still spins the contact tracker flywheel.

**Critical:** Reply detection via webhook is the single most important feature. Without it, the contact tracker flywheel dies.

## Scoring Model (v1)

| Signal | Weight | Max |
|---|---|---|
| Domain quality | Company +20, Gmail/Outlook +10, Disposable +2 | 25 |
| Intent (AI) | Urgent pain 25-30, Specific use case 15-25, Vague 5-10, Missing 0 | 30 |
| Recency | <7d +20, <30d +15, <90d +10, older +5 | 20 |
| Source | Referral +15, Niche community +10, Launch platform +7, Unknown +5 | 15 |

**Total max: 90** → Hot ≥60 / Warm 35-59 / Cold <35

**Minimum Signal Logic:** Lead with email only → cap score at 55, mark confidence LOW.

AI must batch 50 leads per API call using Gemini 2.5 Flash-Lite. Single lead scoring burns credits.

## Data Model (Prisma)

- **User** → has many Waitlists
- **Waitlist** → has many Leads
- **Lead**: email, name, company, signupNote, source, createdAt, score, confidence, reason, segment, status

## Input Methods

**CSV Upload:** email (required), signup_note, source, created_at, name, company (all optional). Gracefully handles missing data.

**Paste Email List:** Quick onboarding. Auto-assigns imported_at timestamp + unknown source. Confidence will be lower.

## Data Quality Layer

Every lead shows:
- **Score** (0–100)
- **Confidence** (High / Medium / Low)
- **Reason** (plain English sentence explaining the score)

Example: `Score: 74, Confidence: High, Reason: Recent signup + strong problem description`

## Core Philosophy

This is a **decision-support workflow tool**, not a CRM, email sender, or magical AI predictor. It reduces uncertainty and improves launch execution.

## File Structure

```
app/
├── (auth)/sign-in/page.tsx, sign-up/page.tsx
├── (dashboard)/
│   ├── upload/page.tsx           # Screen 1
│   ├── processing/[id]/page.tsx  # Screen 2
│   └── results/[id]/page.tsx     # Screen 3 + 4
├── api/
│   ├── waitlist/[id]/status/route.ts  # Polling endpoint
│   ├── outreach/route.ts              # Generate message
│   ├── leads/[id]/status/route.ts    # PATCH status
│   ├── sequences/route.ts             # Email sequences CRUD
│   └── webhooks/
│       ├── dodo/route.ts             # Payment webhook
│       └── email/reply/route.ts      # Reply detection webhook (CRITICAL)
inngest/functions/
├── score-waitlist.ts             # Background scoring job
└── send-sequence-step.ts        # Sequence step processor
lib/
├── ai/score-batch.ts, generate-outreach.ts
├── scoring/compute-score.ts
├── sequences/generate-sequence.ts
├── email/reply-detector.ts
├── csv/parse.ts
└── db.ts
```

## Segmentation Output

🔥 **Hot Leads** (≥60) | 🌤 **Warm Leads** (35-59) | ❄ **Cold Leads** (<35)
Top 10% prioritization view highlighted.

## Dashboard

Shows: total leads, hot/warm/cold distribution, contacted count, reply count, paid users.

## Success Metrics (MVP)

- First 10 paying customers
- % users contacting hot leads
- Outreach messages generated
- Repeat usage within 7 days

## Critical Build Rules

1. **Batching required:** Always batch AI calls (50 leads/prompt). Never score per-lead.
2. **Background jobs:** All AI work via Inngest. Server Actions for fast DB ops only.
3. **Score explanation:** Every lead must show a 1-sentence reason for its score.
4. **Reply detection:** Email forwarding approach — generate unique reply address per lead (e.g., `lead_{id}@reply.convertlist.ai`). User configures email forward to route replies. Parse inbound via Resend. This is the contact tracker flywheel — zero cost, works immediately, no Instantly required.
5. **Email sequences:** Support 3-5 step sequences. Every outreach action should support sequencing, not just single messages.
6. **Contact tracker flywheel:** Every "Paid" mark improves future scoring. Track which scored leads actually converted.

## Pricing Strategy

- **Launch:** $49 lifetime (test at higher price — $19 too easy to buy and not use)
- **Free tier:** 50 lead analysis
- **Pro ($9/mo):** 2,000 leads, basic sequences (3-step), basic reply detection
- **Pro+ ($29/mo):** unlimited leads, full sequences (5-step), full reply detection, Loops/Instantly integration

## Key Decisions

- **Next.js 16.2**: Latest stable with 400% faster dev startup, Turbopack improvements
- PlanetScale over Supabase: serverless MySQL, no connection pooling, generous free tier
- DodoPayments over Stripe: simpler MVP integration (webhook only, no SDK)
- **Gemini 2.5 Flash-Lite over Claude Haiku**: Free tier (no credit card), 1M context (can batch more leads), 15 RPM free
- Resend for transactional email only; **Instantly deferred to Phase 2** for cold email + reply detection
- **Test $49 launch price**, not $19. $19 too easy to buy and not use.
- Cold email sending deferred to Phase 2 — MVP focuses on scoring, sequences, tracking. Reply detection webhook endpoint built now (Phase 1), Instantly integration added later.

## Future Roadmap

**Phase 2:** Instantly.ai integration (cold email sending + automated reply detection, $47/mo — only after revenue justifies it), ConvertKit/Mailchimp integrations, Google Sheets sync
**Phase 3:** Reply sentiment analysis, campaign suggestions, funnel analytics
**Phase 4:** Proprietary intent prediction, multi-launch history, pricing optimization

## Long Term Vision

Become the **default monetization workflow tool for indie launches** — helping founders move from waitlist → conversation → conversion → revenue → repeat launches.
