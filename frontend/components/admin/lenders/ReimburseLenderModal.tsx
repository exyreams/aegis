"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
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
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  AlertCircle,
  X,
  CheckCircle,
  Loader2,
  ArrowDownCircle,
} from "lucide-react";
import { toast } from "sonner";
import { aegisApi, authApi } from "@/lib/api";
import type { AssetType } from "@/lib/api/aegis";

const ASSET_TYPES = [
  { tag: "Cryptocurrency", label: "Cryptocurrency" },
  { tag: "Stablecoin", label: "Stablecoin" },
  { tag: "FiatCurrency", label: "Fiat Currency" },
  { tag: "GovernmentBond", label: "Government Bond" },
  { tag: "CorporateBond", label: "Corporate Bond" },
  { tag: "Equity", label: "Equity" },
  { tag: "RealEstateToken", label: "Real Estate Token" },
  { tag: "Commodity", label: "Commodity" },
] as const;

interface ReimburseLenderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: any;
  onSuccess: () => void;
}

export function ReimburseLenderModal({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: ReimburseLenderModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: lenders = [] } = useQuery({
    queryKey: ["lenders"],
    queryFn: async () => {
      const result = await authApi.listLenders();
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    enabled: open,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const lenderParty = formData.get("lenderParty") as string;
    const assetTag = formData.get("assetType") as string;
    const assetValue = formData.get("assetValue") as string;
    const amount = formData.get("amount") as string;
    const reason = formData.get("reason") as string;

    try {
      const result = await aegisApi.reimburseLender(platform.contractId, {
        lender: lenderParty,
        assetType: { tag: assetTag, value: assetValue } as AssetType,
        amount: amount,
        reimbursementReason: reason,
      });

      if (result.error) throw new Error(result.error);

      toast.success("Lender reimbursed successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to reimburse lender";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError("");
      onOpenChange(false);
    }
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

  return (
    <WideModal open={open} onOpenChange={handleClose}>
      <WideModalContent className="overflow-hidden" showCloseButton={false}>
        <WideModalTitle className="sr-only">Reimburse Lender</WideModalTitle>

        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex w-full h-full bg-background rounded-lg shadow-2xl border relative"
        >
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-3 right-3 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/80 backdrop-blur-sm border cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Sidebar */}
          <div className="w-80 bg-gradient-to-t from-primary/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col min-h-0">
            <div className="p-6 border-b border-border">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-2 ring-primary/20">
                  <ArrowDownCircle size={40} className="text-primary" />
                </div>
                <div className="mb-3">
                  <h1 className="text-xl font-bold text-foreground mb-2">
                    Reimburse Lender
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Compensate lender for losses or expenses
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <Alert
                variant="default"
                className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              >
                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  <p className="font-medium text-sm mb-1">
                    Lender Reimbursement
                  </p>
                  <p className="text-xs">
                    Reimburse a lender for losses, defaults, or operational
                    expenses. Funds are transferred from the platform treasury.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0">
            <div className="p-8 pt-16 h-full">
              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lenderParty">
                      Lender Party <span className="text-destructive">*</span>
                    </Label>
                    <Select name="lenderParty" required disabled={loading}>
                      <SelectTrigger className="h-auto min-h-[50px]">
                        <SelectValue placeholder="Select lender" />
                      </SelectTrigger>
                      <SelectContent>
                        {lenders.map((lender) => (
                          <SelectItem
                            key={lender.id}
                            value={lender.damlParty}
                            className="py-2"
                          >
                            <div className="flex flex-col items-start gap-1">
                              <span className="font-medium">{lender.name}</span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {lender.damlParty}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assetType">
                        Asset Type <span className="text-destructive">*</span>
                      </Label>
                      <Select name="assetType" required disabled={loading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSET_TYPES.map((type) => (
                            <SelectItem key={type.tag} value={type.tag}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assetValue">
                        Asset Symbol <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="assetValue"
                        name="assetValue"
                        placeholder="e.g., USD, BTC"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Reimbursement Amount{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      required
                      disabled={loading}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Amount to reimburse from treasury
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">
                      Reimbursement Reason{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="reason"
                      name="reason"
                      placeholder="e.g., Default loss compensation"
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide a reason for this reimbursement
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 pb-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Reimburse Lender"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </WideModalContent>
    </WideModal>
  );
}
