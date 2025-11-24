"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
import { Lock, Info, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { aegisApi } from "@/lib/api";
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

interface LockFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: any;
  onSuccess: () => void;
}

export function LockFundsModal({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: LockFundsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const assetTag = formData.get("assetType") as string;
    const assetValue = formData.get("assetValue") as string;
    const owner = formData.get("owner") as string;
    const amount = formData.get("amount") as string;
    const lockReason = formData.get("lockReason") as string;

    try {
      const result = await aegisApi.lockFunds(platform.contractId, {
        owner,
        assetType: { tag: assetTag, value: assetValue } as AssetType,
        amount,
        lockReason,
      });

      if (result.error) throw new Error(result.error);

      toast.success("Funds locked successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to lock funds";
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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleClose();
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
    <WideModal open={open} onOpenChange={handleOpenChange}>
      <WideModalContent className="overflow-hidden" showCloseButton={false}>
        <WideModalTitle className="sr-only">Lock Funds</WideModalTitle>

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
            className="absolute top-3 right-3 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/80 backdrop-blur-sm border cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Sidebar */}
          <div className="w-80 bg-gradient-to-t from-orange-500/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col min-h-0">
            <div className="p-6 border-b border-border">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 ring-2 ring-orange-500/20">
                  <Lock size={40} className="text-orange-500" />
                </div>
                <div className="mb-3">
                  <h1 className="text-xl font-bold text-foreground mb-2">
                    Lock Funds
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Temporarily lock funds for compliance or security
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                <Alert
                  variant="default"
                  className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                >
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    <p className="font-medium text-sm mb-1">Fund Locking</p>
                    <p className="text-xs">
                      Locked funds cannot be used in transactions until unlocked
                      by an authorized operator.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0 flex flex-col">
            <div className="flex-1 p-8 pt-16 max-w-2xl">
              <form
                onSubmit={handleSubmit}
                className="space-y-6 h-full flex flex-col"
              >
                <div className="flex-1 space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <X className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Lock className="h-4 w-4 text-orange-500" />
                      <h3 className="font-semibold text-sm">Lock Details</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="owner">
                        Owner Party ID
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="owner"
                        name="owner"
                        placeholder="Enter party ID"
                        required
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        The party whose funds will be locked
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assetType">
                          Asset Type
                          <span className="text-destructive ml-1">*</span>
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
                          Asset Identifier
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                          id="assetValue"
                          name="assetValue"
                          placeholder="e.g., BTC, USD"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        Amount to Lock
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Amount of assets to lock
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lockReason">
                        Lock Reason
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="lockReason"
                        name="lockReason"
                        placeholder="e.g., Compliance review, Security hold"
                        required
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Reason for locking these funds
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 pb-6 border-t mt-auto">
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
                        Locking...
                      </>
                    ) : (
                      "Lock Funds"
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
