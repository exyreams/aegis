import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aegis - Complete Loan Lifecycle Platform",
  description:
    "End-to-end loan management platform covering document digitization, creation, trading, compliance monitoring, and ESG reporting. Built for the modern lending industry.",
  keywords: [
    "loan lifecycle management",
    "digital loan documents",
    "loan document creation",
    "loan trading platform",
    "covenant monitoring",
    "ESG lending",
    "LMA standards",
    "loan compliance",
    "sustainable finance",
    "lending technology",
  ],
  authors: [{ name: "Aegis" }],
  creator: "Aegis",
  publisher: "Aegis",
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
    url: "https://aegis-loans.com",
    title: "Aegis - Complete Loan Lifecycle Platform",
    description:
      "End-to-end loan management from document creation to ESG reporting. Built for the modern lending industry.",
    siteName: "Aegis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aegis - Complete Loan Lifecycle Platform",
    description:
      "End-to-end loan management from document creation to ESG reporting. Built for the modern lending industry.",
    creator: "@AegisLoans",
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
    <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
