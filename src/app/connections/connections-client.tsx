"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface IntegrationRow {
  id: string;
  provider: string;
  enabled: boolean;
  config: string | null;
  lastSyncedAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
  createdAt: string;
}

interface RecentSend {
  id: string;
  status: string;
  leadCount: number;
  fromEmail: string;
  errorMessage: string | null;
  createdAt: string;
  instantlyCampaignId: string | null;
  waitlist: { id: string; name: string };
}

interface Props {
  integrations: IntegrationRow[];
  recentSends: RecentSend[];
  repliedCount: number;
  instantlyConfigured: boolean;
}

const providerMeta: Record<
  string,
  { name: string; blurb: string; fields: Array<{ key: string; label: string; type?: string; placeholder?: string; secret?: boolean }> }
> = {
  instantly: {
    name: "Instantly.ai",
    blurb: "One-click cold email sending. We'll launch a campaign for every batch of HOT leads.",
    fields: [{ key: "fromEmail", label: "From email (must be verified in Instantly)", type: "email", placeholder: "you@yourdomain.com" }],
  },
  slack: {
    name: "Slack",
    blurb: "Reply notifications piped straight to a channel of your choice.",
    fields: [
      {
        key: "webhookUrl",
        label: "Incoming webhook URL",
        placeholder: "https://hooks.slack.com/services/…",
        secret: true,
      },
    ],
  },
  discord: {
    name: "Discord",
    blurb: "Reply notifications piped to any channel via webhook.",
    fields: [
      {
        key: "webhookUrl",
        label: "Webhook URL",
        placeholder: "https://discord.com/api/webhooks/…",
        secret: true,
      },
    ],
  },
  gmail: {
    name: "Gmail (Phase 2)",
    blurb: "Detect replies from your personal Gmail inbox. Coming soon — this is the Phase 2 path.",
    fields: [],
  },
};

