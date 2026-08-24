import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from 'next/font/google';

import "./globals.css";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin']
});

export const viewport: Viewport = {
  themeColor: "#171717",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lowlevelnotes.com"),

  title: "0xLN",
  description: "Organized knowledge for mastering software development.",

  applicationName: "lowlevelnotes",
  category: "technology",

  authors: [
    {
      name: "Giuseppe Amendolara",
      url: "https://lowlevelnotes.com",
    },
  ],

  creator: "Giuseppe Amendolara",
  publisher: "lowlevelnotes",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  alternates: {
    canonical: "https://lowlevelnotes.com",
    languages: {
      "en-US": "https://lowlevelnotes.com",
    },
  },

  appLinks: {
    web: {
      url: "https://lowlevelnotes.com",
      shouldFallback: true,
    },
  },

  manifest: "/manifest.json",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  robots: {
    index: true,
    follow: true,
    nocache: true,
  },

  openGraph: {
    title: "0xLN",
    description: "Organized knowledge for mastering software development.",
    url: "https://lowlevelnotes.com",
    siteName: "0xLN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en-US",
    type: "website",
  },

  verification: {
    google: "google-site-verification=G7g0k1J8z3x5y6z7a8b9c0d1e2f3g4h5i6j7k8l9m0n",
  },

  keywords: [
    // Core search terms
    "0xLN",
    "lowlevelnotes",
    "resources",
    "programming",
    "coding",
    "software development",
    "organized knowledge",

    // Programming Languages and Topics
    "c++",
    "c",
    "c#",
    ".net",
    "assembly",
    "x86",
    "x64",
    "x86-64",
    "reverse engineering",
    "windows internals",
    "game hacking",
    "computer science",
    "data structures",
    "algorithms",
    "design patterns",
    "operating systems",
    "networking",
    "cybersecurity",

    // Typos and variations
    "low level notes",
    "low-level-notes",
    "lowlevel-notes",
    "lowlevelnotes.com",
    "lowlevelnotes.org",
    "lowlevelnotes.net",
    "lowlevelnotes.io",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header>
        <Nav />
        </header>
        {children}
        <footer className="border-t border-white/10 bg-black">
          <Footer />
        </footer>
      </body>
    </html>
  );
}
