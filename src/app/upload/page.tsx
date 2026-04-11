"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Upload, FileText, ArrowRight, ArrowUpRight, AlertCircle, Download, X } from "lucide-react";
import { Button } from "@/components/patterns";
import { Card, CardContent } from "@/components/patterns";

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"csv" | "paste">("csv");
  const [file, setFile] = useState<File | null>(null);
  const [pasteData, setPasteData] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [leadCount, setLeadCount] = useState<number | null>(null);
  const [usedLeads, setUsedLeads] = useState(0);
  const [previewData, setPreviewData] = useState<Array<{ email: string; name?: string; company?: string }>>([]);

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
        
        // Generate preview data
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
    setUploadProgress(0);
    setErrorMsg(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

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

      clearInterval(progressInterval);
      setUploadProgress(100);

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

      toast.success("Upload started! Scoring your leads...");
      router.push(`/processing/${data.waitlistId}`);
    } catch (error) {
      clearInterval(progressInterval);
      setErrorMsg("Upload failed. Please try again.");
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPasteData("");
    setPreviewData([]);
    setLeadCount(null);
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

  const isFree = usedLeads > 0;
  const wouldExceed =
    isFree &&
    leadCount !== null &&
    usedLeads + leadCount > 50;

  const estimatedTotal = leadCount !== null ? usedLeads + leadCount : null;

  return (
    <div className="max-w-2xl mx-auto">
      {isFree && (
        <Card variant="default" className="mb-6 border border-amber-200 bg-amber-50 flex items-center justify-between gap-4">
          <CardContent className="flex items-center gap-3">
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
          </CardContent>
          <Link
            href="/pricing"
            className="text-sm font-medium text-amber-900 hover:text-amber-700 flex items-center gap-1 flex-shrink-0"
          >
            Upgrade <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Card>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Import Your Waitlist</h1>
        <p className="mt-2 text-slate-600">
          Upload a CSV file or paste your email list to get started
        </p>
      </div>

      {errorMsg && (
        <Card variant="default" className="mb-6 border border-red-200 bg-red-50">
          <CardContent>
            <p className="text-sm text-red-700">{errorMsg}</p>
            {errorMsg.includes("limit") && (
              <Link href="/pricing" className="text-sm font-medium text-red-900 hover:text-red-700 mt-1 inline-block">
                Upgrade to continue &rarr;
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <Card variant="default" className="mb-6">
        <CardContent>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Waitlist Name
          </label>
          <input
            type="text"
            value={waitlistName}
            onChange={(e) => setWaitlistName(e.target.value)}
            placeholder="My SaaS Waitlist"
            className={`input ${waitlistName.trim() ? "border-green-300 focus:ring-green-500" : "border-slate-200"}`}
            aria-invalid={!waitlistName.trim()}
            aria-describedby="waitlist-name-error"
          />
          {!waitlistName.trim() && (
            <p id="waitlist-name-error" className="text-xs text-red-600 mt-1">
              Waitlist name is required
            </p>
          )}
        </CardContent>
      </Card>

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
        <Card variant="default">
          <div className="flex items-center justify-between mb-4">
            <label htmlFor="csv-upload" className="text-sm font-medium text-slate-700">
              Upload CSV File
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={downloadSampleCSV}
                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Sample CSV
              </button>
            </div>
          </div>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? "border-slate-900 bg-slate-50 scale-[1.02]"
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
                  <p className="text-xs text-amber-600 mt-2">
                    Max file size: 2MB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                  <p className="text-slate-600">
                    Drag & drop your CSV file here, or{" "}
                    <span className="text-slate-900 font-medium">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Max file size: 2MB
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Preview Section */}
          {previewData.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                Preview ({leadCount} leads detected)
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-slate-600">Email</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-600">Name</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-600">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((lead, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2 text-slate-900">{lead.email}</td>
                        <td className="px-4 py-2 text-slate-600">{lead.name || "-"}</td>
                        <td className="px-4 py-2 text-slate-600">{lead.company || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {leadCount && leadCount > 5 && (
                  <p className="text-xs text-slate-500 p-2 bg-slate-50">
                    +{leadCount - 5} more leads
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-700 mb-2">CSV Format</p>
            <p className="text-xs text-slate-500 font-mono">
              email,name,company,signup_note,source,created_at
            </p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              john@example.com,John Doe,Acme Inc,I need this for my startup,referral,2024-01-15
            </p>
          </div>
        </Card>
      ) : (
        <Card variant="default">
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
        </Card>
      )}

      <div className="flex gap-3 mt-6">
        {file && !uploading && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          disabled={uploading}
          loading={uploading}
        >
          Start Analysis
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {uploading && (
        <div className="mt-4">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-slate-600 mt-2 text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; 2026 ConvertList</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-700">Terms</Link>
            <a href="mailto:support@convertlist.ai" className="hover:text-slate-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
