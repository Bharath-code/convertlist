# Waitlist Conversion Assistant — MVP v2 PRD

## 1. Product Overview

Waitlist Conversion Assistant helps founders convert waitlist signups into early paying customers by:

* prioritizing who to contact first
* generating outreach messages
* guiding conversion workflow
* learning from real conversion outcomes

This product does NOT predict revenue.

It helps founders **focus effort where conversion likelihood is higher.**

---

## 2. Core Philosophy

This is a **decision-support workflow tool.**

Not:

* CRM
* email sender
* magical AI predictor

It reduces uncertainty and improves launch execution.

---

## 3. Target Users

Primary:

* indie hackers launching SaaS
* AI tool founders
* solo dev founders
* Chrome extension builders

Typical waitlist size:

50 – 3000 leads

---

## 4. Input Methods (MVP)

### 4.1 CSV Upload

Required:

* email

Optional:

* signup_note
* source
* created_at
* name
* company

System must gracefully handle missing data.

---

### 4.2 Paste Email List

Quick onboarding.

System auto assigns:

* imported_at timestamp
* unknown source

Confidence will be lower.

---

## 5. Data Quality Layer (Critical Feature)

Every lead shows:

* Score (0–100)
* Confidence (High / Medium / Low)
* Reason (plain English)

Example:

Score: 74
Confidence: High
Reason: Recent signup + strong problem description

Example:

Score: 52
Confidence: Low
Reason: Only email available

---

## 6. Segmentation Model (Heuristic v1)

### Signals

#### Domain Quality (0–25)

* company domain → +20
* gmail/outlook → +10
* disposable → +2

#### Intent Signal (0–30)

AI classification of signup_note.

* urgent pain → +25–30
* specific use case → +15–25
* vague → +5–10
* missing → 0

#### Recency (0–20)

* <7 days → +20
* <30 days → +15
* <90 days → +10
* older → +5

#### Source (0–15)

* referral → +15
* niche community → +10
* launch platform → +7
* unknown → +5

#### Bonus (future)

* replied
* opened
* clicked

---

## 7. Minimum Signal Logic

If lead has only email:

* cap score at 55
* mark confidence LOW

This prevents fake “hot leads.”

---

## 8. Segmentation Output

System shows:

🔥 Hot Leads
🌤 Warm Leads
❄ Cold Leads

Also show:

Top 10% prioritization view.

---

## 9. Outreach Generator

User selects:

* individual lead
* segment
* outreach type (initial, follow-up, re-engagement)

System generates:

* personalized outreach message
* CTA suggestion
* follow-up timing

### Email Sequences (Critical v1 Feature)

System supports 3–5 step outreach sequences:

* **Step 1:** Initial outreach (generated from lead score/segment)
* **Step 2–3:** Follow-up emails (auto-generated with timing)
* **Step 4–5:** Re-engagement (for non-responders)

Each step includes:

* message subject line
* body copy
* send timing (day X after previous step)
* variant suggestions

User can edit, reorder, or delete steps. Sequences attach to leads/segments.

**Critical:** Without sequences, the product solves "first email" but not "follow-up" — retention suffers.

---

## 10. Reply Detection (Zero-Cost MVP Approach)

System uses email forwarding for zero-cost reply detection.

**Implementation:**

* Generate unique reply-forwarding addresses per lead (e.g., `lead_{id}@reply.convertlist.ai`)
* User configures email forwarding to route replies to our inbox
* Inbound email parser detects which lead replied
* Auto-update lead status: Contacted → Replied

**Fallback:** "Did this lead reply?" prompt on next interaction if no forward configured.

**Phase 2:** Add Instantly.ai integration for automated detection ($47/mo, only after revenue justifies it).

**Why this works:** User sends cold email → lead replies → reply forwarded → we detect → flywheel spins. No SMTP setup, no warmup, no monthly cost.

---

## 12. Enrichment Workflow (VERY IMPORTANT)

After scoring system suggests:

"Improve your conversion accuracy."

Options:

* generate micro-survey link
* ask problem question
* collect urgency signal

Example survey:

* What problem are you trying to solve?
* How urgent is this?
* Would you pay for a solution?

New responses update score.

---

## 13. Conversion Tracker

User marks:

* contacted
* replied (auto-detected via webhook, manual override available)
* interested
* paid

System updates confidence + ranking.

This creates feedback loop.

---

## 14. Dashboard

Shows:

* total leads
* hot/warm/cold distribution
* contacted count
* reply count
* paid users

---

## 15. Success Metrics (MVP)

* first 10 paying customers
* % users contacting hot leads
* outreach messages generated
* repeat usage within 7 days

---

## 16. Pricing Strategy

Launch:

* **$49 lifetime** (test at higher price — $19 too easy to buy and not use)

Free:

* 50 lead analysis

Pro:

* $9/month — 2,000 leads, basic sequences (3-step), basic reply detection

Pro+:

* $29/month — unlimited leads, full sequences (5-step), inbound email reply detection (Phase 1), Instantly integration (Phase 2)

---

## 17. Future Roadmap (Moat Direction)

### Phase 2

* Instantly.ai integration (cold email sending + automated reply detection) — **deferred from MVP**
* ConvertKit integration
* Mailchimp integration
* Google Sheets sync

### Phase 3

* reply sentiment analysis
* campaign suggestions
* conversion funnel analytics

### Phase 4

* proprietary intent prediction model
* multi-launch history
* pricing optimization suggestions

---

## 18. Long Term Vision

Become:

**Default monetization workflow tool for indie launches.**

Not just analyzing waitlists.

But helping founders move from:

waitlist → conversation → conversion → revenue → repeat launches.
