"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

interface StatusData {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  totalLeads: number;
  processedLeads: number;
}

export default function ProcessingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    let pollInterval: NodeJS.Timeout | null = null;
    let pollCount = 0;
    const maxPolls = 150; // 5 minutes max

    const poll = async () => {
      try {
        const res = await fetch(`/api/waitlist/${id}/status`);
        if (!res.ok) throw new Error("Failed to fetch status");
        const data: StatusData = await res.json();
        setStatus(data);

        if (data.status === "COMPLETED") {
          router.push(`/results/${id}`);
          return;
        } else if (data.status === "FAILED") {
          setError("Processing failed. Please try again.");
          return;
        }

        // Exponential backoff: start at 2s, increase to 5s, then 10s
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

  if (!status) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600 mb-4" />
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  const progress =
    status.totalLeads > 0
      ? Math.round((status.processedLeads / status.totalLeads) * 100)
      : 0;

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Analyzing Your Waitlist</h1>
        <p className="text-slate-600">
          Our AI is scoring each lead based on intent, domain quality, and recency
        </p>
      </div>

      <div className="card">
        {status.status === "FAILED" || error ? (
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-4">{error || "Processing failed"}</p>
            <button
              onClick={() => router.push("/upload")}
              className="btn-secondary"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
              <span className="font-medium text-slate-900">
                {status.status === "PROCESSING"
                  ? `Processing leads...`
                  : status.status === "PENDING"
                  ? "Starting..."
                  : "Finalizing..."}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>
                  {status.processedLeads} / {status.totalLeads} leads
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-slate-500">
              This page updates automatically. You can safely close this tab and return later.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
