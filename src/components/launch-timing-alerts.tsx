"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Check, X } from "lucide-react";

interface LaunchTimingAlertsProps {
  waitlistId: string;
  currentReadinessScore: number;
}

export default function LaunchTimingAlerts({ waitlistId, currentReadinessScore }: LaunchTimingAlertsProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Simulate fetching alerts from database
    const mockAlerts = [
      {
        id: 1,
        type: "readiness_threshold",
        message: `Launch readiness score reached ${currentReadinessScore}/100`,
        timestamp: new Date(),
        read: false,
      },
    ];
    setAlerts(mockAlerts);
  }, [currentReadinessScore]);

  const toggleAlerts = () => {
    setEnabled(!enabled);
  };

  const markAsRead = (alertId: number) => {
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, read: true } : a));
  };

  const dismissAlert = (alertId: number) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {enabled ? <Bell className="w-5 h-5 text-blue-600" /> : <BellOff className="w-5 h-5 text-slate-400" />}
          <h3 className="text-lg font-bold text-slate-900">Launch Timing Alerts</h3>
        </div>
        <button
          onClick={toggleAlerts}
          className={`px-3 py-1.5 rounded text-sm font-medium ${
            enabled ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {enabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      {!enabled ? (
        <p className="text-slate-500 text-sm">Alerts are currently disabled</p>
      ) : alerts.length === 0 ? (
        <p className="text-slate-500 text-sm">No alerts at this time</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded border ${
                alert.read ? "bg-slate-50 border-slate-200" : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm ${alert.read ? "text-slate-600" : "text-slate-900"}`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {alert.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="p-1 hover:bg-blue-100 rounded"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 hover:bg-red-100 rounded"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-slate-50 rounded">
        <p className="text-sm text-slate-600">
          <strong>Alert Settings:</strong> You'll be notified when your launch readiness score crosses 80/100, indicating optimal launch timing.
        </p>
      </div>
    </div>
  );
}
