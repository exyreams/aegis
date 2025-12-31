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
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";
import {
  ArrowRight,
  ArrowLeft,
  X,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  Leaf,
  CheckCircle2,
  Info,
} from "lucide-react";
import { toast } from "sonner";

const createLoanSchema = z.object({
  // Basic Information
  borrowerName: z.string().min(1, "Borrower name is required"),
  lenderName: z.string().optional(),
  facilityType: z.string().min(1, "Facility type is required"),
  purpose: z.string().min(1, "Loan purpose is required"),

  // Financial Terms
  amount: z.number().min(1, "Loan amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  interestRate: z.number().min(0, "Interest rate must be non-negative"),
  term: z.number().min(1, "Term must be at least 1 month"),
  maturityDate: z.string().min(1, "Maturity date is required"),

  // Risk and Compliance
  riskRating: z.string().optional(),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),

  // ESG
  sustainabilityLinked: z.boolean(),
  esgTargets: z.string().optional(),

  // Additional Information
  description: z.string().optional(),
  specialConditions: z.string().optional(),
});

type CreateLoanFormData = z.infer<typeof createLoanSchema>;

interface CreateLoanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (loanData: CreateLoanFormData) => void;
}

const FACILITY_TYPES = [
  {
    value: "term_loan",
    label: "Term Loan",
    description: "Fixed-term lending facility",
  },
  {
    value: "revolving_credit",
    label: "Revolving Credit Facility",
    description: "Flexible credit line",
  },
  {
    value: "syndicated_loan",
    label: "Syndicated Loan",
    description: "Multi-lender facility",
  },
  {
    value: "bilateral_loan",
    label: "Bilateral Loan",
    description: "Single lender-borrower facility",
  },
  {
    value: "project_finance",
    label: "Project Finance",
    description: "Infrastructure/project funding",
  },
  {
    value: "bridge_loan",
    label: "Bridge Loan",
    description: "Short-term financing",
  },
];

const CURRENCIES = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
];

const JURISDICTIONS = [
  { value: "us", label: "United States", flag: "🇺🇸" },
  { value: "uk", label: "United Kingdom", flag: "🇬🇧" },
  { value: "eu", label: "European Union", flag: "🇪🇺" },
  { value: "ca", label: "Canada", flag: "🇨🇦" },
  { value: "au", label: "Australia", flag: "🇦🇺" },
  { value: "sg", label: "Singapore", flag: "🇸🇬" },
];

const RISK_RATINGS = [
  { value: "AAA", label: "AAA", color: "text-green-700" },
  { value: "AA", label: "AA", color: "text-green-600" },
  { value: "A", label: "A", color: "text-green-500" },
  { value: "BBB", label: "BBB", color: "text-yellow-600" },
  { value: "BB", label: "BB", color: "text-orange-500" },
  { value: "B", label: "B", color: "text-orange-600" },
  { value: "CCC", label: "CCC", color: "text-red-500" },
];

