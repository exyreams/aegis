"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  WideModal,
  WideModalContent,
  WideModalTitle,
} from "@/components/ui/WideModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  DollarSign,
  Clock,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Eye,
  X,
  Timer,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { rfqApi, authApi } from "@/lib/api";
import type { UserRole } from "@/types/api";

import { GlassAvatar } from "@/components/ui/GlassAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

import {
  FileDescription,
  Loan,
  Collateral,
  BitcoinIcon,
  EthereumIcon,
  USDCIcon,
  USDTIcon,
  DAIIcon,
  USTreasuryIcon,
  UKGiltIcon,
  CorporateBondAAAIcon,
  CorporateBondAAIcon,
  AppleStockIcon,
  MicrosoftStockIcon,
  GoogleStockIcon,
  GoldIcon,
  SilverIcon,
  OilIcon,
  NYCRealEstateIcon,
  SFRealEstateIcon,
  BuildingIcon,
  VerifiedIcon,
} from "@/components/icons";

// Form validation schema
const createRFQSchema = z.object({
  loanAmount: z
    .number()
    .min(1000, "Minimum loan amount is $1,000")
    .max(10000000, "Maximum loan amount is $10,000,000"),
  collateralAmount: z.number().min(1, "Collateral amount is required"),
  collateralAsset: z.string().min(1, "Collateral asset is required"),
  collateralCategory: z.string().min(1, "Collateral category is required"),
  loanDurationDays: z
    .number()
    .min(1, "Minimum duration is 1 day")
    .max(365, "Maximum duration is 365 days"),
  approvedLenders: z
    .array(z.string())
    .min(1, "At least one lender must be selected"),
});

type CreateRFQFormData = z.infer<typeof createRFQSchema>;

interface CreateRFQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const SUPPORTED_ASSETS = [
  // Cryptocurrencies
  {
    category: "Cryptocurrency",
    value: "BTC",
    label: "Bitcoin (BTC)",
    icon: BitcoinIcon,
    type: "crypto",
  },
  {
    category: "Cryptocurrency",
    value: "ETH",
    label: "Ethereum (ETH)",
    icon: EthereumIcon,
    type: "crypto",
  },

  // Stablecoins
  {
    category: "Stablecoin",
    value: "USDC",
    label: "USD Coin (USDC)",
    icon: USDCIcon,
    type: "stablecoin",
  },
  {
    category: "Stablecoin",
    value: "USDT",
    label: "Tether (USDT)",
    icon: USDTIcon,
    type: "stablecoin",
  },
  {
    category: "Stablecoin",
    value: "DAI",
    label: "Dai (DAI)",
    icon: DAIIcon,
    type: "stablecoin",
  },

  // Government Bonds
  {
    category: "GovernmentBond",
    value: "US_TREASURY",
    label: "US Treasury Bonds",
    icon: USTreasuryIcon,
    type: "bond",
  },
  {
    category: "GovernmentBond",
    value: "UK_GILT",
    label: "UK Government Gilts",
    icon: UKGiltIcon,
    type: "bond",
  },

  // Corporate Bonds
  {
    category: "CorporateBond",
    value: "CORP_BOND_AAA",
    label: "AAA Corporate Bonds",
    icon: CorporateBondAAAIcon,
    type: "bond",
  },
  {
    category: "CorporateBond",
    value: "CORP_BOND_AA",
    label: "AA Corporate Bonds",
    icon: CorporateBondAAIcon,
    type: "bond",
  },

  // Equities
  {
    category: "Equity",
    value: "STOCK_AAPL",
    label: "Apple Inc. (AAPL)",
    icon: AppleStockIcon,
    type: "equity",
  },
  {
    category: "Equity",
    value: "STOCK_MSFT",
    label: "Microsoft Corp. (MSFT)",
    icon: MicrosoftStockIcon,
    type: "equity",
  },
  {
    category: "Equity",
    value: "STOCK_GOOGL",
    label: "Alphabet Inc. (GOOGL)",
    icon: GoogleStockIcon,
    type: "equity",
  },

  // Commodities
  {
    category: "Commodity",
    value: "GOLD",
    label: "Gold",
    icon: GoldIcon,
    type: "commodity",
  },
  {
    category: "Commodity",
    value: "SILVER",
    label: "Silver",
    icon: SilverIcon,
    type: "commodity",
  },
  {
    category: "Commodity",
    value: "OIL",
    label: "Crude Oil",
    icon: OilIcon,
    type: "commodity",
  },

  // Real Estate Tokens
  {
    category: "RealEstateToken",
    value: "RE_TOKEN_NYC",
    label: "NYC Real Estate Token",
    icon: NYCRealEstateIcon,
    type: "realestate",
  },
  {
    category: "RealEstateToken",
    value: "RE_TOKEN_SF",
    label: "San Francisco RE Token",
    icon: SFRealEstateIcon,
    type: "realestate",
  },
];

const DURATION_PRESETS = [
  { days: 30, label: "30 days" },
  { days: 60, label: "60 days" },
  { days: 90, label: "90 days" },
  { days: 180, label: "6 months" },
  { days: 365, label: "1 year" },
];

const LOAN_AMOUNT_PRESETS = [
  { amount: 1000, label: "$1K" },
  { amount: 5000, label: "$5K" },
  { amount: 10000, label: "$10K" },
  { amount: 25000, label: "$25K" },
  { amount: 50000, label: "$50K" },
  { amount: 100000, label: "$100K" },
];

