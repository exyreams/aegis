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
import { AlertCircle, X, Loader2, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { aegisApi } from "@/lib/api";
import type { AssetType } from "@/lib/api/aegis";

interface InjectFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: any;
  onSuccess: () => void;
}

export function InjectFundsModal({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: InjectFundsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const [assetTag, assetValue] = (
      formData.get("authorizedAsset") as string
    ).split(":");
    const injectionAmount = formData.get("injectionAmount") as string;
    const injectionReason = formData.get("injectionReason") as string;

    try {
      const result = await aegisApi.injectFunds(platform.contractId, {
        assetType: { tag: assetTag, value: assetValue } as AssetType,
        injectionAmount,
        injectionReason,
      });

      if (result.error) throw new Error(result.error);

      toast.success("Funds injected successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to inject funds";
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
        <WideModalTitle className="sr-only">Inject Funds</WideModalTitle>

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

          <div className="w-80 bg-gradient-to-t from-primary/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col min-h-0">
            <div className="p-6 border-b border-border">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-2 ring-primary/20">
                  <ArrowUpCircle size={40} className="text-primary" />
                </div>
                <div className="mb-3">
                  <h1 className="text-xl font-bold text-foreground mb-2">
                    Inject Funds
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Add external funds to the treasury
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <Alert
                variant="default"
                className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
              >
                <ArrowUpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-300">
                  <p className="font-medium text-sm mb-1">Fund Injection</p>
                  <p className="text-xs">
                    Inject external funds into the treasury for liquidity
                    management.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          </div>

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
                      <ArrowUpCircle className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Fund Details</h3>
                    </div>

                    {platform.authorizedAssets &&
                    platform.authorizedAssets.length > 0 ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="authorizedAsset">
                            Select Asset
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <Select
                            name="authorizedAsset"
                            required
                            disabled={loading}
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
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="injectionAmount">
                            Amount
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <Input
                            id="injectionAmount"
                            name="injectionAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g., 1000.00"
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="injectionReason">
                            Injection Reason
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <Input
                            id="injectionReason"
                            name="injectionReason"
                            placeholder="e.g., External capital injection"
                            required
                            disabled={loading}
                          />
                          <p className="text-xs text-muted-foreground">
                            Reason for injecting these funds
                          </p>
                        </div>
                      </>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No authorized assets found.
                        </AlertDescription>
                      </Alert>
                    )}
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
                        Injecting...
                      </>
                    ) : (
                      "Inject Funds"
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
