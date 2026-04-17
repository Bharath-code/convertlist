import { inngest } from "@/lib/inngest/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const NURTURE_SEQUENCES = {
  CHECKLIST: [
    {
      delayDays: 3,
      subject: "How to personalize your outreach",
      content: `
Hi {{name}},

Now that you've scored your waitlist, the next step is personalized outreach.

Generic emails get 2% replies.
Personalized emails get 20%+ replies.

The difference is 10x.

Here's the simplest way to personalize:

1. Reference their specific pain point from signup note
2. Mention their company or use case
3. Offer a solution to their specific problem

Example: "I saw you mentioned struggling with {{pain}}. I can help with that."

Want to automate this? ConvertList generates personalized emails for every lead based on their signup note.

Score 25 leads free → convertlist.app

Cheers,
Alex from ConvertList
      `,
    },
    {
      delayDays: 7,
      subject: "Your follow-up sequence",
      content: `
Hi {{name}},

Most leads need 3-5 touches before they convert.

One email isn't enough.

Here's a simple follow-up cadence that works:

- Day 0: Initial outreach
- Day 2: First follow-up ("Any thoughts?")
- Day 4: Value-add (case study)
- Day 7: Social proof
- Day 10: Break-up email

For Hot leads: Follow up every 2 days
For Warm leads: Follow up weekly
For Cold leads: Add to monthly newsletter

Need templates? We have 10 cold email templates ready to use.

Get the templates → convertlist.app/lead-magnets/email-templates

Best,
Alex
      `,
    },
  ],
  EMAIL_TEMPLATES: [
    {
      delayDays: 3,
      subject: "Subject lines that work",
      content: `
Hi {{name}},

Wondering which subject lines perform best?

After testing thousands of emails, here's what works:

**Best subject lines:**
- "Quick question about {{pain_point}}"
- "Help with {{specific_problem}}"
- "Re: Your interest in {{product}}"

**Worst subject lines:**
- "Thanks for signing up"
- "Welcome to {{product}}"
- "Your account"

The difference: Specific and relevant vs. generic.

Want to automate this? ConvertList generates personalized subject lines for every lead.

Score 25 leads free → convertlist.app

Cheers,
Alex
      `,
    },
    {
      delayDays: 7,
      subject: "The complete guide",
      content: `
Hi {{name}},

You have the templates. Now you need the strategy.

The Complete Waitlist Conversion Playbook covers:

- Lead scoring framework
- Segmentation strategy
- Personalized outreach examples
- Follow-up sequences
- Pipeline management

It's the comprehensive guide founders use to go from 2% to 20% conversion.

Get the playbook → convertlist.app/lead-magnets/playbook

Best,
Alex
      `,
    },
  ],
  PLAYBOOK: [
    {
      delayDays: 2,
      subject: "Waitlist Conversion Playbook - Day 2",
      content: `
Hi {{name}},

Today's section: Lead Scoring Framework

The 4 signals that predict conversion:

1. **Domain Quality** (up to 25 points)
   - Company domains = professional interest
   - Personal emails = medium intent
   - Disposable emails = low intent

2. **Intent from Signup Note** (up to 30 points)
   - Urgent pain = highest conversion
   - Specific use case = medium-high
   - Vague interest = low

3. **Recency** (up to 20 points)
   - Recent signups are still warm

4. **Source** (up to 15 points)
   - Referrals = highest intent
   - Launch platforms = high intent

Total score: 0-90 points.

Hot (60+), Warm (35-59), Cold (<35).

Tomorrow: Segmentation Strategy

Best,
Alex
      `,
    },
    {
      delayDays: 3,
      subject: "Waitlist Conversion Playbook - Day 3",
      content: `
Hi {{name}},

Today's section: Segmentation Strategy

Hot leads (60-90 points):
- Reach out within 24 hours
- Offer immediate solution
- Follow up every 2 days

Warm leads (35-59 points):
- Reach out within 1 week
- Share case studies
- Follow up weekly

Cold leads (0-34 points):
- Add to nurture sequence
- Send monthly updates
- Don't waste time on personalized outreach

Focus 80% of your effort on Hot leads. They're 3x more likely to convert.

Tomorrow: Personalized Outreach

Best,
Alex
      `,
    },
    {
      delayDays: 4,
      subject: "Waitlist Conversion Playbook - Day 4",
      content: `
Hi {{name}},

Today's section: Personalized Outreach

Generic emails get 2% replies.
Personalized emails get 20%+ replies.

How to personalize:

1. Reference their specific pain point
2. Mention their company or use case
3. Offer solution to their specific problem

Example:
"Hi Sarah, I saw you mentioned struggling with {{pain}}. I built {{product}} specifically to help with that. Would you be open to a demo?"

The key: Show you actually read their signup note.

Tomorrow: Follow-Up Sequences

Best,
Alex
      `,
    },
    {
      delayDays: 5,
      subject: "Waitlist Conversion Playbook - Day 5 (Final)",
      content: `
Hi {{name}},

Today: The Complete Playbook (all sections)

You've now learned:
- How to score your waitlist
- How to segment by conversion likelihood
- How to write personalized emails
- How to build follow-up sequences
- How to manage your pipeline

Next step: Do it manually or automate.

**Manual:**
- Use the scoring checklist
- Segment in a spreadsheet
- Write personalized emails

**Automated:**
- ConvertList scores every lead automatically
- Segments into Hot/Warm/Cold
- Generates personalized emails based on signup note

Want to automate? Score 25 leads free → convertlist.app

Best,
Alex
      `,
    },
  ],
};

export const leadMagnetNurture = inngest.createFunction(
  {
    id: "lead-magnet-nurture",
    retries: 3,
    triggers: { event: "lead-magnet/captured" },
  },
  async ({ event, step }) => {
    const { captureId, email, magnetType, name } = event.data;

    const sequence = NURTURE_SEQUENCES[magnetType as keyof typeof NURTURE_SEQUENCES];
    
    if (!sequence) {
      return { skipped: true, reason: "No nurture sequence for this magnet type" };
    }

    // Send each email in the sequence
    for (const emailStep of sequence) {
      await step.sleep(`wait-${emailStep.delayDays}-days`, `${emailStep.delayDays} days`);
      
      await step.run(`send-email-${emailStep.delayDays}`, async () => {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="white-space: pre-wrap; color: #1C1917; line-height: 1.6;">
${emailStep.content}
            </div>
            <hr style="border: none; border-top: 1px solid #E7E5E4; margin: 30px 0;">
            <p style="color: #78716C; font-size: 12px;">
              You're receiving this because you downloaded a lead magnet from ConvertList. 
              <a href="https://convertlist.app/unsubscribe" style="color: #78716C;">Unsubscribe</a>
            </p>
          </div>
        `;

        await resend.emails.send({
          from: 'ConvertList <alex@convertlist.app>',
          to: email,
          subject: emailStep.subject,
          html: emailContent,
        });
      });
    }

    return { completed: true, emailsSent: sequence.length };
  }
);
