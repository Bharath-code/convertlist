# Deployment Guide: ConvertList to Vercel

This guide walks you through deploying ConvertList to Vercel, including database setup, Prisma configuration, and authentication.

---

## Prerequisites

- Vercel account (free)
- GitHub account
- Node.js 18+ installed locally

---

## Step 1: Set Up Database

### Option A: Neon (Recommended - Free Tier)

Neon is a serverless PostgreSQL database that's easy to set up and integrates well with Vercel.

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project:
   - Click "Create a project"
   - Choose a region closest to your users
   - Copy the **Connection String** (format: `postgresql://user:password@host/database?sslmode=require`)

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to Settings → Database
4. Copy the **Connection String** from the Connection info section

---

## Step 2: Configure Prisma

Prisma is an ORM (Object-Relational Mapping) tool that lets you interact with your database using TypeScript instead of SQL.

### How Prisma Works

1. **Schema (`prisma/schema.prisma`)**: Defines your database models in TypeScript
2. **Client (`@prisma/client`)**: Auto-generated TypeScript types and database access methods
3. **Migrations**: SQL files that update your database schema
4. **Prisma Studio**: Visual database editor (run with `npx prisma studio`)

### Configure Database Connection

1. Open `.env` file in your project root:
```bash
# Replace with your database connection string
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

2. Test the connection:
```bash
npx prisma db push
```
This pushes your schema to the database without creating a migration file (good for initial setup).

---

## Step 3: Run Database Migrations

Since you have schema changes for enrichment, clustering, and demo scripts, you need to create and apply migrations.

```bash
# Create a migration
npx prisma migrate dev --name add_enrichment_and_clustering_fields

# Or if you want to reset (WARNING: deletes all data)
npx prisma migrate reset
```

This will:
1. Create a new migration file in `prisma/migrations/`
2. Apply it to your database
3. Regenerate the Prisma client

---

## Step 4: Set Up Authentication

### Option A: Clerk (Recommended - Easiest)

Clerk provides complete authentication out of the box.

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the API keys from your dashboard

Install Clerk:
```bash
npm install @clerk/nextjs
```

Update `.env`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

Wrap your app in `app/layout.tsx`:
```tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### Option B: NextAuth.js (More Control)

1. Install NextAuth:
```bash
npm install next-auth @auth/prisma-adapter
```

2. Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Add Google, GitHub, etc.
  ],
})
```

---

## Step 5: Configure Environment Variables for Vercel

Create a `.env.local` file locally with all required variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Clerk (if using)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Inngest (if using)
INNGEST_SIGNING_KEY=signing_key_here
INNGEST_EVENT_KEY=event_key_here

# Google Gemini AI (for 10X features)
GEMINI_API_KEY=your_gemini_api_key

# Clearbit (for enrichment)
CLEARBIT_API_KEY=your_clearbit_key
```

---

## Step 6: Deploy to Vercel

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Click "Deploy"

### 3. Add Environment Variables in Vercel

1. Go to your project Settings → Environment Variables
2. Add all the variables from `.env.local`:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `INNGEST_SIGNING_KEY`
   - `INNGEST_EVENT_KEY`
   - `GEMINI_API_KEY`
   - `CLEARBIT_API_KEY`

### 4. Redeploy

After adding environment variables, trigger a new deployment from the Vercel dashboard.

---

## Step 7: Run Migrations on Production

After deployment, you need to apply migrations to your production database:

```bash
# From your local machine, pointing to production database
DATABASE_URL="your_production_db_url" npx prisma migrate deploy
```

Or use Vercel CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

---

## Step 8: Set Up Inngest (For Background Jobs)

Inngest is used for the enrichment and clustering background jobs.

1. Sign up at [inngest.com](https://inngest.com)
2. Create a new app
3. Copy the signing key and event key
4. Add them to Vercel environment variables

Deploy the Inngest functions:
```bash
npx inngest-cli dev
```

For production, Inngest will automatically connect when you deploy.

---

## Troubleshooting

### Database Connection Issues

- Ensure your database allows connections from Vercel's IP ranges
- Check that `sslmode=require` is in your connection string
- Verify the database URL format is correct

### Migration Errors

- If migrations fail, try `npx prisma migrate reset` (deletes all data)
- Or manually check your database schema matches `prisma/schema.prisma`

### Authentication Not Working

- Verify environment variables are set in Vercel
- Check that Clerk/NextAuth is properly configured in your app
- Ensure your middleware is set up correctly

### 10X Features Not Working

- Verify `GEMINI_API_KEY` is set
- Check that Inngest keys are correct
- Ensure database migrations have been applied

---

## Quick Start Checklist

- [ ] Set up PostgreSQL database (Neon/Supabase)
- [ ] Configure DATABASE_URL in .env
- [ ] Run `npx prisma db push` or `npx prisma migrate dev`
- [ ] Set up authentication (Clerk/NextAuth)
- [ ] Add all environment variables to .env.local
- [ ] Push code to GitHub
- [ ] Import project to Vercel
- [ ] Add environment variables to Vercel
- [ ] Deploy to Vercel
- [ ] Run `npx prisma migrate deploy` for production
- [ ] Set up Inngest
- [ ] Test the deployed application

---

## Cost Estimate (Free Tier)

- **Vercel**: Free (hobby plan)
- **Neon Database**: Free (512MB storage, 1 compute hour/day)
- **Clerk**: Free (up to 10,000 MAU)
- **Inngest**: Free (up to 50,000 events/month)
- **Google Gemini**: Free tier available

Total: $0/month for MVP
