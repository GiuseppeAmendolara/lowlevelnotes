import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/site";

import { JetBrains_Mono } from 'next/font/google';

import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin']
});

export const viewport: Viewport = siteConfig.viewport;

export const metadata: Metadata = {
  metadataBase: siteConfig.metaData.metadataBase,
  applicationName: siteConfig.metaData.name,
  category: siteConfig.metaData.category,
  authors: siteConfig.metaData.authors,
  creator: siteConfig.metaData.creator,
  publisher: siteConfig.metaData.publisher,
  icons: siteConfig.metaData.icons,
  alternates: siteConfig.metaData.alternates,
  appLinks: siteConfig.metaData.appLinks,
  manifest: siteConfig.metaData.manifest,
  formatDetection: siteConfig.metaData.formatDetection,
  robots: siteConfig.metaData.robots,
  openGraph: siteConfig.metaData.openGraph,
  keywords: siteConfig.keywords,
  
  verification: {
    google: siteConfig.verification.google,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
