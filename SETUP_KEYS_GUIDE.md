# ConvertList - Environment Keys Setup Guide

Complete guide to obtaining and configuring all required API keys and environment variables.

---

## Quick Start: Minimum Keys for Local Development

To run the app locally with **core features only**, you need these 4 keys:

```env
# 1. Clerk (Auth) - REQUIRED
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# 2. Database (PlanetScale) - REQUIRED
DATABASE_URL=mysql://username:password@host/database?sslaccept=strict

# 3. Google Gemini (AI Scoring) - REQUIRED
GEMINI_API_KEY=...

# 4. Inngest (Background Jobs) - REQUIRED for scoring
INNGEST_EVENT_KEY=...
```

**Optional for MVP:**
- Resend (email reply detection) - Can skip initially
- DodoPayments (payments) - Can skip initially

---

## Complete Environment Template

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in all values:

```env
# ============================================
# CLERK - Authentication (REQUIRED)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# ============================================
# DATABASE - PlanetScale MySQL (REQUIRED)
# ============================================
DATABASE_URL="mysql://username:password@host.aws.planetscale.com/database?sslaccept=strict"

# ============================================
# INNGEST - Background Jobs (REQUIRED)
# ============================================
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_DEV_SERVER_URL=http://localhost:8288

# ============================================
# GOOGLE GEMINI - AI Scoring (REQUIRED)
# ============================================
GEMINI_API_KEY=your_gemini_api_key_here

# ============================================
# RESEND - Email Reply Detection (OPTIONAL)
# ============================================
RESEND_API_KEY=re_your_resend_key_here
RESEND_FROM_EMAIL=hello@convertlist.ai
RESEND_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# ============================================
# DODOPAYMENTS - Payment Processing (OPTIONAL)
# ============================================
DODO_WEBHOOK_SECRET=dodo_webhook_secret_here
DODO_PRICE_ID_PRO=price_pro_monthly
DODO_PRICE_ID_PRO_PLUS=price_pro_plus_monthly
DODO_PRICE_ID_LIFETIME=price_lifetime

# ============================================
# APP CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 1. Clerk Authentication (REQUIRED)

**Why needed:** User authentication, sign-up, sign-in, session management.

**Cost:** Free up to 10,000 monthly active users.

### How to get keys:

1. Go to [https://clerk.com](https://clerk.com)
2. Click "Sign Up" (use Google or email)
3. Create a new application:
   - Name: `ConvertList`
   - Select "Email + Password" and "Google" as auth methods
4. Go to **API Keys** in the left sidebar
5. Copy the keys:
   - **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`

**Example:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
```

**Setup time:** 5 minutes

---

## 2. PlanetScale Database (REQUIRED)

**Why needed:** MySQL database to store users, waitlists, leads, sequences.

**Cost:** Free tier includes 5GB storage, 1 billion row reads/month.

### How to get connection string:

1. Go to [https://planetscale.com](https://planetscale.com)
2. Sign up with GitHub
3. Click "Create Database"
   - Name: `convertlist`
   - Region: Choose closest to you (e.g., `us-east`)
4. Click "Connect" → Select "Prisma" → Copy connection string
5. Add your database name to the URL

**Example:**
```env
DATABASE_URL="mysql://bharath:password123@aws.connect.psdb.cloud/convertlist?sslaccept=strict"
```

**Alternative:** Use any MySQL database (local MySQL, AWS RDS, etc.)

**Setup time:** 5 minutes

### Initialize Prisma Schema:

```bash
# After getting DATABASE_URL
npx prisma db push
```

This creates all tables (User, Waitlist, Lead, Sequence, etc.)

---

## 3. Google Gemini AI (REQUIRED)

**Why needed:** AI scoring of leads based on signup notes, intent classification.

**Cost:** FREE tier includes:
- 15 requests per minute
- 1,000 requests per day
- 250,000 tokens per minute
- No credit card required

### How to get API key:

1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

**Example:**
```env
GEMINI_API_KEY=AIzaSyA1234567890abcdefghijklmnop
```

**Setup time:** 2 minutes

### Test the key:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=YOUR_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

---

## 4. Inngest Background Jobs (REQUIRED)

**Why needed:** Background processing for AI scoring (batches of 50 leads).

**Cost:** Free for development and up to 10,000 step runs/month.

### How to get keys:

1. Go to [https://www.inngest.com](https://www.inngest.com)
2. Click "Get Started" → Sign up with GitHub
3. Create a new app:
   - Name: `ConvertList`
4. Go to **Settings** → Copy the **Event Key**

**Example:**
```env
INNGEST_EVENT_KEY=1234567890abcdef
```

### Run Inngest Dev Server (Local Development):

```bash
# Install globally
npm install -g inngest-cli

