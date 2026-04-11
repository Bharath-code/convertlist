import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "ConvertList — Waitlist Conversion Assistant",
  description: "Convert waitlist signups into early paying customers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn("font-sans", geist.variable)}>
        <body className="antialiased">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              success: { 
                duration: 3000,
                icon: '✅',
                style: {
                  background: '#10b981',
                  color: '#fff',
                },
              },
              error: { 
                duration: 5000,
                icon: '❌',
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
              },
              loading: {
                duration: Infinity,
                icon: '⏳',
                style: {
                  background: '#6366f1',
                  color: '#fff',
                },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
