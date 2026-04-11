import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "convertlist",
  isDev: true,
  eventKey: process.env.INNGEST_EVENT_KEY || "",
});