# Start dev server
inngest dev

# Or use npx
npx inngest-cli@latest dev
```

The dev server runs at `http://localhost:8288`

**For production:**
- Deploy functions: `npx inngest-cli@latest deploy`
- Use production event key from Inngest dashboard

**Setup time:** 5 minutes

---

## 5. Resend Email (OPTIONAL for MVP)

**Why needed:** Inbound email parsing for reply detection. When prospects reply to outreach, Resend forwards emails to your webhook.

**Cost:** Free tier includes 100 emails/day, 3,000 emails/month.

### How to get API key:

1. Go to [https://resend.com](https://resend.com)
2. Sign up with GitHub
3. Add and verify your domain:
   - Go to **Domains** → "Add Domain"
   - Enter: `convertlist.ai` (or your domain)
   - Add DNS records to your domain registrar
4. Once verified, go to **API Keys** → Copy the key

**Example:**
```env
RESEND_API_KEY=re_your_resend_key_here
RESEND_FROM_EMAIL=hello@convertlist.ai
```

### Configure Inbound Route:

1. Go to **Domains** → Your domain → **Inbound Routes**
2. Click "Create Inbound Route"
   - Name: `Reply Detection`
   - Domain: `reply.convertlist.ai` (or your domain)
   - Regex: `.*`
   - Forward to: `https://your-domain.com/api/webhooks/resend/inbound`
3. Copy the webhook secret → `RESEND_WEBHOOK_SECRET`

**Example:**
```env
RESEND_WEBHOOK_SECRET=whsec_1234567890abcdef
```

**Setup time:** 15 minutes (includes DNS propagation)

---

## 6. DodoPayments (OPTIONAL for MVP)

**Why needed:** Payment processing for Pro/Pro+/Lifetime tiers.

**Cost:** 5% transaction fee on free plan, custom pricing for higher tiers.

### How to get keys:

1. Go to [https://dodopayments.com](https://dodopayments.com)
2. Sign up for an account
3. Create products in dashboard:
   - **Pro** - $9/month
   - **Pro+** - $29/month
   - **Lifetime** - $49 one-time
4. Go to **Settings** → **API Keys** → Copy webhook secret
5. Copy price IDs from your products

**Example:**
```env
DODO_WEBHOOK_SECRET=dodo_whsec_1234567890abcdef
DODO_PRICE_ID_PRO=price_pro_monthly_abc123
DODO_PRICE_ID_PRO_PLUS=price_pro_plus_monthly_def456
DODO_PRICE_ID_LIFETIME=price_lifetime_ghi789
```

### Configure Webhook:

1. Go to **Developers** → **Webhooks** → "Add Endpoint"
2. URL: `https://your-domain.com/api/webhooks/dodo`
3. Events to subscribe:
   - `payment.completed`
   - `subscription.activated`
4. Copy the signing secret → `DODO_WEBHOOK_SECRET`

**Setup time:** 20 minutes

---

## Verification Checklist

After configuring all keys, verify each service:

### 1. Clerk
```bash
# Check if auth works
curl -H "Authorization: Bearer YOUR_CLERK_KEY" \
  https://api.clerk.com/v1/me
```

### 2. Database
```bash
# Test Prisma connection
npx prisma db pull
```

### 3. Gemini
```bash
# Test AI API
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Test"}]}]}'
```

### 4. Inngest
```bash
# Start dev server
inngest dev
# Should see: ✓ Inngest Dev Server ready
```

### 5. Resend (if configured)
```bash
# Test email API
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"hello@convertlist.ai","to":"test@example.com","subject":"Test","html":"Test email"}'
```

---

## Local Development Setup (Step-by-Step)

### Option A: Minimal Setup (15 minutes)

For testing core features without email/payments:

```bash
# 1. Clone and install
git clone <repo>
cd convertlist
npm install

# 2. Copy env template
cp .env.example .env.local

# 3. Get Clerk keys (5 min)
# - Go to clerk.com → Create app → Copy keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# 4. Get PlanetScale connection (5 min)
# - Go to planetscale.com → Create database → Copy URL
DATABASE_URL="mysql://..."

# 5. Get Gemini key (2 min)
# - Go to aistudio.google.com/apikey → Create key
GEMINI_API_KEY=...

# 6. Get Inngest key (3 min)
# - Go to inngest.com → Create app → Copy event key
INNGEST_EVENT_KEY=...

# 7. Push Prisma schema
npx prisma db push

# 8. Start Inngest dev server (new terminal)
npx inngest-cli@latest dev

# 9. Start Next.js dev server
npm run dev
```

Open `http://localhost:3000`

### Option B: Full Setup (45 minutes)

For production-ready setup with email and payments:

1. Complete Option A steps (15 min)
2. Add Resend (15 min)
   - Verify domain
   - Configure inbound route
   - Set up webhook
3. Add DodoPayments (15 min)
   - Create products
   - Configure webhook endpoint

---

## Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add all environment variables in Vercel dashboard
5. Deploy

### Environment Variables for Production

```env
# Use production URLs
NEXT_PUBLIC_APP_URL=https://convertlist.ai

# Use production Inngest
INNGEST_DEV_SERVER_URL=  # Leave empty for production
```

### Post-Deployment

1. Update Inngest functions:
   ```bash
   npx inngest-cli@latest deploy
   ```

2. Update Resend webhook URL to production domain

3. Update DodoPayments webhook URL to production domain

---

## Troubleshooting

### "Invalid API key" errors

- Check for extra spaces in `.env.local`
- Ensure keys are quoted if they contain special characters
- Restart dev server after changing `.env.local`

### Database connection errors

- Verify PlanetScale database is not paused
- Check SSL certificate acceptance in connection string
- Ensure database name is correct

### Inngest functions not registering

- Make sure dev server is running: `inngest dev`
- Check `INNGEST_DEV_SERVER_URL` points to `http://localhost:8288`
- Restart Next.js dev server

### AI scoring fails

- Verify Gemini API key is valid
- Check rate limits (15 RPM free tier)
- Ensure signup notes exist for intent classification

---

## Cost Summary

| Service | Free Tier | Paid Tier (when needed) |
|---------|-----------|------------------------|
| Clerk | 10K MAU | $25/mo for 50K MAU |
| PlanetScale | 5GB, 1B reads | $29/mo for 50GB |
| Gemini | 250K tokens/min | Pay-as-you-go |
| Inngest | 10K step runs | $49/mo for 100K |
| Resend | 3K emails/mo | $20/mo for 50K |
| DodoPayments | 5% fee | Custom pricing |

**Total for MVP:** $0/month (all free tiers)

**Total at scale (10K users):** ~$150-200/month

---

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use different keys for dev/prod** - Create separate Clerk apps
3. **Rotate webhook secrets** - Update periodically
4. **Enable 2FA** - On all service accounts
5. **Limit API key permissions** - Use minimal scopes

---

## Support

- Clerk: [docs.clerk.com](https://docs.clerk.com)
- PlanetScale: [planetscale.com/docs](https://planetscale.com/docs)
- Gemini: [ai.google.dev](https://ai.google.dev)
- Inngest: [inngest.com/docs](https://inngest.com/docs)
- Resend: [resend.com/docs](https://resend.com/docs)
- DodoPayments: [dodopayments.com/docs](https://dodopayments.com/docs)