const COLLATERAL_RATIO_PRESETS = [
  { ratio: 1.2, label: "1.2x", description: "Minimum" },
  { ratio: 1.3, label: "1.3x", description: "Conservative" },
  { ratio: 1.4, label: "1.4x", description: "Balanced" },
  { ratio: 1.5, label: "1.5x", description: "Safe" },
  { ratio: 2.0, label: "2.0x", description: "Ultra Safe" },
];

export function CreateRFQModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateRFQModalProps) {
  const { auth } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableLenders, setAvailableLenders] = useState<
    Array<{
      id: string;
      name: string;
      damlParty: string;
      image?: string | null;
      role?: UserRole;
      lenderProfile?: {
        anonymousId: string;
        categoryTier:
          | "Tier1Bank"
          | "RegionalBank"
          | "InvestmentFund"
          | "PrivateEquity"
          | "InsuranceCompany"
          | "PensionFund"
          | "SpecialtyLender";
        ratingTier: "Premium" | "Standard" | "Basic";
        capacityTier: "Large" | "Medium" | "Small";
        geographicScope: "Global" | "Regional" | "Local";
      } | null;
    }>
  >([]);
  const [selectedLenders, setSelectedLenders] = useState<string[]>([]);
  const [loadingLenders, setLoadingLenders] = useState(false);

  // Get lender display name (anonymous ID if available, fallback to generated)
  const getLenderDisplayName = (lender: any, index: number) => {
    if (lender.lenderProfile?.anonymousId) {
      return lender.lenderProfile.anonymousId;
    }
    // Fallback for lenders without profiles
    const instNumber = String(index + 1).padStart(3, "0");
    return `AEGIS-INST-${instNumber}`;
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateRFQFormData>({
    resolver: zodResolver(createRFQSchema),
    defaultValues: {
      loanAmount: 0,
      collateralAmount: 0,
      collateralAsset: "",
      collateralCategory: "",
      loanDurationDays: 30,
      approvedLenders: [],
    },
  });

  const watchedValues = watch();
  const collateralRatio =
    watchedValues.loanAmount > 0 && watchedValues.collateralAmount > 0
      ? (watchedValues.collateralAmount / watchedValues.loanAmount).toFixed(2)
      : "0";

  // Helper function to check if collateral requirements are met
  const isCollateralSufficient = () => {
    if (
      !watchedValues.loanAmount ||
      !watchedValues.collateralAmount ||
      !watchedValues.collateralAsset
    ) {
      return false;
    }

    const selectedAsset = SUPPORTED_ASSETS.find(
      (asset) => asset.value === watchedValues.collateralAsset
    );
    const haircut = getAssetHaircut(selectedAsset?.type);
    const faceValueRatio =
      watchedValues.collateralAmount / watchedValues.loanAmount;
    const effectiveRatio = faceValueRatio * (1 - haircut);

    return effectiveRatio >= 1.2;
  };

  // Helper function to get asset haircut based on type
  const getAssetHaircut = (assetType?: string) => {
    switch (assetType) {
      case "crypto":
        return 0.1; // 10% haircut for crypto
      case "equity":
        return 0.15; // 15% haircut for stocks
      case "commodity":
        return 0.12; // 12% haircut for commodities
      case "realestate":
        return 0.2; // 20% haircut for real estate tokens
      case "stablecoin":
        return 0.05; // 5% haircut for stablecoins
      case "bond":
        return 0.05; // 5% haircut for bonds
      default:
        return 0.1; // Default 10% haircut
    }
  };

  // Helper function to get minimum collateral amount needed
  const getMinimumCollateralAmount = () => {
    if (!watchedValues.loanAmount || !watchedValues.collateralAsset) {
      return 0;
    }

    const selectedAsset = SUPPORTED_ASSETS.find(
      (asset) => asset.value === watchedValues.collateralAsset
    );
    const haircut = getAssetHaircut(selectedAsset?.type);

    // Calculate minimum collateral needed for 1.2x effective ratio
    return Math.ceil((watchedValues.loanAmount * 1.2) / (1 - haircut));
  };

  // Helper function to format asset type for display
  const formatAssetType = (assetType?: string) => {
    switch (assetType) {
      case "stablecoin":
        return "Stablecoin";
      case "crypto":
        return "Cryptocurrency";
      case "equity":
        return "Equity";
      case "commodity":
        return "Commodity";
      case "realestate":
        return "Real Estate";
      case "bond":
        return "Bond";
      default:
        return "Unknown";
    }
  };

  // Load available lenders
  const loadLenders = async () => {
    if (availableLenders.length > 0) return;

    setLoadingLenders(true);
    try {
      const result = await authApi.listLenders();
      if (result.status === 200 && result.data) {
        // Filter and map to the expected format - only include lenders with valid DAML parties
        const lenders = result.data
          .filter((user) => user.damlParty && user.damlParty.trim() !== "")
          .map((user) => ({
            id: user.id,
            name: user.name,
            damlParty: user.damlParty,
            image: user.image,
            role: user.role,
            lenderProfile: user.lenderProfile, // Include lender profile for anonymous ID
          }));

        setAvailableLenders(lenders);

        if (lenders.length === 0) {
          toast.error("No lenders with valid DAML parties found");
        }
      } else {
        throw new Error(result.error || "Failed to fetch lenders");
      }
    } catch (error) {
      console.error("Failed to load lenders:", error);
      toast.error("Failed to load lenders from database");
    } finally {
      setLoadingLenders(false);
    }
  };

  const handleLenderToggle = (lenderId: string) => {
    const newSelected = selectedLenders.includes(lenderId)
      ? selectedLenders.filter((id) => id !== lenderId)
      : [...selectedLenders, lenderId];

    setSelectedLenders(newSelected);
    setValue("approvedLenders", newSelected);
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      const {
        loanAmount,
        collateralAmount,
        collateralAsset,
        collateralCategory,
      } = watchedValues;
      if (!loanAmount || loanAmount < 1000) {
        toast.error("Please enter a valid loan amount (minimum $1,000)");
        return;
      }
      if (!collateralAmount || collateralAmount < 1) {
        toast.error("Please enter a valid collateral amount");
        return;
      }
      if (!collateralAsset || !collateralCategory) {
        toast.error("Please select a collateral asset");
        return;
      }
      // Check effective collateral ratio (accounting for haircuts)
      const selectedAsset = SUPPORTED_ASSETS.find(
        (asset) => asset.value === collateralAsset
      );
      const haircut = getAssetHaircut(selectedAsset?.type);

      const faceValueRatio = collateralAmount / loanAmount;
      const effectiveRatio = faceValueRatio * (1 - haircut);

      if (effectiveRatio < 1.2) {
        const requiredCollateral = Math.ceil(
          (loanAmount * 1.2) / (1 - haircut)
        );
        toast.error(
          `Insufficient collateral after ${(haircut * 100).toFixed(
            0
          )}% risk haircut. ` +
            `Need $${requiredCollateral.toLocaleString()} for ${formatAssetType(
              selectedAsset?.type
            )} assets.`
        );
        return;
      }
    }

    if (currentStep === 2) {
      const { loanDurationDays } = watchedValues;
      if (!loanDurationDays || loanDurationDays < 1 || loanDurationDays > 365) {
        toast.error("Please enter a valid loan duration (1-365 days)");
        return;
      }
    }

    if (currentStep === 3) {
      if (selectedLenders.length === 0) {
        toast.error("Please select at least one lender");
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 2) {
        loadLenders();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CreateRFQFormData) => {
    if (!auth.user) {
      toast.error("You must be logged in to create an RFQ");
      return;
    }

    if (!auth.user.damlParty) {
      toast.error("DAML party not found. Please contact support.");
      return;
    }

    // Validate effective collateral ratio (accounting for haircuts)
    const selectedAsset = SUPPORTED_ASSETS.find(
      (asset) => asset.value === data.collateralAsset
    );
    const haircut = getAssetHaircut(selectedAsset?.type);

    const faceValueRatio = data.collateralAmount / data.loanAmount;
    const effectiveRatio = faceValueRatio * (1 - haircut);

    if (effectiveRatio < 1.2) {
      const requiredCollateral = Math.ceil(
        (data.loanAmount * 1.2) / (1 - haircut)
      );
      toast.error(
        `Insufficient collateral after ${(haircut * 100).toFixed(
          0
        )}% risk haircut. ` +
          `Effective ratio: ${effectiveRatio.toFixed(2)}x. ` +
          `Please increase collateral to $${requiredCollateral.toLocaleString()} or more.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await rfqApi.createRFQ({
        borrower: auth.user.damlParty,
        loanAmount: data.loanAmount,
        collateralAmount: data.collateralAmount,
        collateralAsset: data.collateralAsset,
        collateralCategory: data.collateralCategory,
        loanDurationDays: data.loanDurationDays,
        approvedLenders: data.approvedLenders,
      });

      if (result.status === 201) {
        toast.success("RFQ created successfully! Lenders will be notified.");
        reset();
        setCurrentStep(1);
        setSelectedLenders([]);
        setAvailableLenders([]);
        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error(result.error || "Failed to create RFQ");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create RFQ";
      toast.error(errorMessage);

      // If it's a DAML-related error, provide more context
      if (errorMessage.includes("DAML") || errorMessage.includes("ledger")) {
        toast.error(
          "DAML ledger connection issue. Please ensure the ledger is running."
        );
      }

      // Handle specific DAML validation errors
      if (errorMessage.includes("Template precondition violated")) {
        if (errorMessage.includes("meetsCollateralRequirements")) {
          toast.error(
            "Collateral validation failed. Please ensure your collateral meets the minimum requirements after risk adjustments."
          );
        } else if (errorMessage.includes("loanAmount > 0.0")) {
          toast.error("Loan amount must be greater than zero.");
        } else if (errorMessage.includes("not (null collateralAssets)")) {
          toast.error("At least one collateral asset is required.");
        } else {
          toast.error(
            "RFQ validation failed. Please check all fields meet the requirements."
          );
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setCurrentStep(1);
      setSelectedLenders([]);
      setAvailableLenders([]);
      onOpenChange(false);
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
    "Loan Requirements",
    "Terms & Duration",
    "Lender Network",
    "Final Review",
  ];

  const stepDescriptions = [
    "Define your loan amount and collateral details",
    "Set loan duration and repayment terms",
    "Select institutional lenders for your request",
    "Review and submit your RFQ to the network",
  ];

  return (
    <WideModal open={open} onOpenChange={handleClose}>
      <WideModalContent className="overflow-hidden" showCloseButton={false}>
        <WideModalTitle className="sr-only">
          Create Request for Quote - Step {currentStep} of 4:{" "}
          {stepTitles[currentStep - 1]}
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
            disabled={isSubmitting}
            className="absolute top-3 right-3 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/80 backdrop-blur-sm border"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Sidebar - Progress & Navigation */}
          <div className="w-80 bg-gradient-to-t from-primary/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <FileDescription size={32} className="text-foreground" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    Request for Quote
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Institutional Lending Platform
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex-1 p-6">
              <div className="space-y-6">
                {stepTitles.map((title, index) => {
                  const stepNumber = index + 1;
                  const isActive = stepNumber === currentStep;
                  const isCompleted = stepNumber < currentStep;

                  return (
                    <motion.div
                      key={stepNumber}
                      className={`flex items-start gap-4 ${
                        isActive
                          ? "opacity-100"
                          : isCompleted
                          ? "opacity-80"
                          : "opacity-50"
                      }`}
                      animate={{
                        scale: isActive ? 1.05 : 1,
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
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {title}
                        </h3>
                        <p className="text-xs text-muted-foreground/80 mt-1">
                          {stepDescriptions[index]}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {Math.round((currentStep / 4) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 4) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="p-6 border-t border-border/30">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isSubmitting}
                  variant="ghost"
                  className="disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={
                            (currentStep === 1 && !isCollateralSufficient()) ||
                            (currentStep === 3 && selectedLenders.length === 0)
                          }
                          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          {currentStep === 3 ? "Review" : "Continue"}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </TooltipTrigger>
                      {currentStep === 1 && !isCollateralSufficient() && (
                        <TooltipContent>
                          <p>
                            Increase collateral to meet minimum requirements
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>Submit RFQ</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0">
            <div className="p-8 pt-16 h-full min-h-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Loan Requirements */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Loan Amount Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Loan className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              Loan Amount
                            </h3>
                            <p className="text-muted-foreground">
                              How much funding do you need?
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label
                            htmlFor="loanAmount"
                            className="text-base font-medium text-foreground"
                          >
                            Requested Amount (USD)
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="loanAmount"
                              type="number"
                              placeholder="Enter loan amount"
                              className="pl-10 h-10 text-base font-medium border-2 focus:border-primary rounded-lg"
                              {...register("loanAmount", {
                                valueAsNumber: true,
                                onChange: (e) => {
                                  const newLoanAmount = parseFloat(
                                    e.target.value
                                  );

                                  // Auto-update collateral if asset is selected and amount is insufficient
                                  if (
                                    newLoanAmount > 0 &&
                                    watchedValues.collateralAsset
                                  ) {
                                    const selectedAsset = SUPPORTED_ASSETS.find(
                                      (asset) =>
                                        asset.value ===
                                        watchedValues.collateralAsset
                                    );
                                    if (selectedAsset) {
                                      const haircut = getAssetHaircut(
                                        selectedAsset.type
                                      );
                                      const minCollateral = Math.ceil(
                                        (newLoanAmount * 1.2) / (1 - haircut)
                                      );

                                      // Update collateral if current amount would be insufficient
                                      if (
                                        !watchedValues.collateralAmount ||
                                        (watchedValues.collateralAmount /
                                          newLoanAmount) *
                                          (1 - haircut) <
                                          1.2
                                      ) {
                                        setValue(
                                          "collateralAmount",
                                          minCollateral
                                        );
                                      }
                                    }
                                  }
                                },
                              })}
                            />
                          </div>
                          {errors.loanAmount && (
                            <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">
                                {errors.loanAmount.message}
                              </span>
                            </div>
                          )}

                          {/* Loan Amount Presets */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-muted-foreground">
                              Quick Select
                            </Label>
                            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                              {LOAN_AMOUNT_PRESETS.map((preset) => (
                                <button
                                  key={preset.amount}
                                  type="button"
                                  onClick={() =>
                                    setValue("loanAmount", preset.amount)
                                  }
                                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                    watchedValues.loanAmount === preset.amount
                                      ? "border-primary bg-primary/5 text-primary"
                                      : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Collateral Section */}
                      <div className="space-y-6 pt-4 border-t border-border/30">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-muted rounded-lg">
                            <Collateral className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              Collateral Details
                            </h3>
                            <p className="text-muted-foreground">
                              Secure your loan with digital assets
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <Label
                              htmlFor="collateralAmount"
                              className="text-base font-medium text-foreground"
                            >
                              Collateral Value (USD)
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="collateralAmount"
                                type="number"
                                placeholder="Enter collateral value"
                                className="pl-10 h-10 text-base font-medium border-2 focus:border-primary rounded-lg"
                                {...register("collateralAmount", {
                                  valueAsNumber: true,
                                })}
                              />
                            </div>
                            {errors.collateralAmount && (
                              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">
                                  {errors.collateralAmount.message}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <Label
                              htmlFor="collateralAsset"
                              className="text-base font-medium text-foreground"
                            >
                              Asset Type
                            </Label>
                            <Select
                              onValueChange={(value) => {
                                const selectedAsset = SUPPORTED_ASSETS.find(
                                  (asset) => asset.value === value
                                );
                                if (selectedAsset) {
                                  setValue("collateralAsset", value);
                                  setValue(
                                    "collateralCategory",
                                    selectedAsset.category
                                  );

                                  // Auto-suggest minimum collateral if loan amount is set
                                  if (watchedValues.loanAmount > 0) {
                                    const haircut = getAssetHaircut(
                                      selectedAsset.type
                                    );
                                    const minCollateral = Math.ceil(
                                      (watchedValues.loanAmount * 1.2) /
                                        (1 - haircut)
                                    );

                                    // Only update if current amount is insufficient
                                    if (
                                      !watchedValues.collateralAmount ||
                                      watchedValues.collateralAmount <
                                        minCollateral
                                    ) {
                                      setValue(
                                        "collateralAmount",
                                        minCollateral
                                      );
                                      toast.success(
                                        `Collateral amount updated to $${minCollateral.toLocaleString()} (minimum for ${
                                          selectedAsset.type
                                        } assets)`
                                      );
                                    }
                                  }
                                }
                              }}
                            >
                              <SelectTrigger className="h-10 border-2 focus:border-primary rounded-lg">
                                <SelectValue placeholder="Select collateral asset" />
                              </SelectTrigger>
                              <SelectContent className="max-h-80">
                                {/* Group assets by category */}
                                {Object.entries(
                                  SUPPORTED_ASSETS.reduce((groups, asset) => {
                                    const category = asset.category;
                                    if (!groups[category])
                                      groups[category] = [];
                                    groups[category].push(asset);
                                    return groups;
                                  }, {} as Record<string, typeof SUPPORTED_ASSETS>)
                                ).map(([category, assets]) => (
                                  <div key={category}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                      {category
                                        .replace(/([A-Z])/g, " $1")
                                        .trim()}
                                    </div>
                                    {assets.map((asset) => {
                                      const IconComponent = asset.icon;
                                      return (
                                        <SelectItem
                                          key={asset.value}
                                          value={asset.value}
                                        >
                                          <div className="flex items-center gap-3 py-2">
                                            <IconComponent
                                              size={20}
                                              className={
                                                asset.value === "STOCK_AAPL"
                                                  ? "text-foreground"
                                                  : ""
                                              }
                                            />
                                            <span className="font-medium">
                                              {asset.label}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.collateralAsset && (
                              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">
                                  {errors.collateralAsset.message}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Unified Collateral Assessment & Requirements */}
                        {watchedValues.loanAmount > 0 &&
                          watchedValues.collateralAsset &&
                          (() => {
                            const selectedAsset = SUPPORTED_ASSETS.find(
                              (asset) =>
                                asset.value === watchedValues.collateralAsset
                            );
                            const haircut = getAssetHaircut(
                              selectedAsset?.type
                            );
                            const minRequiredAmount =
                              getMinimumCollateralAmount();
                            const currentAmount =
                              watchedValues.collateralAmount || 0;
                            const faceValueRatio =
                              currentAmount > 0
                                ? currentAmount / watchedValues.loanAmount
                                : 0;
                            const effectiveRatio =
                              faceValueRatio * (1 - haircut);
                            const isVolatileAsset = [
                              "crypto",
                              "equity",
                              "commodity",
                              "realestate",
                            ].includes(selectedAsset?.type || "");
                            const hasCollateralAmount = currentAmount > 0;

                            return (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4"
                              >
                                <div
                                  className={`relative w-full rounded-lg border px-4 py-4 text-sm ${
                                    hasCollateralAmount && effectiveRatio < 1.2
                                      ? "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)] text-[#DC2626] dark:bg-[rgba(239,68,68,0.15)] dark:border-[rgba(239,68,68,0.3)] dark:text-[#EF4444]"
                                      : hasCollateralAmount && isVolatileAsset
                                      ? "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)] text-[#D97706] dark:bg-[rgba(245,158,11,0.15)] dark:border-[rgba(245,158,11,0.3)] dark:text-[#F59E0B]"
                                      : "bg-card text-card-foreground border-border"
                                  }`}
                                >
                                  <div className="space-y-4">
                                    {/* Header with minimum required and current ratio */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {hasCollateralAmount &&
                                        effectiveRatio < 1.2 ? (
                                          <AlertCircle className="h-4 w-4 text-destructive" />
                                        ) : (
                                          <CheckCircle2 className="h-4 w-4 text-primary" />
                                        )}
                                        <h4 className="font-medium tracking-tight">
                                          {hasCollateralAmount &&
                                          effectiveRatio < 1.2
                                            ? "Insufficient Collateral After Risk Adjustment"
                                            : hasCollateralAmount &&
                                              isVolatileAsset
                                            ? "Volatile Asset Risk Assessment"
                                            : "Collateral Assessment"}
                                        </h4>
                                      </div>
                                      {hasCollateralAmount && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-2xl font-bold">
                                            {faceValueRatio.toFixed(2)}x
                                          </span>
                                          {faceValueRatio < 1.2 && (
                                            <Badge
                                              variant="destructive"
                                              className="text-xs"
                                            >
                                              Insufficient
                                            </Badge>
                                          )}
                                          {faceValueRatio >= 1.2 &&
                                            faceValueRatio < 1.5 && (
                                              <Badge
                                                variant="secondary"
                                                className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800/30"
                                              >
                                                Minimum
                                              </Badge>
                                            )}
                                          {faceValueRatio >= 1.5 && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800/30"
                                            >
                                              Safe
                                            </Badge>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Asset info and minimum required */}
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">
                                          Asset Type
                                        </span>
                                        <div className="font-medium">
                                          {formatAssetType(selectedAsset?.type)}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Risk Haircut
                                        </span>
                                        <div className="font-medium text-destructive">
                                          -{(haircut * 100).toFixed(0)}%
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">
                                          Minimum Required
                                        </span>
                                        <div className="font-bold text-foreground">
                                          ${minRequiredAmount.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Current analysis (only if amount is entered) */}
                                    {hasCollateralAmount && (
                                      <div className="border-t pt-3 space-y-2">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <span className="text-muted-foreground">
                                              Face Value Ratio
                                            </span>
                                            <div className="font-medium">
                                              {faceValueRatio.toFixed(2)}x
                                            </div>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">
                                              Effective Ratio
                                            </span>
                                            <div
                                              className={`font-bold ${
                                                effectiveRatio < 1.2
                                                  ? "text-destructive"
                                                  : "text-foreground"
                                              }`}
                                            >
                                              {effectiveRatio.toFixed(2)}x
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                                          <span>Required Minimum:</span>
                                          <span>1.20x</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Recommendation section */}
                                    {hasCollateralAmount &&
                                      effectiveRatio < 1.2 && (
                                        <div className="bg-[rgba(239,68,68,0.05)] text-[#B91C1C] rounded border border-[rgba(239,68,68,0.15)] p-3 dark:bg-[rgba(239,68,68,0.1)] dark:text-[#FCA5A5] dark:border-[rgba(239,68,68,0.25)]">
                                          <p className="text-sm">
                                            <span className="font-medium">
                                              Recommendation:
                                            </span>{" "}
                                            Increase collateral to{" "}
                                            <span className="font-bold">
                                              $
                                              {minRequiredAmount.toLocaleString()}
                                            </span>{" "}
                                            to meet minimum requirements.
                                          </p>
                                        </div>
                                      )}

                                    {/* Volatility warning */}
                                    {hasCollateralAmount &&
                                      isVolatileAsset &&
                                      effectiveRatio >= 1.2 && (
                                        <p className="text-sm text-muted-foreground">
                                          {selectedAsset?.type === "crypto" &&
                                            "Cryptocurrency assets are subject to high volatility. Higher collateral ratios may secure better interest rates."}
                                          {selectedAsset?.type === "equity" &&
                                            "Stock collateral values fluctuate with market conditions. Consider additional collateral for optimal terms."}
                                          {selectedAsset?.type ===
                                            "commodity" &&
                                            "Commodity prices can be volatile. Diversifying collateral types may reduce risk."}
                                          {selectedAsset?.type ===
                                            "realestate" &&
                                            "Real estate tokens may have limited liquidity during market stress periods."}
                                        </p>
                                      )}

                                    {/* Use Minimum Button */}
                                    <Button
                                      type="button"
                                      variant="default"
                                      size="sm"
                                      onClick={() =>
                                        setValue(
                                          "collateralAmount",
                                          minRequiredAmount
                                        )
                                      }
                                      className="w-full"
                                      disabled={
                                        currentAmount >= minRequiredAmount
                                      }
                                    >
                                      {currentAmount >= minRequiredAmount
                                        ? "Minimum Met"
                                        : "Use Minimum Amount"}
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })()}

                        {/* Smart Collateral Ratio Suggestions */}
                        {watchedValues.loanAmount > 0 && (
                          <div className="space-y-4">
                            <Label className="text-base font-medium text-foreground">
                              Collateral Ratio Suggestions
                            </Label>
                            {watchedValues.collateralAsset &&
                              (() => {
                                const selectedAsset = SUPPORTED_ASSETS.find(
                                  (asset) =>
                                    asset.value ===
                                    watchedValues.collateralAsset
                                );
                                const haircut = getAssetHaircut(
                                  selectedAsset?.type
                                );

                                // For volatile assets, calculate amounts that account for haircut
                                const isVolatileAsset = [
                                  "crypto",
                                  "equity",
                                  "commodity",
                                  "realestate",
                                ].includes(selectedAsset?.type || "");

                                return (
                                  <>
                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                      {COLLATERAL_RATIO_PRESETS.map(
                                        (preset) => {
                                          const calculatedAmount =
                                            isVolatileAsset
                                              ? Math.ceil(
                                                  (watchedValues.loanAmount *
                                                    preset.ratio) /
                                                    (1 - haircut)
                                                )
                                              : Math.round(
                                                  watchedValues.loanAmount *
                                                    preset.ratio
                                                );
                                          const isSelected =
                                            watchedValues.collateralAmount ===
                                            calculatedAmount;

                                          return (
                                            <button
                                              key={preset.ratio}
                                              type="button"
                                              onClick={() =>
                                                setValue(
                                                  "collateralAmount",
                                                  calculatedAmount
                                                )
                                              }
                                              className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                                                isSelected
                                                  ? "border-primary bg-primary/5 text-primary"
                                                  : "border-border bg-card hover:border-primary/30"
                                              }`}
                                            >
                                              <div className="text-center">
                                                <p className="font-bold text-lg">
                                                  {preset.label}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {preset.description}
                                                </p>
                                                <p className="text-sm font-medium mt-1">
                                                  $
                                                  {calculatedAmount.toLocaleString()}
                                                </p>
                                                {isVolatileAsset && (
                                                  <p className="text-xs text-muted-foreground">
                                                    {preset.ratio}x effective
                                                  </p>
                                                )}
                                              </div>
                                            </button>
                                          );
                                        }
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {isVolatileAsset
                                        ? `Amounts adjusted for ${(
                                            haircut * 100
                                          ).toFixed(
                                            0
                                          )}% risk haircut on ${formatAssetType(
                                            selectedAsset?.type
                                          )} assets`
                                        : "Click a ratio to automatically calculate collateral amount based on your loan amount"}
                                    </p>
                                  </>
                                );
                              })()}
                          </div>
                        )}
                      </div>

                      {/* Bottom spacing */}
                      <div className="h-8"></div>
                    </motion.div>
                  )}

                  {/* Step 2: Terms & Duration */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Duration Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-muted rounded-lg">
                            <Timer className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              Loan Duration
                            </h3>
                            <p className="text-muted-foreground">
                              Set your preferred repayment timeline
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-4">
                            <Label
                              htmlFor="loanDurationDays"
                              className="text-base font-medium text-foreground"
                            >
                              Duration (Days)
                            </Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="loanDurationDays"
                                type="number"
                                placeholder="Enter duration in days"
                                className="pl-10 h-10 text-base font-medium border-2 focus:border-primary rounded-lg"
                                {...register("loanDurationDays", {
                                  valueAsNumber: true,
                                })}
                              />
                            </div>
                            {errors.loanDurationDays && (
                              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">
                                  {errors.loanDurationDays.message}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quick Selection Presets */}
                          <div className="space-y-4">
                            <Label className="text-base font-medium text-foreground">
                              Popular Terms
                            </Label>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                              {DURATION_PRESETS.map((preset) => (
                                <button
                                  key={preset.days}
                                  type="button"
                                  onClick={() =>
                                    setValue("loanDurationDays", preset.days)
                                  }
                                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                                    watchedValues.loanDurationDays ===
                                    preset.days
                                      ? "border-primary bg-primary/5 text-primary"
                                      : "border-border bg-card hover:border-primary/30"
                                  }`}
                                >
                                  <div className="text-center">
                                    <p className="font-semibold text-lg">
                                      {preset.label}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {preset.days} days
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Loan Summary */}
                          {watchedValues.loanDurationDays > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 bg-muted/50 rounded-lg border"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Calendar className="h-5 w-5 text-muted-foreground" />
                                  <span className="font-medium text-foreground">
                                    Loan Maturity Date
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-foreground">
                                    {new Date(
                                      Date.now() +
                                        watchedValues.loanDurationDays *
                                          24 *
                                          60 *
                                          60 *
                                          1000
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {watchedValues.loanDurationDays} days from
                                    now
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Lender Selection */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-muted rounded-lg">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              Lender Selection
                            </h3>
                            <p className="text-muted-foreground">
                              Select institutional lenders to view and bid on
                              your RFQ. Identities remain anonymous for privacy.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {loadingLenders ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                                <p className="text-muted-foreground">
                                  Loading available lenders...
                                </p>
                              </div>
                            </div>
                          ) : availableLenders.length === 0 ? (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>No lenders available</strong>
                                <br />
                                Please ensure institutional lenders are
                                registered in the system. Contact your
                                administrator for assistance.
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <>
                              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">
                                    {availableLenders.length} Institutional
                                    Lender
                                    {availableLenders.length !== 1
                                      ? "s"
                                      : ""}{" "}
                                    Available
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const allSelected = availableLenders.every(
                                      (lender) =>
                                        selectedLenders.includes(
                                          lender.damlParty
                                        )
                                    );
                                    if (allSelected) {
                                      setSelectedLenders([]);
                                      setValue("approvedLenders", []);
                                    } else {
                                      const allLenderIds = availableLenders.map(
                                        (l) => l.damlParty
                                      );
                                      setSelectedLenders(allLenderIds);
                                      setValue("approvedLenders", allLenderIds);
                                    }
                                  }}
                                >
                                  {availableLenders.every((lender) =>
                                    selectedLenders.includes(lender.damlParty)
                                  )
                                    ? "Deselect All"
                                    : "Select All"}
                                </Button>
                              </div>

                              {selectedLenders.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                >
                                  <Alert variant="rfq">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <AlertDescription>
                                      <p className="font-medium text-xs">
                                        {selectedLenders.length} Institution
                                        {selectedLenders.length !== 1
                                          ? "s"
                                          : ""}{" "}
                                        Selected
                                      </p>
                                    </AlertDescription>
                                  </Alert>
                                </motion.div>
                              )}

                              <div className="space-y-1 max-h-80 overflow-y-auto">
                                {availableLenders.map((lender, index) => {
                                  const isSelected = selectedLenders.includes(
                                    lender.damlParty
                                  );
                                  const truncatedParty =
                                    lender.damlParty.length > 24
                                      ? `${lender.damlParty.slice(
                                          0,
                                          34
                                        )}....${lender.damlParty.slice(-34)}`
                                      : lender.damlParty;

                                  return (
                                    <div
                                      key={lender.id}
                                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                        isSelected
                                          ? "bg-primary/10 border border-primary/30"
                                          : "hover:bg-muted/50"
                                      }`}
                                      onClick={() =>
                                        handleLenderToggle(lender.damlParty)
                                      }
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div
                                          className={`flex-shrink-0 rounded-full ${
                                            isSelected
                                              ? "ring-2 ring-primary/30"
                                              : ""
                                          }`}
                                        >
                                          {lender.image ? (
                                            <GlassAvatar
                                              seed={lender.image}
                                              size={32}
                                              className="rounded-full"
                                            />
                                          ) : (
                                            <GlassAvatar
                                              seed={
                                                lender.name || lender.damlParty
                                              }
                                              size={32}
                                              className="rounded-full"
                                            />
                                          )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="font-medium text-sm flex items-center gap-1">
                                            <span>
                                              {getLenderDisplayName(
                                                lender,
                                                index
                                              )}
                                            </span>
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <div className="cursor-help">
                                                    <VerifiedIcon className="h-4.5 w-4.5" />
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>Verified Institution</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          </div>
                                          <div className="space-y-1">
                                            <p
                                              className="text-xs text-muted-foreground font-mono truncate"
                                              title={lender.damlParty}
                                            >
                                              {truncatedParty}
                                            </p>
                                            {lender.lenderProfile && (
                                              <div className="flex items-center gap-2 text-xs">
                                                <Badge
                                                  variant="outline"
                                                  className="text-xs px-1 py-0"
                                                >
                                                  {
                                                    lender.lenderProfile
                                                      .categoryTier
                                                  }
                                                </Badge>
                                                <Badge
                                                  variant="secondary"
                                                  className="text-xs px-1 py-0"
                                                >
                                                  {
                                                    lender.lenderProfile
                                                      .ratingTier
                                                  }
                                                </Badge>
                                                <span className="text-muted-foreground">
                                                  {
                                                    lender.lenderProfile
                                                      .capacityTier
                                                  }{" "}
                                                  •{" "}
                                                  {
                                                    lender.lenderProfile
                                                      .geographicScope
                                                  }
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex-shrink-0">
                                        {isSelected ? (
                                          <CheckCircle2 className="h-4 w-4 text-primary" />
                                        ) : (
                                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}

                          {errors.approvedLenders && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.approvedLenders.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Summary */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              Review & Submit
                            </h3>
                            <p className="text-muted-foreground">
                              Please review your RFQ details before final
                              submission
                            </p>
                          </div>
                        </div>

                        {/* Submission Notice */}
                        <Alert variant="info">
                          <Eye className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Privacy Notice:</strong> Your RFQ will be
                            confidentially shared with selected lenders only.
                            They can submit competitive bids which you can
                            review and accept. All lender identities remain
                            anonymous throughout the process.
                          </AlertDescription>
                        </Alert>

                        {/* Validation Summary */}
                        {(() => {
                          const selectedAsset = SUPPORTED_ASSETS.find(
                            (asset) =>
                              asset.value === watchedValues.collateralAsset
                          );
                          const haircut = getAssetHaircut(selectedAsset?.type);
                          const faceValueRatio =
                            watchedValues.collateralAmount /
                            watchedValues.loanAmount;
                          const effectiveRatio = faceValueRatio * (1 - haircut);
                          const isValid = effectiveRatio >= 1.2;

                          return (
                            <Alert
                              variant={isValid ? "success" : "destructive"}
                            >
                              {isValid ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                              <AlertDescription>
                                <div className="space-y-2">
                                  <p className="font-medium">
                                    {isValid
                                      ? "Validation Passed"
                                      : "Validation Required"}
                                  </p>
                                  <div className="text-sm space-y-1">
                                    <p>
                                      • Face Value Ratio:{" "}
                                      {faceValueRatio.toFixed(2)}x
                                    </p>
                                    <p>
                                      • Risk Haircut:{" "}
                                      {(haircut * 100).toFixed(0)}% (
                                      {formatAssetType(selectedAsset?.type)}{" "}
                                      asset)
                                    </p>
                                    <p>
                                      • Effective Ratio:{" "}
                                      {effectiveRatio.toFixed(2)}x (minimum:
                                      1.20x)
                                    </p>
                                    {!isValid && (
                                      <p className="font-medium text-destructive">
                                        Need $
                                        {getMinimumCollateralAmount().toLocaleString()}{" "}
                                        minimum collateral
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </AlertDescription>
                            </Alert>
                          );
                        })()}

                        <div className="space-y-8">
                          {/* RFQ Summary */}
                          <div className="bg-muted/30 rounded-xl p-6 border">
                            <h4 className="text-lg font-semibold text-foreground mb-6">
                              RFQ Summary
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Left Column */}
                              <div className="space-y-6">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Loan className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Loan Request
                                    </span>
                                  </div>
                                  <p className="text-3xl font-bold text-foreground">
                                    ${" "}
                                    {watchedValues.loanAmount?.toLocaleString()}
                                  </p>
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Duration
                                    </span>
                                  </div>
                                  <p className="text-xl font-semibold text-foreground">
                                    {watchedValues.loanDurationDays} days
                                  </p>
                                </div>
                              </div>

                              {/* Right Column */}
                              <div className="space-y-6">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Collateral className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Collateral
                                    </span>
                                  </div>
                                  <p className="text-2xl font-bold text-foreground">
                                    ${" "}
                                    {watchedValues.collateralAmount?.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {watchedValues.collateralAsset} •{" "}
                                    {collateralRatio}x face value ratio
                                    {(() => {
                                      const selectedAsset =
                                        SUPPORTED_ASSETS.find(
                                          (asset) =>
                                            asset.value ===
                                            watchedValues.collateralAsset
                                        );
                                      if (selectedAsset) {
                                        const haircut = getAssetHaircut(
                                          selectedAsset.type
                                        );
                                        const effectiveRatio =
                                          parseFloat(collateralRatio) *
                                          (1 - haircut);
                                        return ` • ${effectiveRatio.toFixed(
                                          2
                                        )}x effective`;
                                      }
                                      return "";
                                    })()}
                                  </p>
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Expiry Date
                                    </span>
                                  </div>
                                  <p className="text-xl font-semibold text-foreground">
                                    {new Date(
                                      Date.now() +
                                        (watchedValues.loanDurationDays || 0) *
                                          24 *
                                          60 *
                                          60 *
                                          1000
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-border/50 my-6"></div>

                            {/* Selected Lenders */}
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Selected Institutions (
                                  {selectedLenders.length})
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {selectedLenders.map((lenderId, index) => {
                                  const lender = availableLenders.find(
                                    (l) => l.damlParty === lenderId
                                  );
                                  const lenderIndex =
                                    availableLenders.findIndex(
                                      (l) => l.damlParty === lenderId
                                    );
                                  return (
                                    <Badge
                                      key={lenderId}
                                      variant="secondary"
                                      className="bg-primary/10 text-primary border-primary/20 font-medium"
                                    >
                                      {lender
                                        ? getLenderDisplayName(
                                            lender,
                                            lenderIndex
                                          )
                                        : `AEGIS-INST-${String(
                                            index + 1
                                          ).padStart(3, "0")}`}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom spacing */}
                        <div className="h-8"></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </motion.div>
      </WideModalContent>
    </WideModal>
  );
}
