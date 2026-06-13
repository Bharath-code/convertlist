/**
 * RepliesLive — the wow-moment component.
 *
 * Subscribes to /api/replies/stream (SSE) for the authenticated user. When a
 * new REPLIED/INTERESTED/PAID lead arrives, it:
 *   1. fires confetti (subtle, top-center origin)
 *   2. shows a slide-in toast with the lead's name + jump-to-link
 *   3. updates a small dot in the corner indicating "live"
 *
 * Mount this once in any protected layout. The SSE connection is auth'd
 * via cookies (Clerk) so there's no extra wiring.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fireConfetti } from "./confetti";

interface IncomingReply {
  leadId: string;
  email: string;
  name: string | null;
  company: string | null;
  status: "REPLIED" | "INTERESTED" | "PAID";
  waitlistId: string;
  waitlistName: string;
  updatedAt: string;
}

const STATUS_LABEL: Record<IncomingReply["status"], string> = {
  REPLIED: "replied",
  INTERESTED: "looks interested",
  PAID: "converted to paid",
};

const STATUS_ACCENT: Record<IncomingReply["status"], string> = {
  REPLIED: "text-emerald-300",
  INTERESTED: "text-violet-300",
  PAID: "text-amber-300",
};

export function RepliesLive() {
  const [connected, setConnected] = useState(false);
  const [recent, setRecent] = useState<IncomingReply[]>([]);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimer: number | undefined;

    const connect = () => {
      try {
        es = new EventSource("/api/replies/stream");
      } catch {
        retryTimer = window.setTimeout(connect, 5000);
        return;
      }
      es.addEventListener("ready", () => setConnected(true));
      es.addEventListener("error", () => {
        setConnected(false);
        es?.close();
        retryTimer = window.setTimeout(connect, 4000);
      });
      es.addEventListener("reply", (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data) as IncomingReply;
          if (seenRef.current.has(data.leadId + data.updatedAt)) return;
          seenRef.current.add(data.leadId + data.updatedAt);

          setRecent((prev) => [data, ...prev].slice(0, 5));
          fireConfetti({ origin: { x: 0.5, y: 0.3 }, particleCount: 60 });

          // Auto-fade after 8s
          window.setTimeout(() => {
            setRecent((prev) => prev.filter((r) => r.leadId !== data.leadId));
          }, 8000);
        } catch {
          /* malformed */
        }
      });
    };

    connect();
    return () => {
      es?.close();
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, []);

  return (
    <>
      {/* Live indicator pill (top-right) */}
      <div
        className="fixed top-4 right-4 z-40 pointer-events-none"
        aria-live="polite"
      >
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] backdrop-blur-2xl transition-colors duration-500 ${
            connected
              ? "border-emerald-400/30 bg-emerald-400/5 text-emerald-300"
              : "border-white/10 bg-white/5 text-white/30"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              connected ? "bg-emerald-400 animate-pulse" : "bg-white/20"
            }`}
          />
          {connected ? "Live" : "Offline"}
        </div>
      </div>

      {/* Stacked reply toasts (bottom-right) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-96">
        <AnimatePresence>
          {recent.map((r) => (
            <motion.div
              key={r.leadId + r.updatedAt}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, scale: 0.96, filter: "blur(8px)" }}
              transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
            >
              <Link
                href={`/results/${r.waitlistId}?lead=${r.leadId}`}
                className="block rounded-3xl border border-white/10 bg-black/70 p-4 backdrop-blur-2xl shadow-[0_8px_60px_-12px_rgba(0,0,0,0.8)] hover:border-emerald-400/30 transition-colors duration-500"
              >
                <div className="flex items-start gap-3">
                  <div className="size-9 shrink-0 rounded-full bg-gradient-to-br from-emerald-400/30 to-violet-400/20 border border-white/10 flex items-center justify-center text-xs">
                    🎉
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-white truncate">
                        {r.name || r.email}
                      </span>
                      {r.company && (
                        <span className="text-white/40 text-xs truncate">
                          · {r.company}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs mt-0.5 ${STATUS_ACCENT[r.status]}`}>
                      {STATUS_LABEL[r.status]} on{" "}
                      <span className="text-white/60">{r.waitlistName}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
