import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { scoreWaitlist } from "@/lib/inngest/functions/score-waitlist";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scoreWaitlist],
});
