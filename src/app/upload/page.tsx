"use client";

import React, { useState, useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  X,
  Sparkles,
  Clipboard,
} from "lucide-react";

type Step = "name" | "source" | "preview";

export default function UploadPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("name");
  const [mode, setMode] = useState<"csv" | "paste">("csv");
  const [file, setFile] = useState<File | null>(null);
  const [pasteData, setPasteData] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [usedLeads, setUsedLeads] = useState(0);
  const [limit, setLimit] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<Array<{ email: string; name?: string; company?: string }>>([]);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.plan === "FREE") {
          setUsedLeads(d.used ?? 0);
          setLimit(d.limit ?? 25);
        }
      })
      .catch(() => {});
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const countIncomingLeads = useCallback(() => {
    if (mode === "csv" && file) {
      file.text().then((text) => {
        const lines = text.split("\n").filter((l) => l.trim());
        setLeadCount(Math.max(0, lines.length - 1));
        const preview = lines.slice(1, 6).map((line) => {
          const parts = line.split(",");
          return {
            email: parts[0]?.trim() || "",
            name: parts[1]?.trim() || "",
            company: parts[2]?.trim() || "",
          };
        });
        setPreviewData(preview);
      });
    } else if (mode === "paste" && pasteData) {
      const emails = pasteData.split(/[\n,;]+/).filter((e) => e.includes("@"));
      setLeadCount(emails.length);
      setPreviewData(emails.slice(0, 5).map((e) => ({ email: e.trim() })));
    } else {
      setLeadCount(null);
      setPreviewData([]);
    }
  }, [mode, file, pasteData]);

  useEffect(() => {
    countIncomingLeads();
  }, [countIncomingLeads]);

  const handleSubmit = async () => {
    if (!waitlistName.trim()) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (mode === "csv" && file) formData.append("file", file);
      else if (mode === "paste") formData.append("pasteData", pasteData);
      formData.append("name", waitlistName);
      formData.append("mode", mode);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.upgradeRequired) {
          setErrorMsg(data.message || "Lead limit reached. Upgrade to continue.");
        } else {
          setErrorMsg(data.error || "Upload failed");
        }
        setUploading(false);
        return;
      }

      toast.success("Upload started — scoring your leads", { duration: 4000 });
      startTransition(() => router.push(`/processing/${data.waitlistId}`));
    } catch {
      setErrorMsg("Upload failed. Please try again.");
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sample = `email,name,company,signup_note,source,signup_date
sarah@acme.io,Sarah Chen,Acme Inc,"Just launched our SaaS last week. Looking for better ways to convert our waitlist.",Product Hunt,2026-03-20
john@gmail.com,John Smith,,"Interested in converting waitlist signups",Google Search,2026-03-18
mike@techstartup.co,Mike Johnson,TechStartup Co,"We have 1000+ signups but only 2% conversion. Need help prioritizing.",Referral,2026-03-22`;

    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-waitlist.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Sample CSV downloaded");
  };

  const isFree = limit !== null;
  const estimatedTotal = leadCount !== null ? usedLeads + leadCount : null;
  const willExceed = isFree && limit !== null && estimatedTotal !== null && estimatedTotal > limit;
  const remaining = isFree && limit !== null ? Math.max(0, limit - usedLeads) : null;

  return (
    <div className="relative min-h-[100dvh] bg-[#050505] text-white">
      <div className="ambient-glow" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        {/* Progress */}
        <ProgressDots step={step} />

        {/* Quota + error banners */}
        <div className="mt-12 space-y-3">
          {isFree && limit !== null && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-white/80">
                  <span className="font-medium text-white tabular-nums">{usedLeads}</span>
                  <span className="text-white/40"> / {limit} leads on the free plan</span>
                </div>
                <div className="mt-2 h-1 w-48 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 to-violet-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (usedLeads / limit) * 100)}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.96]"
              >
                See plans
                <ArrowUpRight className="w-3 h-3 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.04] p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-rose-200">{errorMsg}</p>
                  {errorMsg.toLowerCase().includes("limit") && (
                    <Link
                      href="/pricing"
                      className="text-xs text-rose-100 underline mt-1.5 inline-block"
                    >
                      Upgrade to continue →
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Steps */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {step === "name" && (
              <StepShell key="name" stepLabel="Step 1 of 3">
                <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-balance">
                  Name your waitlist.
                </h2>
                <p className="text-white/50 mt-2 max-w-md">
                  Give it a name you&apos;ll recognize when you come back to it.
                </p>

                <div className="mt-8">
                  <input
                    autoFocus
                    value={waitlistName}
                    onChange={(e) => setWaitlistName(e.target.value)}
                    placeholder="e.g., Product Hunt Launch March 2026"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-base text-white placeholder:text-white/25 outline-none focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-400/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  />
                </div>

                <CTAButton
                  onClick={() => setStep("source")}
                  disabled={!waitlistName.trim()}
                  className="mt-6"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </CTAButton>
              </StepShell>
            )}

            {step === "source" && (
              <StepShell key="source" stepLabel="Step 2 of 3">
                <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-balance">
                  Drop your waitlist.
                </h2>
                <p className="text-white/50 mt-2 max-w-md">
                  CSV or paste. We&apos;ll detect duplicates and parse messy columns automatically.
                </p>

                <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/[0.02] p-1 gap-1">
                  {(["csv", "paste"] as const).map((m) => {
                    const active = mode === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`relative px-4 py-1.5 text-xs font-medium rounded-full transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                          active ? "text-black" : "text-white/50 hover:text-white/80"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="upload-mode"
                            className="absolute inset-0 rounded-full bg-white"
                            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                          />
                        )}
                        <span className="relative z-10 inline-flex items-center gap-1.5">
                          {m === "csv" ? <Upload className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />}
                          {m === "csv" ? "Upload CSV" : "Paste list"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6">
                  {mode === "csv" ? (
                    <CSVDropzone
                      dragActive={dragActive}
                      onDrag={handleDrag}
                      onDrop={handleDrop}
                      onChange={handleFileChange}
                      file={file}
                      leadCount={leadCount}
                      onDownloadSample={downloadSampleCSV}
                    />
                  ) : (
                    <textarea
                      value={pasteData}
                      onChange={(e) => setPasteData(e.target.value)}
                      placeholder={"Paste emails here, one per line\n\njohn@acme.io\nsarah@startup.co\nhello@indie.dev"}
                      className="w-full h-56 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm font-mono text-white placeholder:text-white/25 outline-none focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-400/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] resize-none"
                    />
                  )}
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <BackButton onClick={() => setStep("name")} />
                  <CTAButton
                    onClick={() => setStep("preview")}
                    disabled={!file && !pasteData.trim()}
                    className="flex-1"
                  >
                    {leadCount ? `Preview ${leadCount} leads` : "Preview"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </CTAButton>
                </div>
              </StepShell>
            )}

            {step === "preview" && (
              <StepShell key="preview" stepLabel="Step 3 of 3">
                <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-balance">
                  Review and start scoring.
                </h2>
                <p className="text-white/50 mt-2 max-w-md">
                  AI batches 50 leads at a time. Hot leads surface first, Cold last.
                </p>

                {previewData.length > 0 && (
                  <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
                    <div className="grid grid-cols-3 text-[10px] uppercase tracking-[0.2em] text-white/40 bg-white/[0.02] border-b border-white/10">
                      <div className="px-4 py-3">Email</div>
                      <div className="px-4 py-3">Name</div>
                      <div className="px-4 py-3">Company</div>
                    </div>
                    {previewData.map((lead, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-3 text-sm border-b border-white/[0.04] last:border-0"
                      >
                        <div className="px-4 py-2.5 text-white/90 truncate tabular-nums">{lead.email}</div>
                        <div className="px-4 py-2.5 text-white/50 truncate">{lead.name || "—"}</div>
                        <div className="px-4 py-2.5 text-white/50 truncate">{lead.company || "—"}</div>
                      </div>
                    ))}
                    {leadCount && leadCount > 5 && (
                      <div className="px-4 py-3 text-center text-xs text-white/40 bg-white/[0.01]">
                        +<span className="tabular-nums">{leadCount - 5}</span> more leads
                      </div>
                    )}
                  </div>
                )}

                {isFree && limit !== null && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/70">Free plan usage</span>
                      <span className="text-sm text-white tabular-nums">
                        {usedLeads} + {leadCount ?? 0} = <span className="font-medium text-white">{usedLeads + (leadCount ?? 0)}</span> / {limit}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          willExceed
                            ? "bg-rose-400"
                            : "bg-gradient-to-r from-emerald-400 to-violet-400"
                        }`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, ((usedLeads + (leadCount ?? 0)) / limit) * 100)}%`,
                        }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    {willExceed && (
                      <p className="text-xs text-rose-300 mt-2">
                        This batch would exceed your free limit. Reduce the count or{" "}
                        <Link href="/pricing" className="underline">
                          upgrade
                        </Link>
                        .
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-8 flex items-center gap-3">
                  <BackButton onClick={() => setStep("source")} />
                  <CTAButton
                    onClick={handleSubmit}
                    disabled={uploading || willExceed}
                    loading={uploading}
                    className="flex-1"
                  >
                    {uploading ? "Uploading…" : "Start scoring"}
                    <Sparkles className="w-4 h-4 ml-1" />
                  </CTAButton>
                </div>
              </StepShell>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────

function ProgressDots({ step }: { step: Step }) {
  const idx = step === "name" ? 0 : step === "source" ? 1 : 2;
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          <motion.div
            initial={false}
            animate={{
              width: i === idx ? 32 : 8,
              backgroundColor: i <= idx ? "#10b981" : "rgba(255,255,255,0.15)",
            }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="h-1 rounded-full"
          />
        </React.Fragment>
      ))}
    </div>
  );
}

function StepShell({
  stepLabel,
  children,
}: {
  stepLabel: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className="nested-card">
        <div className="nested-card-inner">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-6">
            {stepLabel}
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function CTAButton({
  children,
  onClick,
  disabled,
  loading,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] px-5 py-3.5 text-sm font-medium text-white/60 hover:text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
    >
      Back
    </button>
  );
}

function CSVDropzone({
  dragActive,
  onDrag,
  onDrop,
  onChange,
  file,
  leadCount,
  onDownloadSample,
}: {
  dragActive: boolean;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  leadCount: number | null;
  onDownloadSample: () => void;
}) {
  return (
    <div
      onDragEnter={onDrag}
      onDragLeave={onDrag}
      onDragOver={onDrag}
      onDrop={onDrop}
      className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        dragActive
          ? "border-emerald-400/50 bg-emerald-400/[0.03] scale-[1.01]"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <input type="file" accept=".csv" onChange={onChange} className="hidden" id="csv-upload" />
      <label htmlFor="csv-upload" className="cursor-pointer block">
        {file ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="size-14 mx-auto rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-emerald-300" />
            </div>
            <p className="font-medium text-white">{file.name}</p>
            <p className="text-sm text-white/40 mt-0.5 tabular-nums">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            {leadCount && (
              <p className="text-emerald-300 text-sm font-medium mt-3 tabular-nums">
                {leadCount} leads detected
              </p>
            )}
          </motion.div>
        ) : (
          <>
            <div className="size-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500">
              <Upload className="w-6 h-6 text-white/40" />
            </div>
            <p className="text-white/80 font-medium mb-1">
              Drag &amp; drop your CSV here
            </p>
            <p className="text-sm text-white/40">
              or <span className="text-white/70 underline">browse files</span>
            </p>
          </>
        )}
      </label>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDownloadSample();
        }}
        className="mt-6 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors duration-300"
      >
        <FileText className="w-3 h-3" />
        Download a sample CSV
      </button>
    </div>
  );
}
