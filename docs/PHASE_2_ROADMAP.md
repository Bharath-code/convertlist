# ConvertList - Phase 2 Roadmap

**Last Updated:** March 24, 2026  
**Status:** Planning (Not Started)

---

## Overview

Phase 2 focuses on **Integrations & Automation** to reduce manual work and scale outreach.

**Phase 1 (Current):** Score → Generate → Copy → Send → Track (Manual)  
**Phase 2 (Future):** Score → Generate → **Send Automatically** → Track Opens/Clicks → Sentiment Analysis

---

## 🎯 When to Build Phase 2

### Build Phase 2 when:
- ✅ 10+ paying customers
- ✅ $500+ MRR
- ✅ Users asking for automated sending
- ✅ Can afford $47/mo Instantly cost

### Don't build Phase 2 yet if:
- ❌ Still validating core scoring value
- ❌ <10 paying users
- ❌ Manual workflow is acceptable for early users

---

## 1. Instantly.ai Integration (Primary Feature)

**Priority:** HIGH  
**Estimated Effort:** 2-3 weeks  
**Cost:** $47/mo (passed to user or absorbed)

### Why Instantly?
- Automates cold email sending at scale
- Advanced reply detection beyond email forwarding
- Built-in email warmup
- Open/click tracking
- Bounce handling

### Tasks

#### Authentication & Setup
- [ ] Create Instantly developer account
- [ ] Implement OAuth flow for Instantly connection
- [ ] Store Instantly tokens securely (encrypted)
- [ ] Add "Connect Instantly" settings page
- [ ] Handle token refresh

#### Campaign Sync
- [ ] Map ConvertList segments to Instantly campaigns
- [ ] Create campaign from sequence (3-5 steps)
- [ ] Sync lead data (email, name, company, custom fields)
- [ ] Handle campaign creation errors
- [ ] Show campaign status in UI