export function ConnectionsClient({ integrations, recentSends, repliedCount, instantlyConfigured }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [openProvider, setOpenProvider] = useState<string | null>(null);

  const byProvider: Record<string, IntegrationRow | undefined> = {};
  for (const i of integrations) byProvider[i.provider] = i;

  const save = async (provider: string, config: Record<string, string>, secret?: string) => {
    const res = await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, enabled: true, config, secret }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Failed to save");
      return;
    }
    toast.success(`${providerMeta[provider]?.name || provider} connected`);
    startTransition(() => router.refresh());
    setOpenProvider(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this integration?")) return;
    const res = await fetch(`/api/integrations?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to remove");
      return;
    }
    toast.success("Removed");
    startTransition(() => router.refresh());
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Reply detection
          </div>
          <h1 className="mt-6 text-4xl md:text-5xl font-medium tracking-tight">
            Connect your stack.
            <br />
            <span className="text-white/40">Never miss a reply.</span>
          </h1>
          <p className="mt-4 max-w-xl text-white/50">
            We use these to detect when a lead replies and ping you in real-time. The whole point
            of ConvertList is that the <em>wow moment</em> — seeing a hot lead reply — happens
            without you having to do anything.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Stat label="Replies detected" value={repliedCount.toString()} accent="emerald" />
          <Stat
            label="Integrations active"
            value={integrations.filter((i) => i.enabled).length.toString()}
            accent="violet"
          />
          <Stat
            label="Instantly configured"
            value={instantlyConfigured ? "Yes" : "No (server-side)"}
            accent={instantlyConfigured ? "emerald" : "amber"}
          />
        </div>

        <div className="space-y-4">
          {Object.entries(providerMeta).map(([provider, meta]) => {
            const row = byProvider[provider];
            const isOpen = openProvider === provider;
            const isComingSoon = provider === "gmail";
            return (
              <ProviderCard
                key={provider}
                provider={provider}
                meta={meta}
                row={row}
                isOpen={isOpen}
                isComingSoon={isComingSoon}
                onToggle={() => !isComingSoon && setOpenProvider(isOpen ? null : provider)}
                onSave={async (config, secret) => save(provider, config, secret)}
                onRemove={() => row && remove(row.id)}
                pending={pending}
              />
            );
          })}
        </div>

        {recentSends.length > 0 && (
          <section className="mt-16">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-[0.2em] mb-4">
              Recent outreach sends
            </h2>
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-2">
              <div className="divide-y divide-white/5">
                {recentSends.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div className="flex-1">
                      <div className="text-white/90">{s.waitlist.name}</div>
                      <div className="text-white/40 text-xs">
                        {s.leadCount} leads · from {s.fromEmail} · {new Date(s.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {s.status === "launched" && (
                        <span className="text-emerald-400 text-xs">✓ launched</span>
                      )}
                      {s.status === "failed" && (
                        <span className="text-rose-400 text-xs" title={s.errorMessage || ""}>
                          ✗ failed
                        </span>
                      )}
                      {s.status === "pending" && <span className="text-amber-400 text-xs">…pending</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "emerald" | "violet" | "amber" }) {
  const accentClass =
    accent === "emerald" ? "from-emerald-400/20 to-transparent" :
    accent === "violet" ? "from-violet-400/20 to-transparent" :
    "from-amber-400/20 to-transparent";
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-5">
      <div className={`pointer-events-none absolute -top-12 left-0 right-0 h-24 bg-gradient-to-b ${accentClass} blur-2xl`} />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</div>
        <div className="mt-2 text-2xl font-medium tracking-tight">{value}</div>
      </div>
    </div>
  );
}

interface ProviderCardProps {
  provider: string;
  meta: { name: string; blurb: string; fields: Array<{ key: string; label: string; type?: string; placeholder?: string; secret?: boolean }> };
  row: IntegrationRow | undefined;
  isOpen: boolean;
  isComingSoon: boolean;
  onToggle: () => void;
  onSave: (config: Record<string, string>, secret?: string) => Promise<void>;
  onRemove: () => void;
  pending: boolean;
}

function ProviderCard({ meta, row, isOpen, isComingSoon, onToggle, onSave, onRemove }: ProviderCardProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isConnected = !!row?.enabled;
  let existingConfig: Record<string, string> = {};
  try {
    if (row?.config) existingConfig = JSON.parse(row.config) as Record<string, string>;
  } catch {
    /* ignore */
  }

  const handleSave = async () => {
    setSaving(true);
    const config: Record<string, string> = { ...existingConfig };
    const secretKey = meta.fields.find((f) => f.secret)?.key;
    let secret: string | undefined;
    for (const field of meta.fields) {
      const v = values[field.key]?.trim();
      if (v) {
        if (field.secret) {
          secret = v;
        } else {
          config[field.key] = v;
        }
      }
    }
    await onSave(config, secret);
    setValues({});
    setSaving(false);
  };

  return (
    <motion.div
      layout
      className={`overflow-hidden rounded-3xl border ${
        isConnected ? "border-emerald-400/20 bg-emerald-400/[0.02]" : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={isComingSoon}
        className="w-full text-left p-6 flex items-start justify-between gap-4 group disabled:opacity-50"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className={`size-2 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-white/20"
              }`}
            />
            <h3 className="text-lg font-medium tracking-tight">{meta.name}</h3>
            {isComingSoon && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 border border-white/10 rounded-full px-2 py-0.5">
                Soon
              </span>
            )}
            {isConnected && !isComingSoon && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 border border-emerald-400/20 rounded-full px-2 py-0.5">
                Connected
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-white/50 max-w-xl">{meta.blurb}</p>
          {row?.lastError && (
            <p className="mt-2 text-xs text-rose-400/80 font-mono">{row.lastError}</p>
          )}
        </div>
        {!isComingSoon && (
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }} className="text-white/40 text-2xl leading-none mt-1">
            +
          </motion.div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && !isComingSoon && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4">
              {meta.fields.map((field) => {
                const placeholder =
                  field.placeholder ||
                  (existingConfig[field.key] ? `••••• currently set` : "");
                return (
                  <div key={field.key}>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={field.secret ? "password" : field.type || "text"}
                      placeholder={placeholder}
                      value={values[field.key] ?? ""}
                      onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    />
                    {existingConfig[field.key] && !values[field.key] && (
                      <div className="mt-1.5 text-[10px] text-white/30 font-mono">
                        ✓ {field.secret ? "secret" : "value"} saved — leave blank to keep
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? "Saving…" : isConnected ? "Update" : "Connect"}
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-black/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                </button>
                {isConnected && (
                  <button
                    onClick={onRemove}
                    className="text-xs text-white/40 hover:text-rose-400 transition-colors duration-300"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
