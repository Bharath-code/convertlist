import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Geist, Playfair_Display, DM_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const playfairDisplay = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700']
});
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700']
});

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
      <html lang="en" className={cn(geist.variable, playfairDisplay.variable, dmSans.variable)}>
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
