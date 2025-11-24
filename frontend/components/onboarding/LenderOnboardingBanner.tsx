"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { LenderOnboardingModal } from "./LenderModal";
import { AlertCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function LenderOnboardingBanner() {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const { auth, refreshToken } = useAuth();

  // Automatically show modal for lenders without complete profile (only once per session)
  useEffect(() => {
    if (
      auth.user?.role === "lender" &&
      !auth.user?.lenderProfile?.anonymousId &&
      !dismissed &&
      !hasAutoOpened
    ) {
      setShowModal(true);
      setHasAutoOpened(true);
    }
  }, [auth.user, dismissed, hasAutoOpened]);

  if (
    auth.user?.role !== "lender" ||
    auth.user?.lenderProfile?.anonymousId ||
    dismissed
  ) {
    return null;
  }

  return (
    <>
      <div className="border-b bg-background">
        <div className="max-w-auto mx-auto px-4 sm:px-6 lg:px-6 py-3">
          <Card className="border-primary/20 bg-gradient-to-t from-primary/5 to-card dark:bg-card">
            <CardContent className="px-4 py-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-0">
                      Complete your lender profile to start participating in
                      RFQs
                    </p>
                    <p className="text-xs text-muted-foreground mb-0">
                      Set up your privacy-protected profile to receive loan
                      requests from borrowers
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => setShowModal(true)}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Complete Setup
                  </Button>

                  <button
                    onClick={() => setDismissed(true)}
                    className="p-2 hover:bg-muted/80 rounded-full cursor-pointer transition-colors bg-background/80 backdrop-blur-sm border"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Onboarding Modal */}
      <LenderOnboardingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onComplete={async () => {
          setShowModal(false);
          // Refresh auth context to get updated lender profile
          try {
            await refreshToken();
          } catch (error) {
            // If refresh fails, fall back to page reload
            window.location.reload();
          }
        }}
        mode="onboarding"
      />
    </>
  );
}
