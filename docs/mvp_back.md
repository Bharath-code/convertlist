# Waitlist Conversion Assistant — MVP Document

> **Goal:** Ship a working product in 4 weeks, solo. One complete workflow. Zero bloat.
>
> **The workflow:** Upload CSV → Scored leads → Copy outreach message → Mark contacted.

---

## 1. The One Metric That Matters

> **Time from "upload CSV" to "copied first outreach message" must be under 90 seconds.**

Everything in this MVP either supports that moment or gets cut.

---

## 2. MVP Scope — What's In, What's Out

### IN (Build This)

| Feature | Why it's in |
|---|---|
| CSV upload + email paste | Core input |
| Demo mode (sample data, no upload) | Converts visitors before they trust you |
| Batch AI intent scoring | Core value prop |
| Hot / Warm / Cold segmentation | Core output |
| Score reason sentence per lead | Trust layer — users need to understand why |
| Outreach message generator | The "wow" moment |
| One-click copy to clipboard | Removes all friction |
| Manual contact tracker (Contacted → Replied → Paid) | Data flywheel for scoring improvement |
| Auth (magic link via Clerk) | Required before payment |
| DodoPayments gate | Monetisation |
| Shareable result card | Viral distribution loop |

### OUT (Cut for Now)

- Email integrations (ConvertKit, Mailchimp, etc.)
- Bulk outreach / campaign planning
- Email sequence suggestions
- Webhook API / Tally / Typeform connectors
- Multi-launch history
- Reply sentiment analysis
- Google Sheets connector
- Team / multi-user accounts
- Pricing experiments
- Campaign analytics dashboard

---

## 3. The 4 Screens

### Screen 1 — Upload / Demo

- Headline + sub-headline
- Two CTAs side by side:
  - **"Try with sample data →"** (no sign-in required, loads 20 fake leads instantly)
  - **"Upload my waitlist"** (requires sign-in)
- Accepted input:
  - CSV file (drag & drop or file picker)
  - Paste raw emails (one per line)
- Required CSV columns: `email`, `created_at`
- Optional columns: `signup_note`, `source`
- Validation: strip duplicates, flag disposable emails, show count before confirming

### Screen 2 — Processing State

- Full-screen progress view, not a loading spinner
- Live counter: `"Scored 47 / 312 leads…"`
- Streaming progress bar
- Rotating status messages:
  - "Analyzing signup intent…"
  - "Detecting serious buyers…"
  - "Classifying lead temperature…"
  - "Almost there…"
- Runs as a **background job** (not a blocking HTTP request)
- Sends email notification when complete (Resend): `"Your 312 leads are ready to review"`

### Screen 3 — Results Dashboard

**Summary bar (top):**
- Total leads
- 🔥 Hot count
- 🌤 Warm count
- ❄ Cold count
- "Share results" button → generates shareable card image

**Segmentation tabs:** Hot | Warm | Cold

**Lead table columns:**
| Column | Notes |
|---|---|
| Email | Show domain only if company domain |
| Score | 0–100 number |
| Reason | 1-sentence plain English explanation |
| Status | Pill: New / Contacted / Replied / Paid |
| Action | "Generate Message" button |

No filters, no sorting, no export yet. That's Phase 2.

### Screen 4 — Outreach + Tracker

