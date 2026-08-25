import type { Metadata, Viewport } from "next";

export const baseUrl = "https://lowlevelnotes.com";
export const googleSearchConsoleVerification = "ef9KpIV_Ll2l0ggil98ixxCXyg_3_mNMf0KT61fvR2o";
    
const creator = {
    name: "Giuseppe Amendolara",
}

const authors = [
    {
        name: "Giuseppe Amendolara",
        url: "https://github.com/GiuseppeAmendolara/",
    },
];

const openGraph = {
  title: "0xLN",
  description: "Organized knowledge for mastering software development.",
  url: baseUrl,
  siteName: "0xLN",

  images: [
    {
      url: "/og-image.png",
      /* standard 1.91:1 aspect ratio for social media sharing */
      width: 1200,
      height: 630,
      alt: "open graph image",
    },
  ],

  locale: "en-US",
  type: "website" as const,
};

const alternates = {
  canonical: baseUrl,

  languages: {
    "en-US": baseUrl,
    "en-GB": baseUrl,
    "en-CA": baseUrl,
    "en-AU": baseUrl,
    "en-NZ": baseUrl,
    "en-IE": baseUrl,
    "en-ZA": baseUrl,
    "en-IN": baseUrl,
    "en-PH": baseUrl,
    "en-SG": baseUrl,
    "en-HK": baseUrl,
    "en-MY": baseUrl,
    "en-TH": baseUrl,
    "en-VN": baseUrl,
    "en-ID": baseUrl,
    "en-KR": baseUrl,
    "en-JP": baseUrl,
    "en-CN": baseUrl,
    "en-TW": baseUrl,
    en: baseUrl,
  },
};

const keywords = [
  // Core keywords
  "0xLN",
  "lowlevelnotes",
  "resources",
  "programming",
  "coding",
  "software development",
  "organized knowledge",

  // Topics
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

  // Broader topics or categories
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
];

export const siteConfig = {
    viewport: {
        themeColor: "#171717",
        colorScheme: "dark" as const,
        width: "device-width" as const,
        initialScale: 1,
        minimumScale: 1,
        maximumScale: 5,
        userScalable: true,
        viewportFit: "cover" as const,
        },

    metaData: {
        title: "0xLN",
        name: "lowlevelnotes",

        description: 
            "Organized knowledge for mastering software development.",

        creator: creator.name,
        publisher: "lowlevelnotes",

        url: baseUrl,
        locale: "en-US",
        category: "technology",

        metadataBase: new URL(baseUrl),
        manifest: "/manifest.json",

        icons: {
            icon: "/favicon.ico",
            shortcut: "/favicon.ico",
            apple: "/favicon.ico",
        },

        appLinks: {
            /* Android app links require additional information like the package name and the app's SHA256 fingerprint. */
            web: {
                url: baseUrl,
            },
            desktop: {
                url: baseUrl,
            },
            ios: {
                url: baseUrl,
            },
        },

        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },

        robots: {
            /* Allow search engines to index the page and follow links. */
            index: true,
            /* Allow search engines to follow links on the page. */
            follow: true,
            /* Allow search engines to cache a copy of the page. */
            nocache: true,
        },

        authors: authors,
        openGraph,
        alternates,
    },

    keywords,

    verification: {
        google: googleSearchConsoleVerification,
    },
}