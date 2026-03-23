# Waitlist Conversion Assistant — System Architecture (Wireframe)

## High Level Flow

User → Frontend → API Layer → AI + Scoring Engine → Database → Response UI

---

## Architecture Diagram

```
┌──────────────┐
│    User      │
└──────┬───────┘
       │ Upload CSV / Connect Source
       ▼
┌──────────────┐
│   Frontend   │  (Next.js UI)
└──────┬───────┘
       │ POST /analyze
       ▼
┌────────────────────┐
│   API Layer        │
│  (Server Actions)  │
└──────┬─────────────┘
       │
       ├──► CSV Parser
       │
       ├──► Signal Extractor
       │       ├ domain classifier
       │       ├ recency calculator
       │       └ source normalizer
       │
       ├──► AI Intent Analyzer (LLM)
       │
       └──► Segmentation Engine
                │
                ▼
        ┌────────────────┐
        │   Database     │
        │  (Supabase)    │
        └──────┬─────────┘
               │
               ▼
        ┌──────────────┐
        │ Result Layer │
        │ Dashboard UI │
        └──────────────┘
```

---

## Components

### Frontend

* Upload screen
* Segmentation dashboard
* Message generator UI
* Conversion tracker UI

---

### Backend Logic

* CSV ingestion service
* lead scoring service
* LLM intent classification
* outreach generator

---

### Data Storage

Tables:

* users
* waitlists
* leads
* interactions
* messages_generated

---

### AI Layer

* intent classification prompt
* outreach generation prompt

---

### External Integrations (Future)

* Email marketing APIs
* Stripe
* Gmail
* Webhooks

---

## Scalability Notes

* cache segmentation results
* queue AI requests
* batch process large CSV uploads

---

## Security Notes

* encrypt uploaded emails
* GDPR delete functionality
* rate limit abuse

```
```
