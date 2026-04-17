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
  title: "ConvertList — AI Waitlist Lead Scoring & Conversion Platform",
  description: "Convert waitlist signups into paying customers with AI lead scoring. Score leads by intent, generate personalized outreach, and hit 20%+ reply rates. Free tier available.",
  keywords: ["waitlist conversion", "lead scoring", "AI lead scoring", "waitlist management", "SaaS waitlist", "cold email outreach", "lead qualification", "SaaS founders", "product launch"],
  authors: [{ name: "ConvertList" }],
  creator: "ConvertList",
  publisher: "ConvertList",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://convertlist.com'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://convertlist.com',
    title: "ConvertList — AI Waitlist Lead Scoring & Conversion Platform",
    description: "Convert waitlist signups into paying customers with AI lead scoring. Score leads by intent, generate personalized outreach, and hit 20%+ reply rates.",
    siteName: "ConvertList",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ConvertList - AI Waitlist Lead Scoring",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConvertList — AI Waitlist Lead Scoring & Conversion Platform",
    description: "Convert waitlist signups into paying customers with AI lead scoring. Score leads by intent, generate personalized outreach, and hit 20%+ reply rates.",
    images: ["/og-image.png"],
    creator: "@convertlist",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
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
