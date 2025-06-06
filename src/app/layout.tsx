import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/query-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CollabFlow - Project Management Platform",
  description: "Streamline your team's workflow with CollabFlow - the ultimate project management and collaboration platform",
  keywords: ["project management", "collaboration", "team workflow", "task management"],
  authors: [{ name: "Kaung Thanlwin Kyaw" }],
  creator: "Kaung Thanlwin Kyaw",
  publisher: "Kaung Thanlwin Kyaw",
  
  // Logo and favicon configuration
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  
  // Open Graph metadata for social sharing
  openGraph: {
    title: "CollabFlow - Project Management Platform",
    description: "Streamline your team's workflow with CollabFlow",
    url: "https://collab-flow-pi.vercel.app",
    siteName: "CollabFlow",
    images: [
      {
        url: "/og-image.png", // Add this image to your public folder
        width: 1200,
        height: 630,
        alt: "CollabFlow Project Management Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "CollabFlow - Project Management Platform",
    description: "Streamline your team's workflow with CollabFlow",
    images: ["/og-image.png"],
    creator: "@collabflow",
  },
  
  // Additional metadata
  manifest: "/manifest.json", // Add this file for PWA support
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags for better SEO */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <link rel="canonical" href="https://collab-flow-pi.vercel.app" />
      </head>
      <body className={cn(inter.className, "antialiased min-h-screen")}>
        <QueryProvider>
          <Toaster />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
