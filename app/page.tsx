"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/ui/Loader";
import {
  LandingNavigation,
  HeroSection,
  FeaturesSection,
  SecuritySection,
  StatsSection,
  CTASection,
  LandingFooter,
} from "@/components/landing";

export default function Home() {
  const router = useRouter();
  const { auth } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (auth.user && !auth.loading) {
      router.push("/dashboard");
    }
  }, [auth.user, auth.loading, router]);

  // Show loading while checking authentication
  if (auth.loading) {
    return <PageLoader />;
  }

  // Show landing page for unauthenticated users
  if (!auth.user) {
    return (
      <div className="min-h-screen">
        <LandingNavigation />
        <main>
          <HeroSection />
          <FeaturesSection />
          <SecuritySection />
          <StatsSection />
          <CTASection />
        </main>
        <LandingFooter />
      </div>
    );
  }

  // Show loading while redirecting authenticated users
  return <PageLoader />;
}