- Triggered from "Generate Message" on a lead row
- Opens as a right-side panel (not a new page)
- Shows:
  - Generated outreach message (personalised to lead's signup note / domain)
  - Suggested CTA line
  - Follow-up timing advice (e.g. "If no reply in 3 days, send one follow-up")
- Buttons:
  - **Copy message** (one click, confirmation toast)
  - **Mark as Contacted** → updates lead status inline
- Status progression on each lead row:
  - New → Contacted → Replied → Paid
  - Each click updates DB and recalculates segment confidence

---

## 4. Tech Stack

### Overview

| Layer | Tool | Cost |
|---|---|---|
| Frontend + backend | Next.js 14 (App Router) | Free |
| Auth | Clerk (magic link only) | Free tier (10k MAU) |
| Database | **PlanetScale** (MySQL, serverless) | Free tier — 5 GB storage, 1B row reads/mo |
| Background jobs | Inngest | Free tier (50k steps/mo) |
| AI scoring | Free AI credits (see AI section) | $0 during MVP |
| Payments | **DodoPayments** | 3% + $0.30 per transaction |
| Email notifications | Resend | Free tier (3k emails/mo) |
| Hosting | Vercel | Free tier |
| OG card generation | `@vercel/og` (built-in) | Free |
| Analytics | PostHog | Free tier (1M events/mo) |

**Total infra cost at zero users: $0/mo**
**At 100 active users: ~$0–20/mo**

---

### Why PlanetScale (not Supabase)

- Serverless MySQL — no connection pooling headache with Next.js
- Free tier is genuinely generous (no row limits, 5 GB storage)
- Branching workflow: create a DB branch per feature, merge to main — like Git for your schema
- Automatic horizontal scaling — you never touch a connection pool
- Prisma integration is first-class

**Schema (Prisma):**

```prisma
model User {
  id          String      @id @default(cuid())
  email       String      @unique
  createdAt   DateTime    @default(now())
  waitlists   Waitlist[]
}

model Waitlist {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  name        String
  createdAt   DateTime  @default(now())
  leads       Lead[]
}

model Lead {
  id            String      @id @default(cuid())
  waitlistId    String
  waitlist      Waitlist    @relation(fields: [waitlistId], references: [id])
  email         String
  signupNote    String?
  source        String?
  createdAt     DateTime
  score         Int?
  reason        String?
  segment       String?     // "hot" | "warm" | "cold"
  status        String      @default("new") // "new" | "contacted" | "replied" | "paid"
  lastUpdated   DateTime    @updatedAt
}
```

---

### AI Scoring — Free Credits Strategy

**Where to get free AI credits for MVP:**

| Provider | Free credits | Model | Best for |
|---|---|---|---|
| **Anthropic** | $5 on sign-up | Claude Haiku | Intent scoring (cheapest, fastest) |
| **Google AI Studio** | Completely free | Gemini 1.5 Flash | Backup / overflow |
| **OpenRouter** | $1 free credit | Any model | Routing fallback |
| **Groq** | Free tier (rate limited) | Llama 3.1 8B | Batch scoring fallback |
| **Together AI** | $25 on sign-up | Mixtral / Llama | Bulk batch processing |

**Use Claude Haiku as primary.** At $0.25 per 1M input tokens, a batch of 50 signup notes (~2,500 tokens) costs ~$0.0006. Your $5 free credit covers ~8,300 analysis runs. That's enough for your first 200+ users.

**Batching pattern (critical — do not score per lead):**

```typescript
// WRONG — one API call per lead
for (const lead of leads) {
  const score = await scoreOneLead(lead); // burns credits, slow
}

// CORRECT — batch 50 leads per prompt
const batches = chunk(leads, 50);
for (const batch of batches) {
  const scores = await scoreBatch(batch); // one API call for 50 leads
}
```

**Intent scoring prompt (Haiku):**

```
You are a lead scoring assistant. For each signup note below, return a JSON array with:
- intent_score: 0-30 (0=empty/spam, 10=curious, 20=specific use case, 30=strong pain/urgency)
- reason: one sentence explaining the score

Signup notes:
${batch.map((l, i) => `${i+1}. "${l.signupNote || ''}"`).join('\n')}

Return ONLY valid JSON. No explanation outside the array.
Format: [{"intent_score": 25, "reason": "Described specific pain with current tool"}]
```

**Full scoring model (unchanged from segmentation_logic.md):**

| Signal | Weight | Logic |
|---|---|---|
| Domain score | 0–25 | Company domain +20, Gmail/Outlook +10, Disposable +2 |
| Intent score | 0–30 | AI-classified from signup note |
| Recency score | 0–20 | <7 days +20, <30 days +15, <90 days +10, older +5 |
| Source score | 0–15 | Referral +15, Niche community +10, PH/launch site +7, Unknown +5 |
| **Total** | **0–90** | **Hot ≥ 60 / Warm 35–59 / Cold < 35** |

Note: Thresholds adjusted from original doc to account for max 90 (not 100) since bonus signals are Phase 2.

---

### Background Job Architecture (Inngest)

Never run AI scoring in a Server Action — Vercel will timeout at 60 seconds for any list over ~100 leads.

```
User uploads CSV
  → Server Action: parse CSV, create Waitlist + Leads in DB (status: "pending")
  → Trigger Inngest event: "waitlist/scoring.requested"
  → Return job ID to frontend immediately

Inngest function runs in background:
  → Fetch all leads for waitlist
  → Chunk into batches of 50
  → For each batch: call AI, write scores back to DB
  → On complete: send email via Resend, update waitlist status: "ready"

Frontend polls /api/waitlist/[id]/status every 3 seconds
  → Shows live count: "Scored 47 / 312"
  → Redirects to results when status = "ready"
```

---

### DodoPayments Integration

DodoPayments is straightforward — no complex webhook setup needed for MVP.

**Pricing gates:**

| Plan | Price | Limits |
|---|---|---|
| Free | $0 | 50 leads max, no outreach generator |
| Lifetime Deal (LTD) | $49 one-time | Unlimited leads, all features, first 50 users only |
| Pro | $19/mo | Unlimited leads, all features |

**Why $49 LTD (not $19 as in original docs):**
- $19 attracts tire kickers who won't give feedback
- $49 filters for founders who are serious about converting their waitlist
- Still cheap enough for an indie hacker on a tight budget
- 50 LTD sales = $2,450 upfront cash to fund months 2–4

**DodoPayments setup:**
1. Create product in DodoPayments dashboard
2. Generate payment link for each plan
3. Redirect to DodoPayments hosted checkout on plan selection
4. Webhook: `POST /api/webhooks/dodo` → verify signature → update user plan in DB
5. No SDK needed for MVP — just payment links + webhook handler

```typescript
// app/api/webhooks/dodo/route.ts
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('dodo-signature');
  
  // Verify webhook signature
  if (!verifyDodoSignature(body, signature, process.env.DODO_WEBHOOK_SECRET)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(body);
  
  if (event.type === 'payment.completed') {
    await db.user.update({
      where: { email: event.customer.email },
      data: { plan: event.metadata.plan, paidAt: new Date() }
    });
  }
  
  return Response.json({ received: true });
}
```

---

## 5. File Structure

```
waitlist-converter/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (dashboard)/
│   │   ├── upload/page.tsx          ← Screen 1
│   │   ├── processing/[id]/page.tsx ← Screen 2
│   │   └── results/[id]/page.tsx    ← Screen 3 + 4
│   ├── api/
│   │   ├── waitlist/
│   │   │   ├── route.ts             ← POST: create waitlist from CSV
│   │   │   └── [id]/
│   │   │       ├── status/route.ts  ← GET: polling endpoint
│   │   │       └── leads/route.ts   ← GET: paginated leads
│   │   ├── outreach/route.ts        ← POST: generate message for one lead
│   │   ├── leads/[id]/status/route.ts ← PATCH: update contacted/replied/paid
│   │   └── webhooks/dodo/route.ts   ← DodoPayments webhook
│   └── layout.tsx
├── inngest/
│   ├── client.ts
│   └── functions/
│       └── score-waitlist.ts        ← Background job
├── lib/
│   ├── ai/
│   │   ├── score-batch.ts           ← Batch intent scoring
│   │   └── generate-outreach.ts     ← Outreach message prompt
│   ├── scoring/
│   │   └── compute-score.ts         ← Domain + recency + source math
│   ├── csv/
│   │   └── parse.ts                 ← CSV parser + email validator
│   └── db.ts                        ← Prisma client singleton
├── prisma/
│   └── schema.prisma
├── components/
│   ├── upload-zone.tsx
│   ├── lead-table.tsx
│   ├── outreach-panel.tsx
│   └── share-card.tsx               ← OG image shareable card
└── middleware.ts                    ← Clerk auth protection
```

---

## 6. Build Timeline — 4 Weeks Solo

### Week 1 — Foundation

- [ ] Init Next.js 14 project, push to GitHub
- [ ] Set up PlanetScale DB + Prisma schema
- [ ] Clerk auth (magic link only, no social login yet)
- [ ] CSV parser: read file, validate emails, strip duplicates
- [ ] Compute domain + recency + source scores (no AI yet — mock intent score = 15)
- [ ] Store leads in DB, render basic results table
- [ ] Deploy to Vercel

**End of Week 1 checkpoint:** Can upload a CSV and see a table of leads with mock scores. Auth works.

---

### Week 2 — AI + Core UX

- [ ] Set up Inngest locally + connect to Vercel
- [ ] Background scoring job: fetch leads → batch → call Claude Haiku → write scores
- [ ] Build processing screen with polling + live counter
- [ ] Integrate real AI intent scores into final lead score
- [ ] Hot/Warm/Cold tabs with segment counts
- [ ] Demo mode: hardcode 20 realistic sample leads, bypass upload

**End of Week 2 checkpoint:** Full scoring pipeline works end to end. Demo mode live.

---

### Week 3 — Outreach + Monetisation

- [ ] Outreach generator: right-side panel, personalised message, copy button
- [ ] Contact tracker: status buttons update DB inline
- [ ] DodoPayments: payment links + webhook handler + plan gating
- [ ] Shareable card: `/api/og/[id]` route using `@vercel/og`
- [ ] Resend email: "Your analysis is ready" notification
- [ ] Paywalled features: outreach generator locked to paid plan

**End of Week 3 checkpoint:** A paying customer can upload, score, generate outreach, and pay.

---

### Week 4 — Polish + First Users

- [ ] Edge case handling: empty CSV, all disposable emails, very large files (>5k leads)
- [ ] Error states and recovery UI
- [ ] Loading skeletons (not spinners)
- [ ] Mobile responsive results table
- [ ] Landing page copy (from landing_page.md) + pricing section
- [ ] Manual outreach to first 5 users, onboard live
- [ ] Collect feedback → fix top 3 complaints

**End of Week 4 checkpoint:** First paying user.

---

## 7. The 3 Things to Validate in Month 1

These three questions determine whether to keep building or pivot before month 2:

**1. Do founders mark leads as "Paid"?**
If fewer than 20% of active users ever click "Paid" on a lead, the tracker is decorative. This means either (a) the scoring quality is too low and they're not converting those leads, or (b) they're using the tool passively and not actually reaching out. Both are signals to act on.

**2. Is the outreach message good enough to send unedited?**
Ask your first 10 users: "Did you edit the message before sending?" If 8 out of 10 rewrote more than 50% of it, your prompt needs serious work. The target: 60% send it with only minor tweaks.

**3. Does anyone share the result card?**
If zero shares in the first 20 users, the viral loop won't work at scale and you need a different distribution mechanic. If even 3–4 share it, double down and make it prettier.

---

## 8. The Non-Obvious MVP Decision

The contact tracker (marking who actually paid) feels like a Phase 2 nicety. It isn't. It's your data flywheel.

Every time a user marks a lead as "Paid," you learn: this combination of domain score + intent signal + recency + source = actual revenue. Over 50 users and 1,000 leads tracked, that's a proprietary training dataset that makes your scoring model better than anything rule-based. No competitor who launches after you has that data.

Build the tracker in Week 3. Don't skip it.

---

## 9. Costs Summary

| Phase | Monthly cost | Notes |
|---|---|---|
| Development (Weeks 1–4) | $0 | All free tiers |
| 0–50 users | $0 | All free tiers |
| 50–200 users | ~$20–40/mo | PlanetScale paid plan if needed |
| Break-even | ~$300 MRR | ~16 Pro users or 7 Growth users |
| Target Month 6 | $1,500–3,000 MRR | 30 Pro + 10 Growth users |

**AI cost at scale (Claude Haiku, batched):**
- 100 users × avg 300 leads = 30,000 leads/mo
- 600 batch calls × ~$0.001 = **$0.60/mo in AI costs**
- Even at 10,000 users: ~$60/mo in AI costs
- This is why batching is non-negotiable.

---

*Last updated: MVP v1.0 — Build this. Validate the 3 questions. Then and only then plan Phase 2.*