#### Automated Sending
- [ ] "Send to Instantly" button on individual leads
- [ ] "Send Segment to Instantly" bulk action
- [ ] Queue management (don't overwhelm Instantly API)
- [ ] Rate limiting (respect Instantly API limits)
- [ ] Send confirmation + undo option

#### Reply Detection (Advanced)
- [ ] Webhook handler for Instantly reply events
- [ ] Auto-update lead status: CONTACTED → REPLIED
- [ ] Store reply content in lead history
- [ ] Handle multiple replies (thread tracking)
- [ ] Distinguish between auto-replies vs human replies

#### Tracking & Analytics
- [ ] Sync open events → lead activity timeline
- [ ] Sync click events → lead activity timeline
- [ ] Sync bounce events → mark lead as invalid
- [ ] Show email performance stats (open rate, click rate)
- [ ] A/B test subject line performance

#### Error Handling
- [ ] Handle Instantly API rate limits
- [ ] Retry failed sends
- [ ] Notify user of connection issues
- [ ] Fallback to manual copy if Instantly unavailable

### API Endpoints Needed

```
POST   /api/integrations/instantly/connect      # OAuth initiation
GET    /api/integrations/instantly/status       # Check connection status
DELETE /api/integrations/instantly/disconnect   # Remove connection
POST   /api/integrations/instantly/sync         # Sync leads to campaign
POST   /api/integrations/instantly/send         # Send individual lead
POST   /api/integrations/instantly/send-bulk    # Send segment
GET    /api/integrations/instantly/campaigns    # List campaigns
POST   /api/webhooks/instantly                  # Instantly webhook receiver
```

### Database Schema Updates

```prisma
model InstantlyAccount {
  id             String   @id @default(cuid())
  userId         String   @unique
  accessToken    String   @encrypted
  refreshToken   String   @encrypted
  expiry         DateTime
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  campaigns      InstantlyCampaign[]
}

model InstantlyCampaign {
  id             String   @id @default(cuid())
  instantlyId    String   @unique
  accountId      String
  account        InstantlyAccount @relation(fields: [accountId], references: [id])
  name           String
  status         String   // active, paused, completed
  totalSent      Int      @default(0)
  openRate       Float?
  clickRate      Float?
  replyRate      Float?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  leads          Lead[]
}

model LeadActivity {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id])
  type      ActivityType // OPENED, CLICKED, REPLIED, BOUNCED
  metadata  Json     // { url, timestamp, userAgent, etc. }
  createdAt DateTime @default(now())

  @@index([leadId])
}

enum ActivityType {
  OPENED
  CLICKED
  REPLIED
  BOUNCED
  UNSUBSCRIBED
}
```

---

## 2. Email Marketing Integrations

### 2.1 ConvertKit Integration

**Priority:** MEDIUM  
**Estimated Effort:** 1 week

#### Tasks
- [ ] OAuth connection flow
- [ ] Sync waitlist to ConvertKit tags
- [ ] Import subscriber custom fields
- [ ] Trigger ConvertKit email sequences
- [ ] Two-way sync (ConvertList ↔ ConvertKit)
- [ ] Handle unsubscribe events

#### API Endpoints
```
POST   /api/integrations/convertkit/connect
DELETE /api/integrations/convertkit/disconnect
POST   /api/integrations/convertkit/sync
GET    /api/integrations/convertkit/tags
```

---

### 2.2 Mailchimp Integration

**Priority:** MEDIUM  
**Estimated Effort:** 1 week

#### Tasks
- [ ] OAuth connection flow
- [ ] Sync segments to Mailchimp audiences
- [ ] Import campaign performance data
- [ ] Create Mailchimp journey from sequence
- [ ] Handle merge fields (name, company, etc.)

#### API Endpoints
```
POST   /api/integrations/mailchimp/connect
DELETE /api/integrations/mailchimp/disconnect
POST   /api/integrations/mailchimp/sync
GET    /api/integrations/mailchimp/audiences
```

---

## 3. Data Sync Integrations

### 3.1 Google Sheets Integration

**Priority:** MEDIUM  
**Estimated Effort:** 1 week

#### Tasks
- [ ] Google OAuth for Sheets API
- [ ] Export leads to new Google Sheet
- [ ] Auto-sync scoring updates (real-time or scheduled)
- [ ] Two-way sync (manual Sheet edits → ConvertList)
- [ ] Column mapping UI (email, name, score, segment, status)
- [ ] Handle Google API rate limits
- [ ] Scheduled sync (daily/weekly)

#### API Endpoints
```
POST   /api/integrations/google/connect
DELETE /api/integrations/google/disconnect
POST   /api/integrations/google/export
POST   /api/integrations/google/sync
GET    /api/integrations/google/sheets
```

---

### 3.2 Airtable Integration

**Priority:** LOW  
**Estimated Effort:** 3-4 days

#### Tasks
- [ ] Airtable OAuth
- [ ] Export to Airtable base
- [ ] Sync lead status updates
- [ ] Map ConvertList fields to Airtable columns

---

## 4. Form/Survey Integrations

### 4.1 Typeform Webhooks

**Priority:** LOW  
**Estimated Effort:** 2-3 days

#### Tasks
- [ ] Webhook endpoint for Typeform submissions
- [ ] Auto-import Typeform responses as waitlist leads
- [ ] Map Typeform fields to Lead model
- [ ] Handle duplicate submissions

#### API Endpoint
```
POST /api/webhooks/typeform
```

---

### 4.2 Tally Webhooks

**Priority:** LOW  
**Estimated Effort:** 2-3 days

#### Tasks
- [ ] Webhook endpoint for Tally form submissions
- [ ] Auto-import as leads
- [ ] Enrichment survey integration

#### API Endpoint
```
POST /api/webhooks/tally
```

---

## 5. Bulk Export (Low Priority)

**Priority:** LOW (but frequently requested)  
**Estimated Effort:** 2-3 days

### Tasks
- [ ] Export all leads to CSV
- [ ] Export by segment (Hot/Warm/Cold)
- [ ] Export with scoring data (score, confidence, reason)
- [ ] Export with outreach history
- [ ] Export with status history
- [ ] Include custom fields from enrichment
- [ ] Background job for large exports (>1000 leads)
- [ ] Email download link when export ready

### API Endpoint
```
GET /api/leads/export?segment=hot&includeScore=true
```

---

## 6. Advanced Reply Detection (Enhancement)

**Priority:** MEDIUM  
**Estimated Effort:** 1 week

### Current (Phase 1)
- Email forwarding via Resend (zero cost)
- Basic reply detection (REPLIED status)

### Phase 2 Enhancements

#### Sentiment Analysis
- [ ] Classify reply sentiment (positive, neutral, negative)
- [ ] Detect interest level (high, medium, low)
- [ ] Auto-categorize replies:
  - Interested → mark as INTERESTED
  - Not now → mark as FOLLOW_UP_LATER
  - Wrong person → mark as INVALID
  - Unsubscribe → mark as UNSUBSCRIBED

#### Suggested Responses
- [ ] Generate suggested follow-up responses
- [ ] One-click reply from ConvertList
- [ ] Save response templates

#### Reply Threading
- [ ] Show full email thread in lead card
- [ ] Track reply count
- [ ] Time to first reply metric

### Implementation
```typescript
// Sentiment analysis using Gemini
const sentiment = await analyzeSentiment(replyText);
// Returns: { sentiment: 'positive', confidence: 0.87, category: 'interested' }
```

---

## 7. Additional Phase 2 Features

### 7.1 Bulk Actions

**Priority:** MEDIUM

#### Tasks
- [ ] Select multiple leads (checkboxes)
- [ ] Bulk status update (mark as Contacted)
- [ ] Bulk sequence assignment
- [ ] Bulk export selected leads
- [ ] Bulk delete

---

### 7.2 Filters & Sorting

**Priority:** MEDIUM

#### Tasks
- [ ] Filter by segment (Hot/Warm/Cold)
- [ ] Filter by status (UNCONTACTED/CONTACTED/REPLIED)
- [ ] Filter by score range
- [ ] Filter by source
- [ ] Sort by score (high to low)
- [ ] Sort by created date
- [ ] Sort by last activity

---

### 7.3 Saved Views

**Priority:** LOW

#### Tasks
- [ ] Save custom filter + sort combinations
- [ ] "Hot + Uncontacted" view
- [ ] "Replied + Interested" view
- [ ] Share views with team members

---

## Phase 2 Database Migrations

```prisma
// New models for integrations
model InstantlyAccount { ... }
model InstantlyCampaign { ... }
model LeadActivity { ... }

// New enums
enum ActivityType { ... }

// Existing Lead model updates
model Lead {
  // ... existing fields
  instantlyCampaignId String?
  instantlyCampaign   InstantlyCampaign? @relation(fields: [instantlyCampaignId], references: [id])
  activities          LeadActivity[]
}
```

---

## Phase 2 API Routes Summary

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/integrations/instantly/connect` | POST | OAuth initiation |
| `/api/integrations/instantly/status` | GET | Check connection |
| `/api/integrations/instantly/disconnect` | DELETE | Remove connection |
| `/api/integrations/instantly/sync` | POST | Sync leads to campaign |
| `/api/integrations/instantly/send` | POST | Send individual lead |
| `/api/integrations/instantly/send-bulk` | POST | Send segment |
| `/api/integrations/instantly/campaigns` | GET | List campaigns |
| `/api/webhooks/instantly` | POST | Instantly webhook |
| `/api/integrations/convertkit/connect` | POST | ConvertKit OAuth |
| `/api/integrations/convertkit/sync` | POST | Sync to ConvertKit |
| `/api/integrations/mailchimp/connect` | POST | Mailchimp OAuth |
| `/api/integrations/mailchimp/sync` | POST | Sync to Mailchimp |
| `/api/integrations/google/connect` | POST | Google OAuth |
| `/api/integrations/google/export` | POST | Export to Sheets |
| `/api/integrations/google/sync` | POST | Sync with Sheets |
| `/api/webhooks/typeform` | POST | Typeform webhook |
| `/api/webhooks/tally` | POST | Tally webhook |
| `/api/leads/export` | GET | Export leads |

---

## Phase 2 Timeline

### Sprint 1-2: Instantly Integration (Core)
- OAuth flow
- Campaign sync
- Automated sending
- Basic reply detection

### Sprint 3: Email Marketing Integrations
- ConvertKit
- Mailchimp

### Sprint 4: Data Sync
- Google Sheets
- Airtable

### Sprint 5: Form Integrations
- Typeform
- Tally

### Sprint 6: Advanced Features
- Sentiment analysis
- Suggested responses
- Bulk actions
- Filters & sorting

**Total Estimated Time:** 6 sprints (~3 months part-time)

---

## Phase 2 Success Metrics

- % users connecting Instantly
- Emails sent via Instantly (vs manual)
- Open rate improvement
- Reply rate improvement
- Time saved per outreach campaign
- User retention (Day 7, Day 30)

---

## Cost Analysis

| Service | Phase 1 Cost | Phase 2 Cost | Notes |
|---------|-------------|--------------|-------|
| Instantly | $0 | $47/mo | Only if using automated sending |
| Resend | $0 | $0-20/mo | Free tier may be sufficient |
| Google Sheets API | $0 | $0 | Free within quotas |
| ConvertKit | $0 | $0-29/mo | Free up to 1K subscribers |
| Mailchimp | $0 | $0-20/mo | Free tier available |

**Total Phase 2 Infrastructure Cost:** $47-116/mo (depending on integrations used)

**Recommended Pricing:**
- Pro: $9/mo (absorb Instantly cost for limited sends)
- Pro+: $29/mo (unlimited Instantly sends)
- Enterprise: Custom (all integrations included)

---

## Risks & Mitigation

### Risk: Instantly API Changes
**Mitigation:** Abstract Instantly behind internal API; easy to swap providers

### Risk: Email Deliverability Issues
**Mitigation:** Use Instantly's warmup feature; monitor bounce rates

### Risk: Integration Maintenance Burden
**Mitigation:** Start with Instantly only; add others based on user demand

### Risk: Cost Overrun
**Mitigation:** Pass Instantly cost to Pro+ tier; limit free tier sends

---

## Decision Framework

### Build vs Buy vs Partner

| Feature | Build | Buy/Partner | Decision |
|---------|-------|-------------|----------|
| Email Sending | ❌ (complex) | ✅ Instantly | Partner |
| Reply Detection | ⚠️ (basic) | ✅ Instantly | Hybrid (Phase 1 + Phase 2) |
| Email Marketing | ❌ (reinvent) | ✅ ConvertKit/Mailchimp | Partner |
| Data Export | ✅ (simple) | N/A | Build |
| Form Imports | ✅ (simple) | N/A | Build |

**Strategy:** Partner for complex infrastructure (email delivery), build for differentiation (scoring, workflows).

---

## Notes

- **Do not start Phase 2 until Phase 1 is validated** with 10+ paying customers
- **Instantly is the only must-have Phase 2 integration** - others are nice-to-have
- **Keep Phase 1 workflow working** even after Phase 2 launch (some users prefer manual)
- **Consider usage-based pricing** for Instantly sends (e.g., 100 sends/mo on Pro, unlimited on Pro+)

---

## Related Documents

- [TASKS.md](../TASKS.md) - Phase 1 task breakdown
- [mvp.md](../mvp.md) - Product requirements
- [build_plan.md](../build_plan.md) - Technical architecture

---

*Last updated: March 24, 2026*
