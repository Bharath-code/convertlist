'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-6">
        <div className="mb-8">
          <span className="text-8xl font-bold text-slate-200">404</span>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Page not found
        </h1>
        
        <p className="text-slate-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="btn-primary inline-flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-white rounded-lg border border-slate-200">
          <p className="text-sm text-slate-500 mb-3">Common causes:</p>
          <ul className="text-sm text-slate-600 text-left space-y-1">
            <li>• The waitlist ID is incorrect</li>
            <li>• The page was deleted or moved</li>
            <li>• You don't have permission to view this page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
