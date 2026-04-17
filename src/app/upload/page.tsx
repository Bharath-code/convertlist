"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Upload, FileText, ArrowRight, ArrowUpRight, AlertCircle, Download, X, Play } from "lucide-react";
import { Button } from "@/components/patterns";
import { Card } from "@/components/patterns";
import { Input } from "@/components/patterns";
import { cn } from "@/lib/utils";
import { SlideUp, FadeIn } from "@/components/motion";

type Step = "name" | "source" | "preview";

export default function UploadPage() {
  const router = useRouter();
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
        setUploading(false);
        return;
      }

      toast.success("Upload started! Scoring your leads...");
      router.push(`/processing/${data.waitlistId}`);
    } catch (error) {
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

  const isFree = usedLeads > 0;
  const wouldExceed = isFree && leadCount !== null && usedLeads + leadCount > 50;
  const estimatedTotal = leadCount !== null ? usedLeads + leadCount : null;

  return (
    <div className="max-w-3xl mx-auto py-12">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300",
              (step === "name" && i === 1) || (step === "source" && i === 2) || (step === "preview" && i === 3)
                ? "bg-indigo-500 text-white scale-110" 
                : "bg-indigo-100 text-indigo-600"
            )}>
              {i}
            </div>
            {i < 3 && (
              <div className={cn(
                "w-24 h-1 mx-2 rounded-full transition-all duration-300",
                (step === "source" && i === 1) || (step === "preview" && i >= 1)
                  ? "bg-indigo-500" 
                  : "bg-indigo-100"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      {isFree && (
        <Card className="max-w-xl mx-auto mb-6 border-2 border-amber-300 bg-amber-50 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-900">
              You're at {usedLeads}/50 leads on the free plan
            </p>
            <p className="text-sm text-amber-700">
              Upgrade to Starter for 500 leads/mo or Pro for 5,000 leads/mo
            </p>
          </div>
          <Link href="/pricing">
            <Button variant="primary" size="sm">
              Upgrade <ArrowUpRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      )}

      {errorMsg && (
        <Card className="max-w-xl mx-auto mb-6 border-2 border-red-300 bg-red-50">
          <p className="text-sm text-red-700">{errorMsg}</p>
          {errorMsg.includes("limit") && (
            <Link href="/pricing" className="text-sm font-medium text-red-900 hover:text-red-700 mt-2 inline-block">
              Upgrade to continue →
            </Link>
          )}
        </Card>
      )}

      {/* Step 1: Waitlist Name */}
      {step === "name" && (
        <SlideUp key="step-name">
          <Card className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">Name your waitlist</h2>
            <p className="text-indigo-600 mb-6">Give it a memorable name for easy reference</p>
            
            <Input
              label="Waitlist Name"
              placeholder="e.g., Product Hunt Launch March 2026"
              value={waitlistName}
              onChange={(e) => setWaitlistName(e.target.value)}
              helperText="This helps you organize multiple waitlists"
            />
            
            <Button 
              variant="cta" 
              className="w-full mt-6"
              onClick={() => setStep("source")}
              disabled={!waitlistName.trim()}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </SlideUp>
      )}

      {/* Step 2: Source Selection */}
      {step === "source" && (
        <SlideUp key="step-source">
          <Card className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">Import your leads</h2>
            <p className="text-indigo-600 mb-6">Choose how you want to upload your waitlist</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setMode("csv")}
              className={cn(
                "p-6 rounded-xl border-2 transition-all duration-300 text-left",
                mode === "csv" 
                  ? "border-indigo-500 bg-indigo-50" 
                  : "border-indigo-200 hover:border-indigo-300"
              )}
            >
              <Upload className="w-8 h-8 text-indigo-500 mb-3" />
              <h3 className="font-semibold text-indigo-900 mb-1">Upload CSV</h3>
              <p className="text-sm text-indigo-600">Drag & drop or browse</p>
            </button>
            
            <button
              onClick={() => setMode("paste")}
              className={cn(
                "p-6 rounded-xl border-2 transition-all duration-300 text-left",
                mode === "paste" 
                  ? "border-indigo-500 bg-indigo-50" 
                  : "border-indigo-200 hover:border-indigo-300"
              )}
            >
              <FileText className="w-8 h-8 text-indigo-500 mb-3" />
              <h3 className="font-semibold text-indigo-900 mb-1">Paste List</h3>
              <p className="text-sm text-indigo-600">Copy & paste emails</p>
            </button>
          </div>

          {mode === "csv" && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300",
                dragActive 
                  ? "border-indigo-500 bg-indigo-50 scale-[1.02]" 
                  : "border-indigo-300 hover:border-indigo-400"
              )}
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
                  <div className="animate-fade-in">
                    <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                    <p className="font-semibold text-indigo-900">{file.name}</p>
                    <p className="text-indigo-600">{(file.size / 1024).toFixed(1)} KB</p>
                    {leadCount && (
                      <p className="text-emerald-600 font-medium mt-2">
                        {leadCount} leads detected
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <Upload className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                    <p className="text-indigo-900 font-medium mb-2">
                      Drag & drop your CSV file here, or
                    </p>
                    <label htmlFor="csv-upload" className="text-indigo-600 hover:text-indigo-900 underline cursor-pointer">
                      browse files
                    </label>
                  </div>
                )}
              </label>
            </div>
          )}

          {mode === "paste" && (
            <textarea
              value={pasteData}
              onChange={(e) => setPasteData(e.target.value)}
              placeholder="Paste emails here (one per line)&#10;&#10;john@example.com&#10;jane@company.io&#10;hello@startup.com"
              className="w-full h-48 px-4 py-3 rounded-lg border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 font-mono text-sm resize-none"
            />
          )}

          <div className="flex gap-3 mt-6">
            <Button 
              variant="ghost" 
              onClick={() => setStep("name")}
            >
              Back
            </Button>
            <Button 
              variant="cta" 
              className="flex-1"
              onClick={() => setStep("preview")}
              disabled={!file && !pasteData.trim()}
            >
              Preview {leadCount} leads
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
        </SlideUp>
      )}

      {/* Step 3: Preview & Confirm */}
      {step === "preview" && (
        <SlideUp key="step-preview">
          <Card className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-indigo-900 mb-2">Review your leads</h2>
          <p className="text-indigo-600 mb-6">
            {leadCount} leads ready to analyze. Confirm and start scoring.
          </p>

          {previewData.length > 0 && (
            <div className="border rounded-xl overflow-hidden mb-6">
              <table className="min-w-full text-sm">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-indigo-900">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-indigo-900">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-indigo-900">Company</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((lead, i) => (
                    <tr key={i} className="border-t border-indigo-100">
                      <td className="px-4 py-3 text-indigo-900">{lead.email}</td>
                      <td className="px-4 py-3 text-indigo-600">{lead.name || "-"}</td>
                      <td className="px-4 py-3 text-indigo-600">{lead.company || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leadCount && leadCount > 5 && (
                <div className="bg-indigo-50 px-4 py-3 text-center text-indigo-600 text-sm">
                  +{leadCount - 5} more leads
                </div>
              )}
            </div>
          )}

          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-900">Free Plan Usage</span>
              <span className="text-sm text-indigo-600">{usedLeads + (leadCount || 0)}/50 leads</span>
            </div>
            <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${((usedLeads + (leadCount || 0)) / 50) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setStep("source")}
            >
              Back
            </Button>
            <Button 
              variant="cta" 
              className="flex-1"
              onClick={handleSubmit}
              disabled={uploading}
              loading={uploading}
            >
              Start Analysis
              <Play className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
        </SlideUp>
      )}
    </div>
  );
}
