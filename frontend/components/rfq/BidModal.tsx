"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  WideModal,
  WideModalContent,
  WideModalTitle,
} from "@/components/ui/WideModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { useSubmitBid } from "@/hooks/useRFQ";
import {
  Loader2,
  MessageSquare,
  Percent,
  FileText,
  X,
  Shield,
  TrendingUp,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { FileDescription } from "@/components/icons";

const bidSchema = z.object({
  interestRate: z
    .number()
    .min(0.1, "Interest rate must be at least 0.1%")
    .max(50, "Interest rate cannot exceed 50%"),
  paymentFrequency: z.enum(
    ["Monthly", "Quarterly", "SemiAnnual", "Annual", "Bullet"],
    {
      message: "Payment frequency is required",
    }
  ),
  additionalTerms: z.string().optional(),
});

type BidFormData = z.infer<typeof bidSchema>;
type PaymentFrequency =
  | "Monthly"
  | "Quarterly"
  | "SemiAnnual"
  | "Annual"
  | "Bullet";

import type { RFQData } from "@/types/api";

interface BidModalProps {
  rfq: RFQData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BidModal({ rfq, open, onOpenChange }: BidModalProps) {
  const { mutate: submitBid, isPending: loading } = useSubmitBid();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      interestRate: 5.0,
      paymentFrequency: "Monthly" as const,
      additionalTerms: "",
    },
  });

  const interestRate = watch("interestRate");
  const paymentFrequency = watch("paymentFrequency");

  const formatDuration = (microseconds: string): string => {
    const ms = parseInt(microseconds) / 1000;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? "s" : ""}`;
  };

  const calculateInterestAmount = (principal: number, rate: number): number => {
    return (principal * rate) / 100;
  };

  const onSubmit = async (data: BidFormData) => {
    submitBid(
      {
        rfqContractId: rfq.contractId,
        bidData: {
          interestRate: data.interestRate,
          paymentFrequency: data.paymentFrequency,
          additionalTerms: data.additionalTerms || "",
        },
      },
      {
        onSuccess: () => {
          toast.success("Bid submitted successfully!");
          onOpenChange(false);
          reset();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to submit bid");
        },
      }
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const interestAmount = interestRate
    ? calculateInterestAmount(rfq.loanAmount, interestRate)
    : 0;
  const totalRepayment = rfq.loanAmount + interestAmount;

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

  return (
    <WideModal open={open} onOpenChange={handleClose}>
      <WideModalContent className="overflow-hidden" showCloseButton={false}>
        <WideModalTitle className="sr-only">
          Submit Bid - {rfq.title || `${rfq.collateralAsset} Loan`}
        </WideModalTitle>

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
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

          {/* Left Sidebar - RFQ Summary */}
          <div className="w-80 bg-gradient-to-t from-primary/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center ring-2 ring-primary/20">
                    <FileDescription size={32} className="text-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h1 className="text-xl font-bold text-foreground">
                    {rfq.title || `${rfq.collateralAsset} Loan`}
                  </h1>
                </div>
                <div className="text-sm text-muted-foreground">
                  Submit your competitive bid
                </div>
              </div>
            </div>

            {/* RFQ Details */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Loan Amount
                  </Label>
                  <p className="text-lg font-bold">
                    ${rfq.loanAmount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Collateral
                  </Label>
                  <p className="text-sm font-medium">
                    ${rfq.collateralAmount.toLocaleString()}{" "}
                    {rfq.collateralAsset}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Duration
                  </Label>
                  <p className="text-sm font-medium">
                    {formatDuration(rfq.loanDuration.microseconds)}
                  </p>
                </div>

                <div className="mb-4">
                  <Label className="text-xs text-muted-foreground">
                    Borrower
                  </Label>
                  <div className="relative group mt-1">
                    <div className="bg-muted/50 rounded-md p-2 border">
                      <p className="text-xs font-mono text-muted-foreground break-all pr-8">
                        {rfq.borrower}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(rfq.borrower);
                          toast.success("Borrower ID copied to clipboard");
                        }}
                        className="absolute top-2 right-2 p-1 hover:bg-muted rounded transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions in Left Section */}
              <div className="border-t border-border pt-4 mt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  form="bid-form"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Bid...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Submit Bid
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content - Bid Form */}
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0">
            <div className="p-8 pt-16 h-full min-h-full">
              <form
                id="bid-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Form Header */}
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Submit Your Bid
                  </h2>
                  <p className="text-muted-foreground">
                    Enter your lending terms for this RFQ. Your bid will be
                    private and confidential.
                  </p>
                </div>

                {/* Interest Rate Section */}
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="interestRate"
                      className="text-base font-medium text-foreground mb-3 block"
                    >
                      Interest Rate
                    </Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="50"
                        {...register("interestRate", { valueAsNumber: true })}
                        placeholder="5.0"
                        className="pl-10 h-12 text-base font-medium border-2 focus:border-primary rounded-lg"
                      />
                    </div>
                    {errors.interestRate && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>
                          {errors.interestRate.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Interest Rate Presets */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Quick Select
                    </Label>
                    <div className="grid grid-cols-5 gap-2">
                      {[3.5, 4.0, 5.0, 6.5, 8.0].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setValue("interestRate", rate)}
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            interestRate === rate
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Frequency Section */}
                <div className="space-y-4">
                  <Label className="text-base font-medium text-foreground mb-3 block">
                    Payment Frequency
                  </Label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          value: "Monthly" as PaymentFrequency,
                          label: "Monthly",
                          desc: "12 payments/year",
                        },
                        {
                          value: "Quarterly" as PaymentFrequency,
                          label: "Quarterly",
                          desc: "4 payments/year",
                        },
                        {
                          value: "SemiAnnual" as PaymentFrequency,
                          label: "Semi-Annual",
                          desc: "2 payments/year",
                        },
                      ].map((freq) => (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() =>
                            setValue("paymentFrequency", freq.value)
                          }
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            paymentFrequency === freq.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                          }`}
                        >
                          <div className="font-medium text-sm">
                            {freq.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {freq.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          value: "Annual" as PaymentFrequency,
                          label: "Annual",
                          desc: "1 payment/year",
                        },
                        {
                          value: "Bullet" as PaymentFrequency,
                          label: "Bullet",
                          desc: "Single payment at maturity",
                        },
                      ].map((freq) => (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() =>
                            setValue("paymentFrequency", freq.value)
                          }
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            paymentFrequency === freq.value
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                          }`}
                        >
                          <div className="font-medium text-sm">
                            {freq.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {freq.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {errors.paymentFrequency && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>
                        {errors.paymentFrequency.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Additional Terms Section */}
                <div className="space-y-4">
                  <Label
                    htmlFor="additionalTerms"
                    className="text-base font-medium text-foreground"
                  >
                    Additional Terms (Optional)
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="additionalTerms"
                      {...register("additionalTerms")}
                      placeholder="Any additional terms, conditions, or requirements..."
                      rows={6}
                      className="pl-10 border-2 focus:border-primary rounded-lg resize-none"
                    />
                  </div>
                  {errors.additionalTerms && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {errors.additionalTerms.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Bid Summary */}
                {interestRate && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-6 bg-card"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Bid Summary</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">
                          Principal
                        </div>
                        <div className="text-xl font-bold">
                          ${rfq.loanAmount.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">
                          Interest ({interestRate}%)
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          ${interestAmount.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="text-sm text-muted-foreground mb-1">
                          Total Repayment
                        </div>
                        <div className="text-xl font-bold text-primary">
                          ${totalRepayment.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Privacy Notice */}
                <div className="pb-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Confidential Bidding:</strong> Your bid will be
                      private and only visible to the borrower. Other lenders
                      cannot see your terms or interest rates.
                    </AlertDescription>
                  </Alert>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </WideModalContent>
    </WideModal>
  );
}
