import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Syne } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "Handoff: Client Portals for Freelancers",
  description: "Send clients a professional project link. No app download, no login needed. Set up in 30 seconds. 14-day free trial.",
  metadataBase: new URL("https://www.gethandoff.co"),
  verification: {
    google: "XVTlsA5wprL6S_jNiVqzzSttrMqsXErbBQX2jwavIwo",
  },
  openGraph: {
    title: "Handoff: Client Portals for Freelancers",
    description: "Send clients a professional project link. No app download, no login needed. Set up in 30 seconds.",
    url: "https://www.gethandoff.co",
    siteName: "Handoff",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Handoff: Client portals for freelancers",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Handoff: Client Portals for Freelancers",
    description: "Send clients a professional project link. No app download, no login needed. Set up in 30 seconds.",
    site: "@gethandoff",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/onboarding"
    >
      <html lang="en">
        <body className={`${geist.variable} ${syne.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
