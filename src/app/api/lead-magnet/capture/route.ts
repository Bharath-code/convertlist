import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';

/**
 * Lead Magnet Email Capture API
 * 
 * Handles email capture and delivery for lead magnets:
 * - CHECKLIST: Waitlist Scoring Checklist
 * - EMAIL_TEMPLATES: 10 Cold Email Templates
 * - PLAYBOOK: Complete Waitlist Conversion Playbook
 */

interface LeadMagnetRequest {
  email: string;
  magnetType: 'CHECKLIST' | 'EMAIL_TEMPLATES' | 'PLAYBOOK';
  name?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

const LEAD_MAGNET_CONTENT = {
  CHECKLIST: {
    subject: "Your Waitlist Scoring Checklist",
    title: "Waitlist Scoring Checklist",
    content: `
# Waitlist Scoring Checklist

Score your waitlist in 5 minutes using this simple framework.

## 1. Domain Quality Check
- Company email domain: +20 points
- Personal email: +10 points
- Disposable/temporary email: +2 points
- University/educational domain: +15 points

## 2. Intent Signal Analysis
- Urgent pain point mentioned: +25-30 points
- Specific use case described: +15-25 points
- Vague interest: +5-10 points
- No signup note: +0 points

## 3. Recency Scoring
- Within 7 days: +20 points
- Within 30 days: +15 points
- Within 90 days: +10 points
- 90+ days ago: +5 points

## 4. Source Quality
- Referral from existing user: +20 points
- Product Hunt/launch platform: +15 points
- Social media: +10 points
- Cold signup from website: +5 points
- Unknown source: +0 points

## Score Ranges
- Hot (60-90): 20%+ reply rate
- Warm (35-59): 8-15% reply rate
- Cold (0-34): 2-5% reply rate

## Action Items
1. Calculate total score (0-90)
2. Segment: Hot (60+), Warm (35-59), Cold (<35)
3. Prioritize Hot leads first
4. Create personalized emails for top 20

Want to automate this? ConvertList scores every lead automatically. Score 25 leads free → convertlist.app
    `,
  },
  EMAIL_TEMPLATES: {
    subject: "10 Cold Email Templates for Waitlist Conversion",
    title: "10 Cold Email Templates",
    content: `
# 10 Cold Email Templates for Waitlist Conversion

Copy-paste templates that hit 20%+ reply rates.

## Initial Outreach Templates

### Template 1: For Hot Leads with Urgent Pain Points
Subject: Quick question about {{pain_point}}

Hi {{name}},

I saw you signed up for {{your_product}} and mentioned you're struggling with {{pain_point}}.

I built {{your_product}} specifically to help founders solve this. Here's how it can help with {{pain_point}}:

- {{benefit_1}}
- {{benefit_2}}
- {{benefit_3}}

Would you be open to a 15-minute demo to see if it's a fit?

Best,
{{your_name}}

### Template 2: For Warm Leads with Specific Use Cases
Subject: {{your_product}} for {{company_name}}

Hi {{name}},

Thanks for joining the {{your_product}} waitlist!

I noticed you mentioned {{use_case}} at {{company_name}}. We've helped several companies in {{industry}} improve their {{metric}} by {{percentage}}%.

Would you like to try it out? I can set you up with a free trial.

Cheers,
{{your_name}}

## Follow-Up Templates

### Follow-Up 1 (48 Hours Later)
Subject: Any thoughts?

Hi {{name}},

Just wanted to follow up on my previous email about {{your_product}}.

I know you're busy, but I wanted to make sure you didn't miss this. {{your_product}} can help with {{pain_point}}.

Would 10 minutes work for a quick chat?

Best,
{{your_name}}

### Follow-Up 2 (Value-Add)
Subject: How {{similar_company}} achieved {{result}}

Hi {{name}},

I wanted to share a quick story. {{similar_company}} was facing {{pain_point}}. They used {{your_product}} and achieved {{result}}.

Would you like to see how {{your_product}} could help {{company_name}} achieve similar results?

Best,
{{your_name}}

Want to automate this? ConvertList generates personalized emails for every lead. Score 25 leads free → convertlist.app
    `,
  },
  PLAYBOOK: {
    subject: "The Complete Waitlist Conversion Playbook",
    title: "Waitlist Conversion Playbook",
    content: `
# The Complete Waitlist Conversion Playbook

From 2% to 20%: How to convert your waitlist into paying customers.

## Table of Contents
1. Introduction
2. Understanding Your Waitlist
3. Lead Scoring Framework
4. Segmentation Strategy
5. Personalized Outreach
6. Follow-Up Sequences
7. Pipeline Management

## Introduction

Most founders email their entire waitlist and get 2% replies.

The problem isn't their email copy. The problem is they're treating every lead the same.

We've helped founders hit 20%+ reply rates by scoring their waitlist, segmenting by conversion likelihood, and focusing on Hot leads first.

## Understanding Your Waitlist

Your waitlist isn't a monolith. It's a mix of:
- Hot leads: Urgent pain, ready to buy now
- Warm leads: Interested, but timing isn't right
- Cold leads: Browsing, low intent, or already solved the problem

Treating them all the same is the #1 mistake founders make.

## Lead Scoring Framework

The 4 signals that predict conversion:

1. Domain Quality (up to 25 points)
2. Intent from Signup Note (up to 30 points)
3. Recency (up to 20 points)
4. Source (up to 15 points)

Total score: 0-90 points.

Hot (60+), Warm (35-59), Cold (<35).

## Segmentation Strategy

Hot leads: Reach out within 24 hours, offer immediate solution
Warm leads: Reach out within 1 week, share case studies
Cold leads: Add to nurture sequence, send monthly updates

## Personalized Outreach

Generic emails get 2% replies.
Personalized emails get 20%+ replies.

Key: Reference their specific pain point, mention their company, offer solution to their specific problem.

## Next Steps

1. Score your waitlist using the framework
2. Segment into Hot, Warm, and Cold
3. Email Hot leads first
4. Track results and iterate

Want to automate this? ConvertList scores every lead automatically. Score 25 leads free → convertlist.app
    `,
  },
};

export async function POST(req: Request) {
  try {
    const body: LeadMagnetRequest = await req.json();
    const { email, magnetType, name, utmSource, utmMedium, utmCampaign, utmContent, utmTerm } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate magnet type
    if (!magnetType || !['CHECKLIST', 'EMAIL_TEMPLATES', 'PLAYBOOK'].includes(magnetType)) {
      return NextResponse.json(
        { error: "Invalid magnet type" },
        { status: 400 }
      );
    }

    const magnet = LEAD_MAGNET_CONTENT[magnetType];

    // Save to database
    const { db } = await import("@/lib/db");
    const capture = await db.leadMagnetCapture.create({
      data: {
        email,
        magnetType,
        name: name || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmContent: utmContent || null,
        utmTerm: utmTerm || null,
      },
    });

    // Trigger nurture sequence via Inngest
    const { inngest } = await import("@/lib/inngest/client");
    await inngest.send({
      name: "lead-magnet/captured",
      data: {
        captureId: capture.id,
        email,
        magnetType,
        name: name || "",
      },
    });

    // Send email with lead magnet content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1C1917;">Your ${magnet.title}</h2>
        <p style="color: #57534E; line-height: 1.6;">
          Thanks for downloading the ${magnet.title}! Here's your copy:
        </p>
        <div style="background-color: #FAFAF9; padding: 20px; border-radius: 8px; margin: 30px 0; font-family: monospace; white-space: pre-wrap; color: #1C1917; font-size: 14px;">
${magnet.content}
        </div>
        <p style="color: #57534E; line-height: 1.6;">
          This resource will help you identify which leads are 3x more likely to convert and focus your outreach where it matters most.
        </p>
        <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 30px 0;">
        <p style="color: #78716C; font-size: 14px;">
          Want to automate lead scoring and segmentation? 
          <a href="https://convertlist.app" style="color: #C2410C;">Score 25 leads free with ConvertList</a>
        </p>
      </div>
    `;

    await resend.emails.send({
      from: 'ConvertList <alex@convertlist.app>',
      to: email,
      subject: magnet.subject,
      html: emailContent,
    });

    return NextResponse.redirect(new URL('/lead-magnet/thank-you', req.url));
  } catch (error) {
    console.error("Lead magnet capture error:", error);
    return NextResponse.json(
      { error: "Failed to capture email or send lead magnet" },
      { status: 500 }
    );
  }
}
