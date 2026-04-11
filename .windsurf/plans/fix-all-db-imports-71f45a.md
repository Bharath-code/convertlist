# Fix All Top-Level Database Imports

Fix all "Failed to collect page data" Vercel build errors by moving top-level database imports inside functions across the entire codebase.

## Root Cause
Next.js 15+ evaluates imported modules during build time. Any top-level code that:
- Imports `db` from `@/lib/db` (establishes database connection)
- Accesses environment variables
- Initializes external services (AI clients, Resend, etc.)

will fail during Vercel build because the build environment doesn't have access to production databases or environment variables.

## Files to Fix

### API Routes (Critical - These cause build failures)
1. `/src/app/api/leads/[id]/demo-script/route.ts` - Move db import inside GET
2. `/src/app/api/leads/[id]/enrich/route.ts` - Move db import inside POST
3. `/src/app/api/sequences/[id]/route.ts` - Move db import inside GET/DELETE
4. `/src/app/api/sequences/route.ts` - Move db import inside GET/POST
5. `/src/app/api/leads/[id]/status/route.ts` - Move db import inside PATCH
6. `/src/app/api/webhooks/email/reply/route.ts` - Move db import inside POST
7. `/src/app/api/webhooks/dodo/route.ts` - Move db import inside POST
8. `/src/app/api/leads/route.ts` - Move db import inside GET
9. `/src/app/api/waitlist/[id]/launch-timing/route.ts` - Move db import inside GET
10. `/src/app/api/waitlist/[id]/pricing/route.ts` - Move db import inside GET
11. `/src/app/api/waitlist/[id]/virality/route.ts` - Move db import inside GET
12. `/src/app/api/waitlist/[id]/status/route.ts` - Move db import inside GET
13. `/src/app/api/payments/checkout/route.ts` - Move db import inside POST
14. `/src/app/api/outreach/route.ts` - Move db import inside POST
15. `/src/app/api/me/route.ts` - Move db import inside GET
16. `/src/app/api/upload/route.ts` - Already fixed

### Server Pages (Lower Priority - May not cause build failures but should be fixed)
1. `/src/app/results/[id]/page.tsx` - Move db import inside async function
2. `/src/app/dashboard/page.tsx` - Move db import inside async function

### Library Files (Lower Priority - Not imported by API routes directly)
- Conversion tracking files
- AI library files (lookalike, etc.)

## Fix Pattern
For each file:
1. Remove top-level: `import { db } from "@/lib/db"`
2. Add inside the function that uses it: `const { db } = await import("@/lib/db")`
3. For files with multiple db usages, add the import at the start of each handler function

## Implementation Order
1. Fix API routes first (these cause build failures)
2. Fix server pages second
3. Skip library files (they're not imported by API routes during build)

## Verification
After fixing all API routes, run `npm run build` to verify no more "Failed to collect page data" errors.
