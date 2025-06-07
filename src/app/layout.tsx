import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from '@vercel/speed-insights/next';

import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/query-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CollabFlow - Project Management Platform",
  description: "Streamline your team's workflow with CollabFlow - the ultimate project management and collaboration platform created by Kaung Thanlwin Kyaw",
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
    description: "Project Management Platform created by Kaung Thanlwin Kyaw - Streamline your team's workflow with the ultimate collaboration platform",
    url: "https://collab-flow-pi.vercel.app",
    siteName: "CollabFlow",
    images: [
      {
        url: "https://collab-flow-pi.vercel.app/landin-demo.jpg",
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
    description: "Project Management Platform created by Kaung Thanlwin Kyaw",
    images: ["https://collab-flow-pi.vercel.app/landin-demo.jpg"],
    creator: "@KaungThanlwinKyaw",
    site: "@collabflow",
  },
  
  // Additional metadata
  manifest: "/manifest.json",
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
  
  // Additional meta for better compatibility
  other: {
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/jpeg",
    "twitter:image:width": "1200",
    "twitter:image:height": "630",
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
        {/* Essential meta tags for Teams compatibility */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <link rel="canonical" href="https://collab-flow-pi.vercel.app" />
        
        {/* Twitter meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@collabflow" />
        <meta name="twitter:creator" content="@collabflow" />
        <meta name="twitter:title" content="CollabFlow - Project Management Platform" />
        <meta name="twitter:description" content="Project Management Platform created by Kaung Thanlwin Kyaw" />
        <meta name="twitter:image" content="https://collab-flow-pi.vercel.app/landin-demo.jpg" />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
        
        {/* Open Graph meta tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CollabFlow - Project Management Platform" />
        <meta property="og:description" content="Project Management Platform created by Kaung Thanlwin Kyaw" />
        <meta property="og:url" content="https://collab-flow-pi.vercel.app" />
        <meta property="og:site_name" content="CollabFlow" />
        <meta property="og:image" content="https://collab-flow-pi.vercel.app/landin-demo.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:locale" content="en_US" />
        
        {/* Additional meta for better SEO */}
        <meta name="author" content="Kaung Thanlwin Kyaw" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
      </head>
      <body className={cn(inter.className, "antialiased min-h-screen")}>
        <QueryProvider>
          <Toaster />
          {children}
          <SpeedInsights />
        </QueryProvider>
      </body>
    </html>
  );
}
