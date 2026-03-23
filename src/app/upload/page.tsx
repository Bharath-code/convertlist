"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, FileText, ArrowRight, ArrowUpRight, AlertCircle } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"csv" | "paste">("csv");
  const [file, setFile] = useState<File | null>(null);
  const [pasteData, setPasteData] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [usedLeads, setUsedLeads] = useState(0);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.plan === "FREE") setUsedLeads(d.used ?? 0);
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
      });
    } else if (mode === "paste" && pasteData) {
      const emails = pasteData.split(/[\n,;]+/).filter((e) => e.includes("@"));
      setLeadCount(emails.length);
    } else {
      setLeadCount(null);
    }
  }, [mode, file, pasteData]);

  useEffect(() => {
    countIncomingLeads();
  }, [countIncomingLeads]);

  const handleSubmit = async () => {
    if (!waitlistName.trim()) return;

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();

      if (mode === "csv" && file) {
        formData.append("file", file);
      } else if (mode === "paste") {
        formData.append("pasteData", pasteData);
      }

      formData.append("name", waitlistName);
      formData.append("mode", mode);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.upgradeRequired) {
          setErrorMsg(data.message || "Lead limit reached. Upgrade to continue.");
        } else {
          setErrorMsg(data.error || "Upload failed");
        }
        return;
      }

      router.push(`/processing/${data.waitlistId}`);
    } catch (error) {
      setErrorMsg("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const isFree = usedLeads > 0;
  const wouldExceed =
    isFree &&
    leadCount !== null &&
    usedLeads + leadCount > 50;

  const estimatedTotal = leadCount !== null ? usedLeads + leadCount : null;

  return (
    <div className="max-w-2xl mx-auto">
      {isFree && (
        <div className="card mb-6 border border-amber-200 bg-amber-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Free plan: {usedLeads}/50 leads used
              </p>
              {estimatedTotal !== null && (
                <p className="text-xs text-amber-700">
                  This upload: {leadCount} leads
                  {wouldExceed
                    ? ` → would exceed 50 limit (${estimatedTotal})`
                    : ` → total would be ${estimatedTotal}/50`}
                </p>
              )}
            </div>
          </div>
          <Link
            href="/pricing"
            className="text-sm font-medium text-amber-900 hover:text-amber-700 flex items-center gap-1 flex-shrink-0"
          >
            Upgrade <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Import Your Waitlist</h1>
        <p className="mt-2 text-slate-600">
          Upload a CSV file or paste your email list to get started
        </p>
      </div>

      {errorMsg && (
        <div className="card mb-6 border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{errorMsg}</p>
          {errorMsg.includes("limit") && (
            <Link href="/pricing" className="text-sm font-medium text-red-900 hover:text-red-700 mt-1 inline-block">
              Upgrade to continue &rarr;
            </Link>
          )}
        </div>
      )}

      <div className="card mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Waitlist Name
        </label>
        <input
          type="text"
          value={waitlistName}
          onChange={(e) => setWaitlistName(e.target.value)}
          placeholder="My SaaS Waitlist"
          className="input"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMode("csv")}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
            mode === "csv"
              ? "border-slate-900 bg-slate-50 text-slate-900"
              : "border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          <Upload className="w-5 h-5 mx-auto mb-2" />
          <span className="font-medium">CSV Upload</span>
        </button>
        <button
          onClick={() => setMode("paste")}
          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
            mode === "paste"
              ? "border-slate-900 bg-slate-50 text-slate-900"
              : "border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          <FileText className="w-5 h-5 mx-auto mb-2" />
          <span className="font-medium">Paste List</span>
        </button>
      </div>

      {mode === "csv" ? (
        <div className="card">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-slate-900 bg-slate-50"
                : "border-slate-300 hover:border-slate-400"
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              {file ? (
                <div>
                  <FileText className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                  <p className="font-medium text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                    {leadCount !== null && (
                      <span className="ml-2">({leadCount} leads)</span>
                    )}
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-600">
                    Drag & drop your CSV file here, or{" "}
                    <span className="text-slate-900 font-medium">browse</span>
                  </p>
                </div>
              )}
            </label>
          </div>

          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-700 mb-2">CSV Format</p>
            <p className="text-xs text-slate-500 font-mono">
              email,name,company,signup_note,source,created_at
            </p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              john@example.com,John Doe,Acme Inc,I need this for my startup,referral,2024-01-15
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email List
          </label>
          <textarea
            value={pasteData}
            onChange={(e) => setPasteData(e.target.value)}
            placeholder="Paste emails here (one per line or comma-separated)&#10;&#10;john@example.com&#10;jane@company.io&#10;hello@startup.com"
            className="input h-48 font-mono text-sm"
          />
          {leadCount !== null && pasteData.trim() && (
            <p className="mt-2 text-sm text-slate-500">
              {leadCount} email{leadCount !== 1 ? "s" : ""} detected
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Emails will be assigned an &ldquo;imported&rdquo; source and current timestamp
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={
          !waitlistName.trim() ||
          isUploading ||
          (mode === "csv" && !file) ||
          (mode === "paste" && !pasteData.trim()) ||
          wouldExceed
        }
        className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          "Processing..."
        ) : wouldExceed ? (
          "Would exceed 50 lead limit"
        ) : (
          <>
            Start Analysis
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
