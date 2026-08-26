import type { Metadata, Viewport } from "next";
import "./globals.css";

import { siteConfig } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";

export const viewport: Viewport = siteConfig.viewport;
export const metadata: Metadata = siteConfig.metaData;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <Header />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
