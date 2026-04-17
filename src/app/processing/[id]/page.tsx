"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, ArrowRight, Clock, X } from "lucide-react";
import { Button } from "@/components/patterns";
import { Card } from "@/components/patterns";
import { cn } from "@/lib/utils";
import { SlideUp, FadeIn, StaggerContainer } from "@/components/motion";

interface StatusData {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  totalLeads: number;
  processedLeads: number;
  enrichedLeads?: number;
}

type ProcessingStep = "upload" | "analyze" | "enrich" | "complete";

export default function ProcessingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("upload");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    let pollInterval: NodeJS.Timeout | null = null;
    let pollCount = 0;
    const maxPolls = 150;

    const poll = async () => {
      try {
        const res = await fetch(`/api/waitlist/${id}/status`);
        if (!res.ok) throw new Error("Failed to fetch status");
        const data: StatusData = await res.json();
        setStatus(data);

        // Update current step based on progress
        const progress = data.totalLeads > 0 
          ? Math.round((data.processedLeads / data.totalLeads) * 100) 
          : 0;
        
        if (data.status === "PENDING") {
          setCurrentStep("upload");
        } else if (data.status === "PROCESSING") {
          if (progress < 50) setCurrentStep("analyze");
          else if (progress < 80) setCurrentStep("enrich");
          else setCurrentStep("complete");
        }

        if (data.status === "COMPLETED") {
          router.push(`/results/${id}`);
          return;
        } else if (data.status === "FAILED") {
          setError("Processing failed. Please try again.");
          return;
        }

        pollCount++;
        if (pollCount >= maxPolls) {
          setError("Processing timed out. Please try again.");
          return;
        }

        const delay = pollCount < 5 ? 2000 : pollCount < 15 ? 5000 : 10000;
        
        if (pollInterval) clearTimeout(pollInterval);
        pollInterval = setTimeout(poll, delay);
      } catch (e) {
        setError("Failed to load status");
      }
    };

    poll();
    return () => {
      if (pollInterval) clearTimeout(pollInterval);
    };
  }, [id, router]);

  const handleCancel = () => {
    setCancelConfirm(true);
  };

  const confirmCancel = () => {
    router.push("/dashboard");
  };

  if (!status) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <p className="text-indigo-900 font-medium">Loading...</p>
      </div>
    );
  }

  const progress =
    status.totalLeads > 0
      ? Math.round((status.processedLeads / status.totalLeads) * 100)
      : 0;

  const steps = [
    { id: "upload", label: "Upload", icon: "📤", time: "~30s" },
    { id: "analyze", label: "AI Analysis", icon: "🧠", time: "~2min" },
    { id: "enrich", label: "Enrichment", icon: "✨", time: "~1min" },
    { id: "complete", label: "Complete", icon: "✅", time: "Done" },
  ] as const;

  const getStepStatus = (stepId: ProcessingStep) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="min-h-screen bg-indigo-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <SlideUp delay={0}>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-heading font-bold text-indigo-900 mb-4">
              Analyzing Your Waitlist
            </h1>
            <p className="text-lg text-indigo-600">
              Our AI is scoring each lead based on intent, domain quality, and recency
            </p>
          </div>
        </SlideUp>

        {/* Step Progress */}
        <SlideUp delay={0.1}>
          <Card className="mb-8">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const stepStatus = getStepStatus(step.id);
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300",
                      stepStatus === "completed" 
                        ? "bg-emerald-500 text-white shadow-lg" 
                        : stepStatus === "active" 
                        ? "bg-indigo-500 text-white shadow-lg scale-110" 
                        : "bg-indigo-100 text-indigo-400"
                    )}>
                      {stepStatus === "completed" ? "✅" : step.icon}
                    </div>
                    <p className={cn(
                      "mt-2 text-sm font-medium transition-colors",
                      stepStatus === "active" ? "text-indigo-900" : "text-indigo-600"
                    )}>
                      {step.label}
                    </p>
                    <p className="text-xs text-indigo-400">{step.time}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "flex-1 h-1 mx-4 rounded-full transition-all duration-300",
                      stepStatus === "completed" ? "bg-emerald-500" : "bg-indigo-200"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-indigo-600 font-medium">
                {status.status === "PROCESSING" ? "Processing leads..." : "Starting..."}
              </span>
              <span className="text-indigo-900 font-semibold">{progress}%</span>
            </div>
            <div className="h-3 bg-indigo-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-3xl font-bold text-indigo-900">{status.totalLeads}</p>
              <p className="text-sm text-indigo-600">Total Leads</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-3xl font-bold text-emerald-600">{status.processedLeads}</p>
              <p className="text-sm text-indigo-600">Scored</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {status.enrichedLeads !== undefined ? status.enrichedLeads : 0}
              </p>
              <p className="text-sm text-indigo-600">Enriched</p>
            </div>
          </div>

          {/* Time Estimate */}
          <div className="flex items-center justify-center gap-2 text-indigo-600 mb-6">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Estimated time remaining: ~{Math.max(0, 3 - Math.floor(progress / 33))} minutes
            </span>
          </div>

          {status.status === "FAILED" || error ? (
            <div className="text-center py-6 bg-red-50 rounded-lg">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-4">{error || "Processing failed"}</p>
              <Button variant="secondary" onClick={() => router.push("/upload")}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={handleCancel}
                disabled={cancelConfirm}
              >
                {cancelConfirm ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Confirm Cancel
                  </>
                ) : (
                  "Cancel"
                )}
              </Button>
              {cancelConfirm && (
                <Button 
                  variant="secondary"
                  onClick={() => setCancelConfirm(false)}
                >
                  Keep Processing
                </Button>
              )}
            </div>
          )}
        </Card>
        </SlideUp>

        {/* Info Card */}
        <SlideUp delay={0.2}>
          <Card className="text-center">
          <p className="text-indigo-600 text-sm">
            💡 This page updates automatically. You can safely close this tab and return later.
          </p>
        </Card>
        </SlideUp>
      </div>
    </div>
  );
}