export function CreateLoanModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateLoanModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateLoanFormData>({
    resolver: zodResolver(createLoanSchema),
    defaultValues: {
      borrowerName: "",
      lenderName: "",
      facilityType: "",
      purpose: "",
      amount: 0,
      currency: "USD",
      interestRate: 0,
      term: 0,
      maturityDate: "",
      riskRating: "",
      jurisdiction: "us",
      sustainabilityLinked: false,
      esgTargets: "",
      description: "",
      specialConditions: "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = form;

  const watchedValues = watch();

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CreateLoanFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Loan request created successfully!");
      onSuccess?.(data);
      handleClose();
    } catch {
      toast.error("Failed to create loan request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setCurrentStep(1);
      onOpenChange(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const stepTitles = [
    "Basic Information",
    "Financial Terms",
    "Risk & Compliance",
    "Review & Submit",
  ];

  const stepDescriptions = [
    "Enter borrower details and loan purpose",
    "Define loan amount, rate, and terms",
    "Set risk parameters and compliance requirements",
    "Review all details and submit loan request",
  ];

  const selectedFacilityType = FACILITY_TYPES.find(
    (type) => type.value === watchedValues.facilityType
  );

  const selectedCurrency = CURRENCIES.find(
    (currency) => currency.value === watchedValues.currency
  );

  return (
    <WideModal open={open} onOpenChange={handleClose}>
      <WideModalContent className="max-w-5xl" showCloseButton={false}>
        <WideModalTitle className="sr-only">
          Create Loan Request - Step {currentStep} of 4:{" "}
          {stepTitles[currentStep - 1]}
        </WideModalTitle>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex w-full h-full bg-background rounded-lg shadow-2xl border relative min-h-[700px]"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/90 backdrop-blur-sm border shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Sidebar */}
          <div className="w-80 bg-card rounded-xl border shadow-sm flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Building2 size={24} className="text-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    Create Loan Request
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Digital Loan Platform
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
                      className={`relative ${
                        isActive
                          ? "opacity-100"
                          : isCompleted
                          ? "opacity-90"
                          : "opacity-60"
                      }`}
                      animate={{
                        scale: isActive ? 1.02 : 1,
                      }}
                    >
                      {/* Connector Line */}
                      {index < stepTitles.length - 1 && (
                        <div className="absolute left-4 top-10 w-0.5 h-8 bg-border/30" />
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                            isCompleted
                              ? "bg-primary text-primary-foreground border-primary"
                              : isActive
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            stepNumber
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold text-sm ${
                              isActive
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {title}
                          </h3>
                          <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">
                            {stepDescriptions[index]}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress Indicator */}
              <div className="mt-8 p-4 bg-background rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">
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
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="p-6 border-t border-border/50">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1 || isSubmitting}
                  variant="ghost"
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    form="loan-form"
                    disabled={isSubmitting}
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    {isSubmitting ? "Creating..." : "Create Loan"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-background min-w-0">
            <div className="p-8 pt-16 h-full min-h-full">
              <form id="loan-form" onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-8"
                    >
                      <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-foreground mb-3">
                          Basic Information
                        </h2>
                        <p className="text-muted-foreground text-lg">
                          Enter the fundamental details of your loan request
                        </p>
                      </div>

                      <div className="max-w-2xl mx-auto space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Building2 className="h-5 w-5" />
                              Parties
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="borrowerName">
                                Borrower Name *
                              </Label>
                              <Input
                                id="borrowerName"
                                placeholder="e.g., Global Manufacturing Corp"
                                {...register("borrowerName")}
                                className="h-11"
                              />
                              {errors.borrowerName && (
                                <p className="text-sm text-destructive">
                                  {errors.borrowerName.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lenderName">
                                Preferred Lender (Optional)
                              </Label>
                              <Input
                                id="lenderName"
                                placeholder="e.g., JPMorgan Chase Bank"
                                {...register("lenderName")}
                                className="h-11"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Loan Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Facility Type *</Label>
                              <Select
                                value={watchedValues.facilityType}
                                onValueChange={(value) =>
                                  setValue("facilityType", value)
                                }
                              >
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select facility type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {FACILITY_TYPES.map((type) => (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value}
                                    >
                                      <div>
                                        <div className="font-medium">
                                          {type.label}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {type.description}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.facilityType && (
                                <p className="text-sm text-destructive">
                                  {errors.facilityType.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="purpose">Loan Purpose *</Label>
                              <Textarea
                                id="purpose"
                                placeholder="e.g., Working capital, equipment purchase, expansion..."
                                {...register("purpose")}
                                className="min-h-[80px]"
                              />
                              {errors.purpose && (
                                <p className="text-sm text-destructive">
                                  {errors.purpose.message}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Financial Terms */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-8"
                    >
                      <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-foreground mb-3">
                          Financial Terms
                        </h2>
                        <p className="text-muted-foreground text-lg">
                          Define the financial parameters of your loan
                        </p>
                      </div>

                      <div className="max-w-2xl mx-auto space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5" />
                              Loan Amount & Currency
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="amount">Loan Amount *</Label>
                                <Input
                                  id="amount"
                                  type="number"
                                  placeholder="1000000"
                                  {...register("amount", {
                                    valueAsNumber: true,
                                  })}
                                  className="h-11"
                                />
                                {errors.amount && (
                                  <p className="text-sm text-destructive">
                                    {errors.amount.message}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label>Currency *</Label>
                                <Select
                                  value={watchedValues.currency}
                                  onValueChange={(value) =>
                                    setValue("currency", value)
                                  }
                                >
                                  <SelectTrigger className="h-11">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CURRENCIES.map((currency) => (
                                      <SelectItem
                                        key={currency.value}
                                        value={currency.value}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono">
                                            {currency.symbol}
                                          </span>
                                          <span>{currency.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              Terms & Rates
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="interestRate">
                                  Interest Rate (%) *
                                </Label>
                                <Input
                                  id="interestRate"
                                  type="number"
                                  step="0.01"
                                  placeholder="4.75"
                                  {...register("interestRate", {
                                    valueAsNumber: true,
                                  })}
                                  className="h-11"
                                />
                                {errors.interestRate && (
                                  <p className="text-sm text-destructive">
                                    {errors.interestRate.message}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="term">Term (Months) *</Label>
                                <Input
                                  id="term"
                                  type="number"
                                  placeholder="60"
                                  {...register("term", { valueAsNumber: true })}
                                  className="h-11"
                                />
                                {errors.term && (
                                  <p className="text-sm text-destructive">
                                    {errors.term.message}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maturityDate">
                                Maturity Date *
                              </Label>
                              <Input
                                id="maturityDate"
                                type="date"
                                {...register("maturityDate")}
                                className="h-11"
                              />
                              {errors.maturityDate && (
                                <p className="text-sm text-destructive">
                                  {errors.maturityDate.message}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Risk & Compliance */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-8"
                    >
                      <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-foreground mb-3">
                          Risk & Compliance
                        </h2>
                        <p className="text-muted-foreground text-lg">
                          Set risk parameters and compliance requirements
                        </p>
                      </div>

                      <div className="max-w-2xl mx-auto space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Shield className="h-5 w-5" />
                              Risk Assessment
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Risk Rating (Optional)</Label>
                                <Select
                                  value={watchedValues.riskRating}
                                  onValueChange={(value) =>
                                    setValue("riskRating", value)
                                  }
                                >
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select risk rating" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {RISK_RATINGS.map((rating) => (
                                      <SelectItem
                                        key={rating.value}
                                        value={rating.value}
                                      >
                                        <span className={rating.color}>
                                          {rating.label}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Jurisdiction *</Label>
                                <Select
                                  value={watchedValues.jurisdiction}
                                  onValueChange={(value) =>
                                    setValue("jurisdiction", value)
                                  }
                                >
                                  <SelectTrigger className="h-11">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {JURISDICTIONS.map((jurisdiction) => (
                                      <SelectItem
                                        key={jurisdiction.value}
                                        value={jurisdiction.value}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span>{jurisdiction.flag}</span>
                                          <span>{jurisdiction.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Leaf className="h-5 w-5" />
                              ESG & Sustainability
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label>Sustainability-Linked Loan</Label>
                                <p className="text-sm text-muted-foreground">
                                  Link loan terms to ESG performance targets
                                </p>
                              </div>
                              <Switch
                                checked={watchedValues.sustainabilityLinked}
                                onCheckedChange={(checked) =>
                                  setValue("sustainabilityLinked", checked)
                                }
                              />
                            </div>
                            {watchedValues.sustainabilityLinked && (
                              <div className="space-y-2">
                                <Label htmlFor="esgTargets">ESG Targets</Label>
                                <Textarea
                                  id="esgTargets"
                                  placeholder="Describe your sustainability targets and KPIs..."
                                  {...register("esgTargets")}
                                  className="min-h-[80px]"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="description">
                                Description (Optional)
                              </Label>
                              <Textarea
                                id="description"
                                placeholder="Additional details about the loan request..."
                                {...register("description")}
                                className="min-h-[80px]"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="specialConditions">
                                Special Conditions (Optional)
                              </Label>
                              <Textarea
                                id="specialConditions"
                                placeholder="Any special terms or conditions..."
                                {...register("specialConditions")}
                                className="min-h-[80px]"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Review & Submit */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-8"
                    >
                      <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-foreground mb-3">
                          Review & Submit
                        </h2>
                        <p className="text-muted-foreground text-lg">
                          Review all details before submitting your loan request
                        </p>
                      </div>

                      <div className="max-w-3xl mx-auto space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Building2 className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">Borrower</span>
                              </div>
                              <p className="text-lg font-bold">
                                {watchedValues.borrowerName}
                              </p>
                              {selectedFacilityType && (
                                <p className="text-sm text-muted-foreground">
                                  {selectedFacilityType.label}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-medium">Loan Amount</span>
                              </div>
                              <p className="text-lg font-bold">
                                {selectedCurrency?.symbol}
                                {watchedValues.amount?.toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {watchedValues.interestRate}% •{" "}
                                {watchedValues.term} months
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Detailed Review */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Loan Request Summary</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Purpose
                                  </p>
                                  <p className="font-medium">
                                    {watchedValues.purpose}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Maturity Date
                                  </p>
                                  <p className="font-medium">
                                    {watchedValues.maturityDate}
                                  </p>
                                </div>
                                {watchedValues.riskRating && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Risk Rating
                                    </p>
                                    <Badge variant="outline">
                                      {watchedValues.riskRating}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Jurisdiction
                                  </p>
                                  <p className="font-medium">
                                    {
                                      JURISDICTIONS.find(
                                        (j) =>
                                          j.value === watchedValues.jurisdiction
                                      )?.label
                                    }
                                  </p>
                                </div>
                                {watchedValues.sustainabilityLinked && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      ESG Features
                                    </p>
                                    <Badge className="bg-green-500 text-white">
                                      <Leaf className="h-3 w-3 mr-1" />
                                      Sustainability-Linked
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>

                            {watchedValues.description && (
                              <>
                                <Separator />
                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Description
                                  </p>
                                  <p className="text-sm">
                                    {watchedValues.description}
                                  </p>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>

                        {/* Submission Notice */}
                        <Card className="border-blue-200 bg-blue-50/50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-blue-900 mb-1">
                                  Ready to Submit
                                </h4>
                                <p className="text-sm text-blue-700">
                                  Your loan request will be submitted to our
                                  digital lending platform. Lenders will be able
                                  to review and respond to your request.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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
