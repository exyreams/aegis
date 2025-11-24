"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WideModal,
  WideModalContent,
  WideModalTitle,
} from "@/components/ui/WideModal";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  Building2,
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { profileApi } from "@/lib/api";
import type { LenderProfile, LenderProfileOptions } from "@/lib/api/profile";

interface LenderOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: LenderProfile) => void;
  existingProfile?: LenderProfile | null;
  mode?: "onboarding" | "settings";
}

export function LenderOnboardingModal({
  isOpen,
  onClose,
  onComplete,
  existingProfile,
  mode = "onboarding",
}: LenderOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<LenderProfileOptions | null>(null);
  const [profile, setProfile] = useState<Partial<LenderProfile>>({
    categoryTier: undefined,
    ratingTier: undefined,
    capacityTier: undefined,
    geographicScope: undefined,
  });

  // DAML LenderCategory options that match the smart contract
  const damlLenderCategories = [
    {
      value: "Tier1Bank",
      label: "Tier 1 Bank",
      description: "Major international banks",
    },
    {
      value: "RegionalBank",
      label: "Regional Bank",
      description: "Regional and community banks",
    },
    {
      value: "InvestmentFund",
      label: "Investment Fund",
      description: "Hedge funds and investment vehicles",
    },
    {
      value: "PrivateEquity",
      label: "Private Equity",
      description: "PE firms and private lenders",
    },
    {
      value: "InsuranceCompany",
      label: "Insurance Company",
      description: "Insurance companies",
    },
    {
      value: "PensionFund",
      label: "Pension Fund",
      description: "Pension and retirement funds",
    },
    {
      value: "SpecialtyLender",
      label: "Specialty Lender",
      description: "Niche or specialty lenders",
    },
  ];

  const totalSteps = 3;
  const isSettings = mode === "settings";

  // Load existing profile data when in settings mode
  useEffect(() => {
    if (existingProfile && isSettings) {
      setProfile(existingProfile);
    }
  }, [existingProfile, isSettings]);

  // Fetch profile options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const result = await profileApi.getLenderProfileOptions();
        if (result.status === 200 && result.data) {
          setOptions(result.data);
        } else {
          toast.error("Failed to load profile options");
        }
      } catch {
        toast.error("Failed to load profile options");
      }
    };

    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (
        !profile.categoryTier ||
        !profile.ratingTier ||
        !profile.capacityTier ||
        !profile.geographicScope
      ) {
        toast.error("Please complete all required fields");
        setLoading(false);
        return;
      }

      const result = await profileApi.updateLenderProfile(profile);

      if (result.status === 200 && result.data) {
        toast.success(
          isSettings
            ? "Lender profile updated successfully!"
            : "Welcome! Your lender profile has been created."
        );
        onComplete(result.data);
        onClose();
        setCurrentStep(1); // Reset for next time
      } else {
        toast.error(result.error || "Failed to save profile");
      }
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCurrentStep(1);
      onClose();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!profile.categoryTier && !!profile.ratingTier;
      case 2:
        return !!profile.capacityTier && !!profile.geographicScope;
      case 3:
        return (
          !!profile.categoryTier &&
          !!profile.ratingTier &&
          !!profile.capacityTier &&
          !!profile.geographicScope
        );
      default:
        return false;
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: { duration: 0.2 },
    },
  };

  const stepTitles = [
    "Institution & Quality",
    "Capacity & Geography",
    "Review & Complete",
  ];

  const stepDescriptions = [
    "Define your institution type and quality tier",
    "Set lending capacity and geographic scope",
    "Review your profile and complete setup",
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8 pb-12">
            {/* Institution Type Section */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {isSettings
                    ? "Update Institution Type"
                    : "What type of institution are you?"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  This helps borrowers understand your lending focus while
                  protecting your specific identity.
                </p>
              </div>

              <div className="space-y-2">
                {options?.categoryTiers.map((category) => (
                  <div
                    key={category.value}
                    className={`cursor-pointer transition-all p-3 rounded-lg border-2 ${
                      profile.categoryTier === category.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/30"
                    }`}
                    onClick={() =>
                      setProfile({ ...profile, categoryTier: category.value })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">
                          {category.label}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                      {profile.categoryTier === category.value && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Tier Section */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {isSettings
                    ? "Update Quality Tier"
                    : "What's your quality tier?"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  This indicates your track record and reliability without
                  revealing specific ratings.
                </p>
              </div>

              <div className="space-y-2">
                {options?.ratingTiers.map((rating) => (
                  <div
                    key={rating.value}
                    className={`cursor-pointer transition-all p-3 rounded-lg border-2 ${
                      profile.ratingTier === rating.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/30"
                    }`}
                    onClick={() =>
                      setProfile({ ...profile, ratingTier: rating.value })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            rating.value === "Premium"
                              ? "default"
                              : rating.value === "Standard"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {rating.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {rating.description}
                        </p>
                      </div>
                      {profile.ratingTier === rating.value && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 pb-12">
            {/* Lending Capacity Section */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {isSettings
                    ? "Update Lending Capacity"
                    : "What's your lending capacity?"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  This helps match you with appropriate loan sizes without
                  revealing exact amounts.
                </p>
              </div>

              <div className="space-y-2">
                {options?.capacityTiers.map((capacity) => (
                  <div
                    key={capacity.value}
                    className={`cursor-pointer transition-all p-3 rounded-lg border-2 ${
                      profile.capacityTier === capacity.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/30"
                    }`}
                    onClick={() =>
                      setProfile({ ...profile, capacityTier: capacity.value })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">
                          {capacity.label}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {capacity.description}
                        </p>
                      </div>
                      {profile.capacityTier === capacity.value && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographic Scope Section */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {isSettings
                    ? "Update Geographic Scope"
                    : "What's your geographic scope?"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  This indicates your operational reach without revealing
                  specific markets.
                </p>
              </div>

              <div className="space-y-2">
                {options?.geographicScopes.map((scope) => (
                  <div
                    key={scope.value}
                    className={`cursor-pointer transition-all p-3 rounded-lg border-2 ${
                      profile.geographicScope === scope.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/30"
                    }`}
                    onClick={() =>
                      setProfile({ ...profile, geographicScope: scope.value })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{scope.label}</h4>
                        <p className="text-xs text-muted-foreground">
                          {scope.description}
                        </p>
                      </div>
                      {profile.geographicScope === scope.value && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 pb-12">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isSettings
                  ? "Review Profile Updates"
                  : "Review & Complete Setup"}
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Please review your profile information before completing the
                setup.
              </p>
            </div>

            {/* Privacy Notice with Info variant */}
            <Alert variant="info">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacy Protected:</strong> Your specific institution
                details, exact financial capacity, and precise geographic
                markets remain completely confidential. Only general tier
                information is used for matching purposes.
              </AlertDescription>
            </Alert>

            {/* Profile Summary */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h4 className="text-base font-semibold mb-4">
                  Profile Summary
                </h4>

                {/* Anonymous ID Preview */}
                <Alert className="mb-4">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Your Anonymous ID</p>
                      <code className="text-sm font-mono font-bold block p-2 bg-primary/10 text-primary rounded">
                        {profile.categoryTier === "Tier1Bank" ||
                        profile.categoryTier === "RegionalBank"
                          ? "AEGIS-PRIV-BANK-XXX"
                          : profile.categoryTier === "InvestmentFund" ||
                            profile.categoryTier === "PrivateEquity"
                          ? "AEGIS-PRIV-FUND-XXX"
                          : profile.categoryTier === "InsuranceCompany" ||
                            profile.categoryTier === "PensionFund"
                          ? "AEGIS-PRIV-INST-XXX"
                          : "AEGIS-PRIV-SPEC-XXX"}
                      </code>
                      <p className="text-xs text-muted-foreground">
                        This privacy-protected identifier will be shown to
                        borrowers. Your real identity remains confidential.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Institution Type:
                    </span>
                    <Badge variant="outline">
                      {options?.categoryTiers.find(
                        (c) => c.value === profile.categoryTier
                      )?.label || "Not selected"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Quality Tier:
                    </span>
                    <Badge variant="outline">
                      {options?.ratingTiers.find(
                        (r) => r.value === profile.ratingTier
                      )?.label || "Not selected"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Capacity Tier:
                    </span>
                    <Badge variant="outline">
                      {options?.capacityTiers.find(
                        (c) => c.value === profile.capacityTier
                      )?.label || "Not selected"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Geographic Scope:
                    </span>
                    <Badge variant="outline">
                      {options?.geographicScopes.find(
                        (g) => g.value === profile.geographicScope
                      )?.label || "Not selected"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <WideModal open={isOpen} onOpenChange={handleClose}>
      <WideModalContent className="overflow-hidden" showCloseButton={false}>
        <WideModalTitle className="sr-only">
          {isSettings
            ? "Update Lender Profile"
            : "Complete Your Lender Profile"}{" "}
          - Step {currentStep} of 3: {stepTitles[currentStep - 1]}
        </WideModalTitle>

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="flex w-full h-full bg-background rounded-lg shadow-2xl border relative"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-3 right-3 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/80 backdrop-blur-sm border"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Sidebar - Progress & Navigation */}
          <div className="w-80 bg-gradient-to-t from-primary/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Building2 size={32} className="text-foreground" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {isSettings ? "Update Profile" : "Lender Profile"}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Privacy-Protected Setup
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Steps - 3 Steps */}
            <div className="flex-1 p-6">
              <div className="space-y-4">
                {stepTitles.map((title, index) => {
                  const stepNumber = index + 1;
                  const isActive = stepNumber === currentStep;
                  const isCompleted = stepNumber < currentStep;

                  return (
                    <motion.div
                      key={stepNumber}
                      className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                        isActive
                          ? "bg-primary/10 border border-primary/20"
                          : isCompleted
                          ? "bg-muted/50"
                          : "opacity-60"
                      }`}
                      animate={{
                        scale: isActive ? 1.02 : 1,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        },
                      }}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : isActive
                            ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? "✓" : stepNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-sm mb-1 ${
                            isActive
                              ? "text-foreground"
                              : isCompleted
                              ? "text-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {title}
                        </h3>
                        <p
                          className={`text-xs leading-relaxed ${
                            isActive
                              ? "text-muted-foreground"
                              : "text-muted-foreground/70"
                          }`}
                        >
                          {stepDescriptions[index]}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Progress Bar - Moved above buttons */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Progress
                </span>
                <span className="text-sm font-bold text-foreground">
                  {Math.round((currentStep / 3) * 100)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 3) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="p-6 pt-0 border-t border-border/30">
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || loading}
                  variant="ghost"
                  className="disabled:opacity-50 flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex-1"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleComplete}
                    disabled={!canProceed() || loading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>{isSettings ? "Update Profile" : "Complete Setup"}</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0">
            <div className="p-8 pt-16 h-full min-h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="min-h-[400px]"
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </WideModalContent>
    </WideModal>
  );
}
