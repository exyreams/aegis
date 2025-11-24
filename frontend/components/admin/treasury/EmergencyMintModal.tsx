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
import { AlertCircle, X, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { aegisApi } from "@/lib/api";
import type { AssetType } from "@/lib/api/aegis";

interface EmergencyMintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: any;
  onSuccess: () => void;
}

export function EmergencyMintModal({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: EmergencyMintModalProps) {
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
    const emergencyAmount = formData.get("emergencyAmount") as string;
    const emergencyReason = formData.get("emergencyReason") as string;

    try {
      const result = await aegisApi.emergencyMint(platform.contractId, {
        assetType: { tag: assetTag, value: assetValue } as AssetType,
        emergencyAmount,
        emergencyReason,
      });

      if (result.error) throw new Error(result.error);

      toast.success("Emergency mint executed successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to execute emergency mint";
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
        <WideModalTitle className="sr-only">Emergency Mint</WideModalTitle>

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

          <div className="w-80 bg-gradient-to-t from-destructive/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col min-h-0">
            <div className="p-6 border-b border-border">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4 ring-2 ring-destructive/20">
                  <AlertTriangle size={40} className="text-destructive" />
                </div>
                <div className="mb-3">
                  <h1 className="text-xl font-bold text-foreground mb-2">
                    Emergency Mint
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Emergency asset minting for critical situations
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <Alert
                variant="destructive"
                className="bg-destructive/10 border-destructive/30"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium text-sm mb-1">
                    ⚠️ Emergency Action
                  </p>
                  <p className="text-xs">
                    This action should only be used in critical situations.
                    Requires emergency operator authorization.
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
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <h3 className="font-semibold text-sm">
                        Emergency Details
                      </h3>
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
                          <Label htmlFor="emergencyAmount">
                            Amount
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <Input
                            id="emergencyAmount"
                            name="emergencyAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g., 1000.00"
                            required
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emergencyReason">
                            Emergency Reason
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <Input
                            id="emergencyReason"
                            name="emergencyReason"
                            placeholder="e.g., Critical liquidity shortage"
                            required
                            disabled={loading}
                          />
                          <p className="text-xs text-muted-foreground">
                            Provide a detailed reason for this emergency action
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
                  <Button
                    type="submit"
                    variant="destructive"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      "Execute Emergency Mint"
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
