import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { HealthProvider } from "@/contexts/HealthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aegis RFQ - Privacy-Preserving Institutional Lending Platform",
  description:
    "Transform your lending operations with DAML smart contracts, confidential bidding, and enterprise-grade security. Built on Canton Network for institutional financial services.",
  keywords: [
    "institutional lending",
    "privacy-preserving finance",
    "DAML smart contracts",
    "Canton Network",
    "confidential bidding",
    "RFQ platform",
    "collateral management",
    "syndicated loans",
    "yield generation",
    "secondary markets",
  ],
  authors: [{ name: "Aegis RFQ" }],
  creator: "Aegis RFQ",
  publisher: "Aegis RFQ",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aegis-rfq.com",
    title: "Aegis RFQ - Privacy-Preserving Institutional Lending",
    description:
      "Transform your lending operations with DAML smart contracts and enterprise-grade security.",
    siteName: "Aegis RFQ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aegis RFQ - Privacy-Preserving Institutional Lending",
    description:
      "Transform your lending operations with DAML smart contracts and enterprise-grade security.",
    creator: "@AegisRFQ",
  },
  verification: {
    google: "google-site-verification-token",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <HealthProvider>
                {children}
                <Toaster position="top-right" />
              </HealthProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
