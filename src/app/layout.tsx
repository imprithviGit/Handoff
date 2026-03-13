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
  title: "Handoff — Client Portals for Freelancers",
  description: "Send clients a professional project link. No app download, no login needed.",
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
