/**
 * Default 5-step sequence templates.
 *
 * Users don't know what to write for steps 2–5. Give them a one-click
 * "load a proven sequence" button that fills the builder with a battle-tested
 * template. They can still edit each step.
 */

export interface SequenceTemplate {
  id: string;
  name: string;
  description: string;
  steps: Array<{ subject: string; body: string; delayDays: number }>;
}

export const SEQUENCE_TEMPLATES: SequenceTemplate[] = [
  {
    id: "hot-5step",
    name: "Hot Lead — 5 step",
    description: "Aggressive but polite. For leads that opened your launch page but haven't replied yet.",
    steps: [
      {
        subject: "Quick question, {{first_name}}",
        body: "Hi {{first_name|default:\"there\"}},\n\nSaw you signed up for {{waitlistName}} — wanted to ask one thing before we go heads-down building:\n\nWhat's the single biggest pain you'd want this to solve?\n\nTwo sentences is plenty. I'll read every reply.\n\n— {{senderName}}",
        delayDays: 0,
      },
      {
        subject: "Re: Quick question, {{first_name}}",
        body: "Hi {{first_name|default:\"there\"}},\n\nBumping this in case it got buried. I genuinely want to know what made you sign up — helps us prioritize what to ship first.\n\nIf it's easier, just reply with one word: \"yes\" or \"no\".\n\n— {{senderName}}",
        delayDays: 3,
      },
      {
        subject: "Saw this and thought of you, {{first_name}}",
        body: "Hi {{first_name|default:\"there\"}},\n\nCame across [a specific example / case study] and it reminded me of the kind of thing people like you sign up for.\n\nWorth a 5-min look this week?\n\n— {{senderName}}",
        delayDays: 6,
      },
      {
        subject: "Last note from me, {{first_name}}",
        body: "Hi {{first_name|default:\"there\"}},\n\nDon't want to be that person spamming your inbox. Closing the loop on my end.\n\nIf timing's off, totally fine — just hit reply with \"later\" and I'll stop.\n\n— {{senderName}}",
        delayDays: 10,
      },
      {
        subject: "We shipped it (no pressure, just FYI)",
        body: "Hi {{first_name|default:\"there\"}},\n\nWe just shipped what you signed up for. No demo, no pitch — here's the link in case you want to poke around:\n\n{{productUrl}}\n\nIf it's not for you, no worries. If it is, I'd love to know what you think.\n\n— {{senderName}}",
        delayDays: 21,
      },
    ],
  },
  {
    id: "warm-3step",
    name: "Warm Lead — 3 step",
    description: "Lighter touch. For leads who signed up but didn't write a note.",
    steps: [
      {
        subject: "Hi from {{senderName}}",
        body: "Hi {{first_name|default:\"there\"}},\n\nThanks for signing up for {{waitlistName}}. Just wanted to say hi — we'll be in touch when we launch.\n\nIn the meantime, anything specific you'd want us to know? Always read every reply.\n\n— {{senderName}}",
        delayDays: 0,
      },
      {
        subject: "A small update from us",
        body: "Hi {{first_name|default:\"there\"}},\n\nQuick update: we're 2 weeks from launch. If you have 30 seconds, hit reply with what made you sign up — it'll help us prioritize.\n\nThanks!\n— {{senderName}}",
        delayDays: 7,
      },
      {
        subject: "We launched — your invite is inside",
        body: "Hi {{first_name|default:\"there\"}},\n\nIt's live. Your early-access link:\n\n{{productUrl}}\n\nNo pressure. If timing's off, this offer's good for 30 days.\n\n— {{senderName}}",
        delayDays: 18,
      },
    ],
  },
  {
    id: "soft-2step",
    name: "Soft Touch — 2 step",
    description: "For agencies / B2B. Two emails. Long gaps. Low frequency.",
    steps: [
      {
        subject: "Saw {{company}} in our signups — wanted to reach out",
        body: "Hi {{first_name|default:\"there\"}},\n\nNoticed {{company}} signed up for {{waitlistName}}. I work with a handful of [your industry] teams and thought it might be useful to compare notes.\n\nWorth a quick intro call? 15 min, no pitch.\n\n— {{senderName}}",
        delayDays: 0,
      },
      {
        subject: "Following up (last time, promise)",
        body: "Hi {{first_name|default:\"there\"}},\n\nI know inboxes are brutal. Closing the loop — if a 15-min chat is ever useful, here's my calendar: [link]\n\nIf not, no worries at all.\n\n— {{senderName}}",
        delayDays: 14,
      },
    ],
  },
];
