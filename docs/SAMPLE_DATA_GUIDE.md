# Sample Data for Testing ConvertList

This directory contains sample CSV files to test the waitlist conversion flow.

## Files

### `sample-waitlist.csv` (25 leads)
Full-featured sample with all fields populated:
- Mix of company domains and personal emails (gmail/outlook)
- Varied signup notes (urgent, vague, specific)
- Multiple sources (Product Hunt, Referral, Twitter, etc.)
- Recent and older signup dates

**Expected Scoring Distribution:**
- **Hot (≥60):** ~8-10 leads (company domains + urgent notes + recent)
- **Warm (35-59):** ~10-12 leads (mixed signals)
- **Cold (<35):** ~3-5 leads (personal emails, vague notes, older)

### `sample-small.csv` (3 leads)
Quick test file with minimal leads for fast iteration.

### `sample-emails-only.txt` (10 emails)
Test paste-mode with email-only input (one per line).

## How to Test

### 1. Upload CSV Flow
1. Go to `/upload`
2. Drag & drop `sample-waitlist.csv`
3. Review lead count preview
4. Click "Upload & Score"
5. Watch processing page (`/processing/[id]`)
6. View results at `/results/[id]`

### 2. Paste Emails Flow
1. Go to `/upload`
2. Switch to "Paste" tab
3. Copy contents of `sample-emails-only.txt`
4. Paste into textarea
5. Click "Upload & Score"

### 3. Test Deduplication
Upload the same CSV twice - second upload should skip duplicate emails.

### 4. Test Plan Limits
- **Free tier:** Upload 50+ leads → Should reject with upgrade prompt
- **Pro tier:** Upload 2000+ leads → Should reject
- **Pro+/Lifetime:** Unlimited

## Expected AI Scoring Behavior

### High Scores (Hot ≥60)
Leads that should score high:
- `sarah@acme.io` - Company domain (+20), specific pain (+20), recent (+20), PH launch (+7) = **~67**
- `rachel@growth.io` - Company domain (+20), urgent pain (+25), very recent (+20), referral (+15) = **~80**
- `jason@fintech.io` - Company domain (+20), funding pressure (+20), recent (+20), PH (+7) = **~67**

### Medium Scores (Warm 35-59)
- `john@gmail.com` - Gmail (+10), vague note (+5), recent (+20), unknown source (+5) = **~40**
- `tom@founder.co` - Company domain (+20), runway pain (+20), recent (+20), PH (+7) = **~67** (borderline Hot)

### Low Scores (Cold <35)
- `alex@tempmail.com` - Disposable domain (+2), "just browsing" (+0), older (+10), unknown (+5) = **~17**
- `jessica@tempmail.net` - Disposable (+2), "testing" (+0), old (+5), unknown (+5) = **~12**

## Sample Outreach Generation

After scoring, test outreach generation on any lead:
1. Go to `/results/[id]`
2. Click on a lead card
3. Click "Generate Outreach"
4. AI generates personalized subject + body based on signup note

Example output for `rachel@growth.io`:
```
Subject: Quick question about your client campaign

Body:
Hi Rachel,

Saw you mentioned needing to prioritize leads for a client campaign starting Monday. 
That timeline is tight!

ConvertList can help you identify the hottest 10% of your waitlist in minutes, 
so you can focus outreach on people most likely to convert.

Want to hop on a quick call to see if this fits your needs?

Best,
[Your Name]
```

## Testing Enrichment

1. Click any lead card
2. Click "Enrich"
3. Answer survey:
   - Urgency: High (+10)
   - Budget: $500-1000 (+8)
   - Role: Decision maker (+10)
   - Timeline: This week (+5)
4. Score should increase by +33 points

## Testing Status Updates

1. Click "Mark Contacted" on a lead
2. Status changes: UNCONTACTED → CONTACTED
3. Click "Mark Replied" → CONTACTED → REPLIED
4. Click "Mark Interested" → REPLIED → INTERESTED
5. Click "Mark Paid" → INTERESTED → PAID

Each change is logged in `LeadStatusHistory`.
