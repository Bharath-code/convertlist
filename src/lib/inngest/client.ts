import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "convertlist",
  isDev: process.env.NODE_ENV === "development",
  eventKey: process.env.INNGEST_EVENT_KEY || "",
});
