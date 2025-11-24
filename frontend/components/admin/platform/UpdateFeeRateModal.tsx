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
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { AlertCircle, X, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { aegisApi } from "@/lib/api";
import { Settings } from "@/components/icons/Settings";

interface UpdateFeeRateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: any;
  onSuccess: () => void;
}

export function UpdateFeeRateModal({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: UpdateFeeRateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await aegisApi.updateFeeRate(platform.contractId, {
        newFeeRate: formData.get("newFeeRate") as string,
        updateReason: formData.get("updateReason") as string,
      });

      if (result.error) throw new Error(result.error);

      toast.success("Fee rate updated successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to update fee rate";
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

  // Convert decimal to percentage for display (e.g., 0.005 -> 0.5)
  const currentFeeRatePercent = platform.platformFeeRate
    ? (parseFloat(platform.platformFeeRate) * 100).toFixed(2)
    : "0.00";

  return (
    <WideModal open={open} onOpenChange={handleClose}>
      <WideModalContent className="overflow-hidden" showCloseButton={false}>
        <WideModalTitle className="sr-only">
          Update Platform Fee Rate
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
                  <Settings size={40} className="text-primary" />
                </div>
                <div className="mb-3">
                  <h1 className="text-xl font-bold text-foreground mb-2">
                    Update Fee Rate
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Adjust the platform fee rate for future transactions
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
                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    <p className="font-medium text-sm mb-1">Fee Rate Update</p>
                    <p className="text-xs">
                      This will update the platform fee rate for all future
                      transactions. Existing loans will not be affected.
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg border">
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Current Fee Rate
                    </Label>
                    <span className="text-3xl font-bold text-foreground">
                      {currentFeeRatePercent}%
                    </span>
                  </div>
                </div>
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
                  {/* Constraints moved to top */}
                  <div className="p-3 bg-muted/50 rounded text-xs text-muted-foreground border">
                    <p className="font-medium mb-1">Constraints:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Fee rate must be between 0% and 10%</li>
                      <li>Changes apply to future transactions only</li>
                      <li>Requires compliance approval</li>
                    </ul>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Fee Rate Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Settings className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">
                        Fee Configuration
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentFeeRate">Current Fee Rate</Label>
                        <Input
                          id="currentFeeRate"
                          value={`${currentFeeRatePercent}%`}
                          disabled
                          className="bg-muted font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newFeeRate">
                          New Fee Rate (%)
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                          id="newFeeRate"
                          name="newFeeRate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          placeholder="e.g., 0.75"
                          required
                          disabled={loading}
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter a value between 0% and 10%
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="updateReason">
                          Update Reason
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                          id="updateReason"
                          name="updateReason"
                          placeholder="e.g., Market adjustment"
                          required
                          disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Provide a reason for this fee rate change
                        </p>
                      </div>
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
                        Updating...
                      </>
                    ) : (
                      "Update Fee Rate"
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
