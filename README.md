# ConvertList — Waitlist Conversion Assistant

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-green?logo=prisma)](https://www.prisma.io)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6c47ff?logo=clerk)](https://clerk.com)

**Convert waitlist signups into paying customers with AI-powered lead scoring, segmentation, and outreach generation.**

A decision-support workflow tool for indie founders, solo dev founders, and AI tool builders launching SaaS products. Not a CRM, not an email sender—just focused help on **who to contact first** and **what to say**.

![Dashboard Preview](./docs/preview.png)

---

## 🎯 What It Does

ConvertList helps you move from **waitlist → conversation → conversion** by:

1. **Analyzing your waitlist** — Upload CSV or paste emails, get instant lead scores (0-100) with confidence levels
2. **Segmenting leads** — Automatically categorize into 🔥 Hot, 🌤 Warm, and ❄ Cold leads
3. **Generating outreach** — AI-powered personalized messages for each segment with 3-5 step email sequences
4. **Tracking conversions** — Monitor contacted → replied → interested → paid pipeline
5. **Detecting replies** — Zero-cost email forwarding setup to auto-detect responses

### Key Philosophy

> This is a **decision-support workflow tool**, not a magical AI predictor. It reduces uncertainty and improves launch execution by helping you focus effort where conversion likelihood is higher.

---

## ✨ Features

### Core Features (MVP)

- **CSV Upload & Email Paste** — Flexible import with graceful handling of missing data
- **AI Lead Scoring** — Gemini-powered scoring with signals: domain quality, intent, recency, source
- **Confidence Indicators** — Every score shows High/Medium/Low confidence with plain English reasoning
- **Smart Segmentation** — Automatic Hot/Warm/Cold categorization with minimum signal logic
- **Outreach Generator** — Personalized messages for initial contact, follow-ups, and re-engagement
- **Email Sequences** — 3-5 step automated sequences with timing suggestions
- **Reply Detection** — Zero-cost email forwarding approach (no SMTP setup required)
- **Conversion Tracker** — Visual pipeline from contacted to paid
- **Lead Enrichment** — Micro-survey generation to collect urgency signals

### Coming Soon (Phase 2+)

- Instantly.ai integration for automated cold email sending
- ConvertKit & Mailchimp integrations
- Google Sheets sync
- Reply sentiment analysis
- Campaign analytics & conversion funnel metrics
- Proprietary intent prediction model

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or pnpm
- Git

### Required Accounts & Keys

| Service | Purpose | Get Keys |
|---------|---------|----------|
| **Clerk** | Authentication | [dashboard.clerk.com](https://dashboard.clerk.com) |
| **Neon** | PostgreSQL Database | [neon.tech](https://neon.tech) |
| **Inngest** | Background Jobs | [app.inngest.com](https://app.inngest.com) |
| **Google AI Studio** | Lead Scoring (Gemini) | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

### Optional Services

| Service | Purpose | Get Keys |
|---------|---------|----------|
| **Resend** | Email Reply Detection | [resend.com](https://resend.com) |
| **Instantly.ai** | Cold Email Sending | [instantly.ai](https://instantly.ai) |
| **Clearbit** | Lead Enrichment | [clearbit.com](https://clearbit.com) |
| **DodoPayments** | Payment Processing | [dodopayments.com](https://dodopayments.com) |

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/convertlist.git
cd convertlist

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Set up your database
npm run db:push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📋 Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon PostgreSQL Database
DATABASE_URL="postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require"

# Inngest Background Jobs
INNGEST_EVENT_KEY=...
INNGEST_DEV_SERVER_URL=http://localhost:8288

# Google Gemini AI (Lead Scoring)
GEMINI_API_KEY=...
```

### Optional

```bash
# Resend - Email Reply Detection
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=hello@convertlist.ai
RESEND_WEBHOOK_SECRET=whsec_...

# Instantly.ai - Cold Email Sending
INSTANTLY_API_KEY=...

# Clearbit - Lead Enrichment
CLEARBIT_API_KEY=...

# DodoPayments - Payment Processing
DODO_WEBHOOK_SECRET=...
DODO_PRICE_ID_PRO=price_pro_monthly
DODO_PRICE_ID_PRO_PLUS=price_pro_plus_monthly
DODO_PRICE_ID_LAUNCH=price_launch_monthly

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See [`docs/SETUP_KEYS_GUIDE.md`](docs/SETUP_KEYS_GUIDE.md) for detailed setup instructions.

---

## 🛠 Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend + Backend** | Next.js 16.2 | App Router, Turbopack |
| **Language** | TypeScript 5 | Type-safe throughout |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **UI Components** | Base UI, shadcn | Accessible components |
| **Animations** | Framer Motion | Smooth transitions |
| **Authentication** | Clerk | Magic link auth |
| **Database** | Neon PostgreSQL | Serverless Postgres |
| **ORM** | Prisma 5.22 | Type-safe queries |
| **Background Jobs** | Inngest | Reliable job queues |
| **AI** | Gemini 2.5 Flash-Lite | Free tier: 15 RPM, 1M context |
| **Email** | Resend | Transactional + inbound |
| **Payments** | DodoPayments | Subscription management |
| **Hosting** | Vercel | Deploy in seconds |
| **Testing** | Vitest | Fast unit testing |

---

## 📊 How Lead Scoring Works

Each lead receives a score (0-100) based on multiple signals:

### Scoring Signals

| Signal | Weight | Description |
|--------|--------|-------------|
| **Domain Quality** | 0-25 | Company domain (+20), Gmail/Outlook (+10), disposable (+2) |
| **Intent Signal** | 0-30 | AI classification of signup note: urgent pain (+25-30), specific use case (+15-25), vague (+5-10) |
| **Recency** | 0-20 | <7 days (+20), <30 days (+15), <90 days (+10), older (+5) |
| **Source** | 0-15 | Referral (+15), niche community (+10), launch platform (+7), unknown (+5) |

### Confidence Levels

- **High Confidence** — Multiple strong signals present
- **Medium Confidence** — Some signals, moderate certainty
- **Low Confidence** — Only email available (score capped at 55)

### Example Output

```
Score: 74
Confidence: High
Reason: Recent signup + strong problem description + company domain
```

---

## 📁 Project Structure

```
convertlist/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Authentication pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── processing/   # Lead processing status
│   │   ├── results/      # Segmentation results
│   │   ├── pricing/      # Pricing page
│   │   └── api/          # API routes
│   ├── components/       # Reusable React components
│   ├── lib/              # Utilities & helpers
│   └── server/           # Server actions & business logic
├── prisma/
│   └── schema.prisma     # Database schema
├── docs/                 # Documentation
│   ├── architecture.md   # System architecture
│   ├── mvp.md            # MVP requirements
│   └── SETUP_KEYS_GUIDE.md
├── public/               # Static assets
├── .env.example          # Environment template
└── package.json          # Dependencies
```

---

## 🧪 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Push Prisma schema to database
npm run db:push

# Open Prisma Studio
npm run db:studio
```

---

## 📖 Documentation

Detailed guides are available in the [`docs/`](docs/) directory:

- **[Architecture](docs/architecture.md)** — System design and data flow
- **[MVP Requirements](docs/mvp.md)** — Product requirements and features
- **[Setup Keys Guide](docs/SETUP_KEYS_GUIDE.md)** — How to get all API keys
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** — Production deployment steps
- **[Design System](docs/DESIGN_SYSTEM.md)** — UI/UX guidelines
- **[Cold Email Outreach Plan](docs/COLD_EMAIL_OUTREACH_PLAN.md)** — Best practices
- **[Product Hunt Launch Plan](docs/PRODUCT_HUNT_LAUNCH_PLAN.md)** — Launch strategy

---

## 💰 Pricing

### Free Tier
- Up to 50 leads
- Basic scoring & segmentation
- Manual outreach tracking

### Pro — $9/month
- Up to 2,000 leads
- 3-step email sequences
- Basic reply detection
- Priority support

### Pro+ — $29/month
- Unlimited leads
- 5-step email sequences
- Inbound email reply detection
- Instantly.ai integration (Phase 2)
- Advanced analytics

### Lifetime Deal — $49 (Launch Special)
- All Pro+ features
- One-time payment
- Early adopter badge

---

## 🎯 Target Users

- Indie hackers launching SaaS products
- AI tool founders with waitlists
- Solo dev founders
- Chrome extension builders
- Typical waitlist size: 50–3,000 leads

---

## 🔒 Security & Privacy

- **Encrypted data storage** — All sensitive data encrypted at rest
- **GDPR compliant** — Delete functionality built-in
- **Rate limiting** — Abuse prevention on all endpoints
- **Secure authentication** — Clerk-powered magic link auth
- **No data sharing** — Your waitlist data stays yours

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Clerk](https://clerk.com) for authentication
- [Neon](https://neon.tech) for serverless PostgreSQL
- [Inngest](https://inngest.com) for background jobs
- [Google AI](https://ai.google) for Gemini models
- [Resend](https://resend.com) for email infrastructure
- [Vercel](https://vercel.com) for hosting

---

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/convertlist/issues)
- **Email**: support@convertlist.ai
- **Twitter**: [@convertlist](https://twitter.com/convertlist)

---

## 🚀 Roadmap

### Phase 1 (Current)
- ✅ AI lead scoring with confidence levels
- ✅ Smart segmentation (Hot/Warm/Cold)
- ✅ Outreach message generation
- ✅ Email sequences (3-5 steps)
- ✅ Zero-cost reply detection via email forwarding
- ✅ Conversion tracker pipeline

### Phase 2 (Next)
- ⏳ Instantly.ai integration for automated sending
- ⏳ ConvertKit & Mailchimp integrations
- ⏳ Google Sheets sync
- ⏳ Reply sentiment analysis

### Phase 3 (Future)
- 📅 Campaign analytics dashboard
- 📅 Conversion funnel metrics
- 📅 Proprietary intent prediction model
- 📅 Multi-launch history tracking
- 📅 Pricing optimization suggestions

---

**Built with ❤️ for indie founders by indie founders**

*Turn your waitlist into revenue.*
