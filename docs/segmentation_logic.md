# Waitlist Conversion Assistant — Segmentation Logic

## Goal

Prioritize which waitlist leads founders should contact first to maximize early conversions.

This is NOT predictive destiny scoring.
This is decision-support prioritization.

---

## Required Input Fields

Minimum:

* email
* signup_note (optional)
* source (optional)
* created_at

---

## Scoring Model (v1)

### 1. Domain Score (0–25)

* Company / custom domain → +20
* Gmail / Outlook → +10
* Disposable email → +2

---

### 2. Intent Score (0–30)

Use AI NLP classification.

* Strong pain / urgency → +25 to +30
* Specific use case → +15 to +25
* Generic curiosity → +5 to +10
* Empty → 0

---

### 3. Recency Score (0–20)

* Joined < 7 days → +20
* Joined < 30 days → +15
* Joined < 90 days → +10
* Older → +5

---

### 4. Source Score (0–15)

* Referral / personal invite → +15
* Niche community → +10
* Product Hunt / launch site → +7
* Unknown → +5

---

### 5. Bonus Signals (Future)

* Email opened → +5
* Replied → +15
* Clicked CTA → +10

---

## Final Score

Total = sum of all signals (max 100)

---

## Segmentation

* 🔥 Hot → 70+
* 🌤 Warm → 40–69
* ❄ Cold → <40

---

## Trust Layer (Very Important)

Always show reason:

Example:
"Strong signup intent + recent join + niche referral"
