# Resend Inbound Email Setup Guide

This guide walks you through configuring Resend to handle inbound emails for reply detection.

## Overview

The Waitlist Conversion Assistant uses unique reply forwarder addresses to track when prospects respond to outreach emails. Each lead gets a unique address: `lead_{id}@reply.convertlist.ai`

When someone replies to this address, Resend forwards the email to our webhook endpoint, which automatically updates the lead's status to "REPLIED".

## Prerequisites

- Resend account with a verified domain (e.g., `convertlist.ai`)
- `RESEND_API_KEY` configured in your environment
- `RESEND_WEBHOOK_SECRET` configured in your environment

## Step 1: Configure DNS for Inbound Email

In your Resend dashboard, ensure your domain has the correct MX records configured:

```
MX 10 feedback-smtp.us-east-1.amazonses.com
MX 10 inbound-smtp.us-east-1.amazonses.com
```

## Step 2: Create Inbound Route

1. Go to your Resend dashboard → Domains → [Your Domain] → Inbound Routes
2. Click "Create Inbound Route"
3. Configure the route:

   - **Name**: Reply Detection
   - **Domain**: `reply.convertlist.ai` (or your domain)
   - **Regex**: `.*` (catch all)
   - **Forward to**: `https://your-domain.com/api/webhooks/resend/inbound`
   - **Strip replies**: false (we want the full thread)

4. Save the route

## Step 3: Configure Webhook Secret

1. In Resend dashboard, go to Settings → Webhooks
2. Create a new webhook or edit existing one
3. Copy the webhook secret
4. Add it to your `.env.local`:

   ```
   RESEND_WEBHOOK_SECRET=whsec_...
   ```

## Step 4: Test the Integration

### Test with a sample email

You can test the webhook using curl:

```bash
curl -X POST http://localhost:3000/api/webhooks/resend/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_123",
    "from": "test@example.com",
    "to": ["lead_test123@reply.convertlist.ai"],
    "subject": "Re: Your waitlist signup",
    "html": "<p>Thanks for reaching out!</p>",
    "text": "Thanks for reaching out!",
    "headers": {},
    "created_at": "2026-03-24T10:00:00.000Z"
  }'
```

### Expected Response

```json
{
  "success": true,
  "leadId": "test123",
  "from": "test@example.com",
  "subject": "Re: Your waitlist signup"
}
```

## How It Works

1. **Lead Import**: When a waitlist is processed, each lead gets a unique reply address generated: `lead_{id}@reply.convertlist.ai`

2. **Outreach**: When you send outreach emails, use the lead's reply forwarder address as the reply-to

3. **Reply Detection**: When the prospect replies:
   - Resend receives the email at `reply.convertlist.ai`
   - Resend forwards it to `/api/webhooks/resend/inbound`
   - The webhook extracts the lead ID from the address
   - Lead status is updated to "REPLIED"
   - Status history is logged

4. **Dashboard Update**: The lead now shows as "Replied" in your dashboard

## Reply Address Format

```
lead_{leadId}@reply.convertlist.ai
```

Example:
- Lead ID: `clxyz123456789`
- Reply Address: `lead_clxyz123456789@reply.convertlist.ai`

## Troubleshooting

### Webhook not firing

- Check that your domain's MX records are correctly configured
- Verify the inbound route regex matches the reply addresses
- Check Resend logs for any delivery failures

### Lead not found

- Ensure the lead ID in the reply address matches a lead in your database
- Check that the lead hasn't been deleted

### Signature verification failing

- Ensure `RESEND_WEBHOOK_SECRET` matches the one in your Resend dashboard
- The secret should start with `whsec_`

## Security

The webhook endpoint verifies the signature using HMAC SHA-256. This ensures that only legitimate emails from Resend are processed.

In development, signature verification is optional (skipped if no secret is configured). In production, always configure the webhook secret.

## Next Steps

- Set up Instantly integration for Phase 2 (advanced reply detection)
- Add email notification when a lead replies (via Inngest)
- Implement email threading to show the full conversation
