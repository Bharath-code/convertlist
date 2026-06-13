import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { scoreWaitlist } from "@/lib/inngest/functions/score-waitlist";
import { pollInstantlyReplies } from "@/lib/inngest/functions/poll-instantly-replies";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scoreWaitlist, pollInstantlyReplies],
});
