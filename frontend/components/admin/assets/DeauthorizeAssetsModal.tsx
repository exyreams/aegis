"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  WideModal,
  WideModalContent,
  WideModalTitle,
} from "@/components/ui/WideModal";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { XCircle, AlertTriangle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { aegisApi } from "@/lib/api";
import type { AssetType } from "@/lib/api/aegis";

interface DeauthorizeAssetsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: any;
  onSuccess: () => void;
}

export function DeauthorizeAssetsModal({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: DeauthorizeAssetsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);

  const toggleAsset = (index: number) => {
    setSelectedAssets((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (selectedAssets.length === 0) {
        throw new Error("Please select at least one asset");
      }

      // Convert selected indices to actual AssetType objects
      const assetsToRemove = selectedAssets.map(
        (index) => platform.authorizedAssets[index]
      );

      const result = await aegisApi.deauthorizeAssets(platform.contractId, {
        assetsToRemove,
        deauthorizationReason: "Asset deauthorization requested by admin",
      });

      if (result.error) throw new Error(result.error);

      toast.success("Assets deauthorized successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to deauthorize assets";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedAssets([]);
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
        <WideModalTitle className="sr-only">Deauthorize Assets</WideModalTitle>

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
          <div className="w-80 bg-gradient-to-t from-destructive/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col min-h-0">
            <div className="p-6 border-b border-border">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4 ring-2 ring-destructive/20">
                  <XCircle size={40} className="text-destructive" />
                </div>
                <div className="mb-3">
                  <h1 className="text-xl font-bold text-foreground mb-2">
                    Deauthorize Assets
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Remove asset types from the platform
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                <Alert
                  variant="destructive"
                  className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                >
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-300">
                    <p className="font-medium text-sm mb-1">Warning</p>
                    <p className="text-xs">
                      Deauthorizing assets may affect existing operations.
                      Ensure no active contracts use these assets.
                    </p>
                  </AlertDescription>
                </Alert>

                {selectedAssets.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Selected for Removal ({selectedAssets.length})
                    </Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">
                        {selectedAssets.length} asset(s) will be deauthorized
                      </p>
                    </div>
                  </div>
                )}
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
                      <XCircle className="h-4 w-4 text-destructive" />
                      <h3 className="font-semibold text-sm">
                        Select Assets to Deauthorize
                      </h3>
                    </div>

                    {platform.authorizedAssets &&
                    platform.authorizedAssets.length === 0 ? (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No authorized assets available to deauthorize.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="border rounded-lg p-3 space-y-2 max-h-96 overflow-y-auto">
                        {platform.authorizedAssets?.map(
                          (asset: AssetType, index: number) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-2 hover:bg-muted rounded"
                            >
                              <Checkbox
                                checked={selectedAssets.includes(index)}
                                onCheckedChange={() => toggleAsset(index)}
                              />
                              <label
                                htmlFor={`asset-${index}`}
                                className="text-sm font-mono flex-1 cursor-pointer"
                                onClick={() => toggleAsset(index)}
                              >
                                {asset.tag}: {asset.value}
                              </label>
                            </div>
                          )
                        )}
                      </div>
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
                    disabled={loading || selectedAssets.length === 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deauthorizing...
                      </>
                    ) : (
                      "Deauthorize Assets"
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
