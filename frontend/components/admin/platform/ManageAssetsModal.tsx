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
import { AlertCircle, X, CheckCircle, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { aegisApi } from "@/lib/api";
import type { AssetType } from "@/lib/api/aegis";
import { Settings } from "@/components/icons/Settings";

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

interface ManageAssetsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: any;
  onSuccess: () => void;
}

export function ManageAssetsModal({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: ManageAssetsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<AssetType[]>([]);
  const [currentAssetTag, setCurrentAssetTag] = useState("");
  const [currentAssetValue, setCurrentAssetValue] = useState("");

  const handleAddAsset = () => {
    if (currentAssetTag && currentAssetValue) {
      // Check if asset already exists in selection
      const exists = selectedAssets.some(
        (asset) =>
          asset.tag === currentAssetTag && asset.value === currentAssetValue
      );

      if (exists) {
        toast.error(`${currentAssetValue} is already added`);
        return;
      }

      // Check if asset is already authorized on platform
      const alreadyAuthorized = platform.authorizedAssets?.some(
        (asset: AssetType) =>
          asset.tag === currentAssetTag && asset.value === currentAssetValue
      );

      if (alreadyAuthorized) {
        toast.error(`${currentAssetValue} is already authorized`);
        return;
      }

      setSelectedAssets([
        ...selectedAssets,
        { tag: currentAssetTag, value: currentAssetValue } as AssetType,
      ]);
      setCurrentAssetTag("");
      setCurrentAssetValue("");
      toast.success(`Asset ${currentAssetValue} added`);
    }
  };

  const handleRemoveAsset = (index: number) => {
    const removed = selectedAssets[index];
    setSelectedAssets(selectedAssets.filter((_, i) => i !== index));
    toast.info(`Asset ${removed.value} removed`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (selectedAssets.length === 0) {
        throw new Error("Please add at least one asset to authorize");
      }

      const result = await aegisApi.authorizeAssets(platform.contractId, {
        newAssets: selectedAssets,
        authorizationReason: formData.get("authorizationReason") as string,
      });

      if (result.error) throw new Error(result.error);

      toast.success("Assets authorized successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to authorize assets";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedAssets([]);
      setCurrentAssetTag("");
      setCurrentAssetValue("");
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
          Manage Authorized Assets
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
                    Manage Assets
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Add new authorized assets to the platform
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
                    <p className="font-medium text-sm mb-1">
                      Asset Authorization
                    </p>
                    <p className="text-xs">
                      Add new asset types that can be used for collateral and
                      transactions on the platform.
                    </p>
                  </AlertDescription>
                </Alert>

                {selectedAssets.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Assets to Authorize ({selectedAssets.length})
                    </Label>
                    <div className="space-y-2">
                      {Array.from(
                        new Set(selectedAssets.map((a) => a.tag))
                      ).map((tag) => {
                        const assetsOfType = selectedAssets.filter(
                          (a) => a.tag === tag
                        );
                        return (
                          <div
                            key={tag}
                            className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs"
                          >
                            <span className="font-medium text-muted-foreground whitespace-nowrap">
                              {tag}:
                            </span>
                            <div className="flex-1 flex flex-wrap gap-1">
                              {assetsOfType.map((asset, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded border border-primary/20"
                                >
                                  <span className="font-mono">
                                    {asset.value}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveAsset(
                                        selectedAssets.indexOf(asset)
                                      )
                                    }
                                    className="text-destructive hover:text-destructive/80 cursor-pointer"
                                    disabled={loading}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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

                  {/* Current Authorized Assets */}
                  {platform.authorizedAssets &&
                    platform.authorizedAssets.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">
                            Currently Authorized Assets
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {platform.authorizedAssets.length}
                          </Badge>
                        </div>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {Array.from(
                            new Set(
                              platform.authorizedAssets.map(
                                (a: AssetType) => a.tag
                              )
                            )
                          ).map((tag) => {
                            const assetsOfType =
                              platform.authorizedAssets.filter(
                                (a: AssetType) => a.tag === tag
                              );
                            return (
                              <div
                                key={tag}
                                className="group flex items-center gap-3 p-2.5 bg-gradient-to-r from-card to-card/80 hover:from-primary/5 hover:to-primary/5 rounded-md border border-border/40 hover:border-primary/40 transition-all duration-150"
                              >
                                <span className="text-xs font-medium text-muted-foreground min-w-[120px]">
                                  {tag}
                                </span>
                                <div className="flex-1 flex flex-wrap gap-1.5">
                                  {assetsOfType.map(
                                    (asset: AssetType, index: number) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="font-mono text-[10px] px-2 py-0.5 bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors"
                                      >
                                        {asset.value}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Asset Selection Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Settings className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Add Assets</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="assetType">
                            Asset Type
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <Select
                            value={currentAssetTag}
                            onValueChange={setCurrentAssetTag}
                            disabled={loading}
                          >
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
                            Asset Symbol/Code
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="assetValue"
                              value={currentAssetValue}
                              onChange={(e) =>
                                setCurrentAssetValue(
                                  e.target.value.toUpperCase()
                                )
                              }
                              placeholder="e.g., BTC, USD"
                              disabled={loading}
                            />
                            <Button
                              type="button"
                              onClick={handleAddAsset}
                              disabled={
                                !currentAssetTag ||
                                !currentAssetValue ||
                                loading
                              }
                              size="sm"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="authorizationReason">
                          Authorization Reason
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <Input
                          id="authorizationReason"
                          name="authorizationReason"
                          placeholder="e.g., Adding support for new asset class"
                          required
                          disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Provide a reason for authorizing these assets
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
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading || selectedAssets.length === 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authorizing...
                      </>
                    ) : (
                      "Authorize Assets"
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
