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
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { AlertCircle, X, Loader2, Layers, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { aegisApi } from "@/lib/api";
import type { AssetType } from "@/lib/api/aegis";

interface BulkMintItem {
  assetType: AssetType;
  amount: string;
}

interface BulkMintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: any;
  onSuccess: () => void;
}

export function BulkMintModal({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: BulkMintModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mintItems, setMintItems] = useState<BulkMintItem[]>([]);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [amount, setAmount] = useState("");

  const handleAddItem = () => {
    if (!selectedAsset || !amount) {
      toast.error("Please select an asset and enter an amount");
      return;
    }

    const [tag, value] = selectedAsset.split(":");
    const newItem: BulkMintItem = {
      assetType: { tag, value } as AssetType,
      amount,
    };

    setMintItems([...mintItems, newItem]);
    setSelectedAsset("");
    setAmount("");
    toast.success("Asset added to bulk mint list");
  };

  const handleRemoveItem = (index: number) => {
    setMintItems(mintItems.filter((_, i) => i !== index));
    toast.info("Asset removed from list");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const bulkReason = formData.get("bulkReason") as string;

    try {
      if (mintItems.length === 0) {
        throw new Error("Please add at least one asset to mint");
      }

      const result = await aegisApi.bulkMintToTreasury(platform.contractId, {
        mintingPlan: mintItems,
        bulkReason,
      });

      if (result.error) throw new Error(result.error);

      toast.success(
        `Successfully minted ${mintItems.length} assets to treasury`
      );
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to bulk mint assets";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMintItems([]);
      setSelectedAsset("");
      setAmount("");
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
        <WideModalTitle className="sr-only">Bulk Mint Assets</WideModalTitle>

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
                  <Layers size={40} className="text-primary" />
                </div>
                <div className="mb-3">
                  <h1 className="text-xl font-bold text-foreground mb-2">
                    Bulk Mint Assets
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Mint multiple assets to treasury at once
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
                  <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    <p className="font-medium text-sm mb-1">Bulk Minting</p>
                    <p className="text-xs">
                      Add multiple assets to mint them all in a single
                      transaction.
                    </p>
                  </AlertDescription>
                </Alert>

                {mintItems.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Assets to Mint ({mintItems.length})
                    </Label>
                    <div className="space-y-2">
                      {mintItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs"
                        >
                          <div>
                            <p className="font-medium">
                              {item.assetType.value}
                            </p>
                            <p className="text-muted-foreground">
                              {item.amount}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-destructive hover:text-destructive/80 cursor-pointer"
                            disabled={loading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                      <Layers className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Add Assets</h3>
                    </div>

                    {platform.authorizedAssets &&
                    platform.authorizedAssets.length > 0 ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="asset">Select Asset</Label>
                          <Select
                            value={selectedAsset}
                            onValueChange={setSelectedAsset}
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
                          <Label htmlFor="amount">Amount</Label>
                          <div className="flex gap-2">
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="e.g., 1000.00"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              disabled={loading}
                            />
                            <Button
                              type="button"
                              onClick={handleAddItem}
                              disabled={!selectedAsset || !amount || loading}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bulkReason">
                            Bulk Mint Reason
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <Input
                            id="bulkReason"
                            name="bulkReason"
                            placeholder="e.g., Monthly treasury replenishment"
                            required
                            disabled={loading}
                          />
                          <p className="text-xs text-muted-foreground">
                            Reason for this bulk minting operation
                          </p>
                        </div>
                      </>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No authorized assets found. Please authorize assets
                          first.
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
                    className="flex-1"
                    disabled={loading || mintItems.length === 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Minting...
                      </>
                    ) : (
                      `Mint ${mintItems.length} Assets`
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
