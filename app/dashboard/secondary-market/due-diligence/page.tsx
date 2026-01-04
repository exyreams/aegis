"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DueDiligenceLandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Standalone Due Diligence selection is deprecated. 
    // Redirecting to Marketplace where audits can be started from specific listings.
    router.replace("/dashboard/secondary-market");
  }, [router]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-bold">Redirecting to Marketplace</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Audits are now managed directly from loan listings.
          </p>
        </div>
      </div>
    </div>
  );
}
