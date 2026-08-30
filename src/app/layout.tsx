import type { Metadata, Viewport } from "next";
import "./globals.css";

import { siteConfig } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import QueryProvider from "@/components/QueryProvider";
import ToastProvider from "@/components/ToastProvider";

export const viewport: Viewport = siteConfig.viewport;
export const metadata: Metadata = siteConfig.metaData;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <SessionProvider>
            <ToastProvider>
              <Header />
              {children}
              <Footer />
            </ToastProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
