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
import { AlertCircle, X, Loader2, Coins } from "lucide-react";
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

interface MintToTreasuryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: any;
  onSuccess: () => void;
}

export function MintToTreasuryModal({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: MintToTreasuryModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const assetTag = formData.get("assetType") as string;
    const assetValue = formData.get("assetValue") as string;
    const mintAmount = formData.get("mintAmount") as string;
    const mintReason = formData.get("mintReason") as string;

    try {
      const result = await aegisApi.mintToTreasury(platform.contractId, {
        assetType: { tag: assetTag, value: assetValue } as AssetType,
        mintAmount,
        mintReason,
      });

      if (result.error) throw new Error(result.error);

      toast.success("Assets minted to treasury successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to mint assets";
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
        <WideModalTitle className="sr-only">
          Mint Assets to Treasury
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
            className="absolute top-3 right-3 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/80 backdrop-blur-sm border cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Sidebar - Header & Info */}
          <div className="w-80 bg-gradient-to-t from-primary/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col min-h-0">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-2 ring-primary/20">
                  <Coins size={40} className="text-primary" />
                </div>
                <div className="mb-3">
                  <h1 className="text-xl font-bold text-foreground mb-2">
                    Mint to Treasury
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Add new assets to the platform treasury
                  </p>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                <Alert
                  variant="default"
                  className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                >
                  <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    <p className="font-medium text-sm mb-1">Treasury Minting</p>
                    <p className="text-xs">
                      Mint new assets to the treasury for platform operations
                      and liquidity management.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>

          {/* Main Content - Form */}
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0 flex flex-col">
            <div className="flex-1 p-8 pt-16 max-w-2xl">
              <form
                onSubmit={handleSubmit}
                className="space-y-6 h-full flex flex-col"
              >
                <div className="flex-1 space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Coins className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Asset Details</h3>
                    </div>

                    {platform.authorizedAssets &&
                    platform.authorizedAssets.length > 0 ? (
                      <div className="space-y-2">
                        <Label htmlFor="authorizedAsset">
                          Select Authorized Asset
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Select
                          name="authorizedAsset"
                          required
                          disabled={loading}
                          onValueChange={(value) => {
                            const [tag, assetValue] = value.split(":");
                            const form = document.querySelector(
                              "form"
                            ) as HTMLFormElement;
                            if (form) {
                              (
                                form.elements.namedItem(
                                  "assetType"
                                ) as HTMLInputElement
                              ).value = tag;
                              (
                                form.elements.namedItem(
                                  "assetValue"
                                ) as HTMLInputElement
                              ).value = assetValue;
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select authorized asset" />
                          </SelectTrigger>
                          <SelectContent>
                            {platform.authorizedAssets.map(
                              (asset: AssetType, index: number) => (
                                <SelectItem
                                  key={index}
                                  value={`${asset.tag}:${asset.value}`}
                                >
                                  {asset.tag} - {asset.value}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <input type="hidden" name="assetType" id="assetType" />
                        <input
                          type="hidden"
                          name="assetValue"
                          id="assetValue"
                        />
                      </div>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No authorized assets found. Please authorize assets
                          first in Platform Management.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="mintAmount">
                        Amount
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="mintAmount"
                        name="mintAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 1000.00"
                        required
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Amount of assets to mint to the treasury
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mintReason">
                        Reason
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="mintReason"
                        name="mintReason"
                        placeholder="e.g., Initial treasury funding"
                        required
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Reason for minting these assets
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
                        Minting...
                      </>
                    ) : (
                      "Mint to Treasury"
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
