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
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { AlertCircle, Plus, X, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { aegisApi, authApi } from "@/lib/api";
import type { AssetType } from "@/lib/api/aegis";
import { Platform } from "@/components/icons/Platform";
import { Settings } from "@/components/icons/Settings";
import { Users } from "@/components/icons/Users";

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

// Quick add presets for common assets
const QUICK_ADD_ASSETS = [
  // Stablecoins
  { tag: "Stablecoin", value: "USDC", label: "USDC" },
  { tag: "Stablecoin", value: "USDT", label: "USDT" },
  { tag: "Stablecoin", value: "DAI", label: "DAI" },
  { tag: "Stablecoin", value: "BUSD", label: "BUSD" },
  // Fiat Currencies
  { tag: "FiatCurrency", value: "USD", label: "USD" },
  { tag: "FiatCurrency", value: "EUR", label: "EUR" },
  { tag: "FiatCurrency", value: "GBP", label: "GBP" },
  { tag: "FiatCurrency", value: "JPY", label: "JPY" },
  // Cryptocurrencies
  { tag: "Cryptocurrency", value: "BTC", label: "BTC" },
  { tag: "Cryptocurrency", value: "ETH", label: "ETH" },
] as const;

interface CreatePlatformModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreatePlatformModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePlatformModalProps) {
  const [selectedAssets, setSelectedAssets] = useState<AssetType[]>([]);
  const [currentAssetTag, setCurrentAssetTag] = useState("");
  const [currentAssetValue, setCurrentAssetValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch users for party selection - only when modal is open
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await authApi.listUsers();
      if (result.status === 200 && result.data) {
        return result.data;
      }
      throw new Error(result.error || "Failed to fetch users");
    },
    enabled: open,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const handleAddAsset = () => {
    if (currentAssetTag && currentAssetValue) {
      // Check if asset already exists
      const exists = selectedAssets.some(
        (asset) =>
          asset.tag === currentAssetTag && asset.value === currentAssetValue
      );

      if (exists) {
        toast.error(`${currentAssetValue} is already added`);
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

  const handleQuickAdd = (asset: { tag: string; value: string }) => {
    // Check if asset already exists
    const exists = selectedAssets.some(
      (a) => a.tag === asset.tag && a.value === asset.value
    );

    if (exists) {
      toast.error(`${asset.value} is already added`);
      return;
    }

    setSelectedAssets([
      ...selectedAssets,
      { tag: asset.tag, value: asset.value } as AssetType,
    ]);
    toast.success(`${asset.value} added`);
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
        throw new Error("Please add at least one authorized asset");
      }

      const result = await aegisApi.createPlatform({
        platform: formData.get("platform") as string,
        emergencyOperator: formData.get("emergencyOperator") as string,
        complianceOfficer: formData.get("complianceOfficer") as string,
        authorizedAssets: selectedAssets,
        platformFeeRate: formData.get("platformFeeRate") as string,
      });

      if (result.error) {
        // Check if platform already exists
        if (
          result.error.includes("DUPLICATE_CONTRACT_KEY") ||
          result.error.includes("already exists")
        ) {
          throw new Error(
            "Platform already exists. Only one platform can be created per admin party."
          );
        }
        throw new Error(result.error);
      }

      toast.success("Platform created successfully");
      handleClose();
      onSuccess();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to create platform";
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
          Create Aegis Platform
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
                  <Platform size={40} className="text-primary" />
                </div>
                <div className="mb-3">
                  <h1 className="text-xl font-bold text-foreground mb-2">
                    Create Platform
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Initialize the Aegis platform with configuration
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
                    <p className="font-medium text-sm mb-1">Platform Setup</p>
                    <p className="text-xs">
                      Configure platform operators, fee rates, and authorized
                      assets for the Aegis lending platform.
                    </p>
                  </AlertDescription>
                </Alert>

                {selectedAssets.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Selected Assets ({selectedAssets.length})
                    </Label>
                    <div className="space-y-2">
                      {/* Group assets by type */}
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
          <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0">
            <div className="p-8 pt-16 h-full min-h-full">
              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Platform Configuration Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Settings className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">
                      Platform Configuration
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform">
                        Platform Party{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select name="platform" required disabled={loading}>
                        <SelectTrigger className="h-auto min-h-[50px]">
                          <SelectValue placeholder="Select platform party" />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter((u) => u.role === "admin")
                            .map((user) => (
                              <SelectItem
                                key={user.id}
                                value={user.damlParty}
                                className="py-2"
                              >
                                <div className="flex flex-col items-start gap-1">
                                  <span className="font-medium">
                                    {user.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {user.damlParty}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        The admin party that will own and operate the platform
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="platformFeeRate">
                        Platform Fee Rate (%)
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        id="platformFeeRate"
                        name="platformFeeRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        placeholder="e.g., 0.5"
                        required
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Fee percentage (0-10%) charged on all platform
                        transactions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Operators Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">
                      Platform Operators
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyOperator">
                        Emergency Operator
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Select
                        name="emergencyOperator"
                        required
                        disabled={loading}
                      >
                        <SelectTrigger className="h-auto min-h-[50px]">
                          <SelectValue placeholder="Select emergency operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter((u) => u.role === "admin")
                            .map((user) => (
                              <SelectItem key={user.id} value={user.damlParty}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">
                                    {user.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {user.damlParty}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complianceOfficer">
                        Compliance Officer
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Select
                        name="complianceOfficer"
                        required
                        disabled={loading}
                      >
                        <SelectTrigger className="h-auto min-h-[50px]">
                          <SelectValue placeholder="Select compliance officer" />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter(
                              (u) =>
                                u.role === "admin" ||
                                u.role === "compliance_officer"
                            )
                            .map((user) => (
                              <SelectItem key={user.id} value={user.damlParty}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">
                                    {user.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.role}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Authorized Assets Section */}
                <div className="space-y-3">
                  <Label>
                    Authorized Assets{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add at least one asset type that will be authorized for
                    platform operations
                  </p>

                  {/* Quick Add Buttons - Smart suggestions based on selected type */}
                  {currentAssetTag && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">
                        Quick Add {currentAssetTag}
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_ADD_ASSETS.filter(
                          (asset) => asset.tag === currentAssetTag
                        ).map((asset, index) => {
                          const isAdded = selectedAssets.some(
                            (a) =>
                              a.tag === asset.tag && a.value === asset.value
                          );
                          return (
                            <Button
                              key={index}
                              type="button"
                              variant={isAdded ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => handleQuickAdd(asset)}
                              disabled={loading || isAdded}
                              className="h-7 text-xs"
                            >
                              {isAdded && (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              {asset.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Select
                        value={currentAssetTag}
                        onValueChange={setCurrentAssetTag}
                        disabled={loading}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select asset type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSET_TYPES.map((type) => (
                            <SelectItem key={type.tag} value={type.tag}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Asset symbol (e.g., USD, BTC)"
                        value={currentAssetValue}
                        onChange={(e) =>
                          setCurrentAssetValue(e.target.value.toUpperCase())
                        }
                        className="flex-1"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        onClick={handleAddAsset}
                        disabled={
                          !currentAssetTag || !currentAssetValue || loading
                        }
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {selectedAssets.length > 0 ? (
                      <div className="p-3 border rounded-lg bg-muted/50 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Selected Assets ({selectedAssets.length})
                        </p>
                        <div className="space-y-2">
                          {/* Group assets by type */}
                          {Array.from(
                            new Set(selectedAssets.map((a) => a.tag))
                          ).map((tag) => {
                            const assetsOfType = selectedAssets.filter(
                              (a) => a.tag === tag
                            );
                            return (
                              <div
                                key={tag}
                                className="flex items-start gap-2 text-xs"
                              >
                                <span className="font-medium text-muted-foreground whitespace-nowrap">
                                  {tag}:
                                </span>
                                <div className="flex-1 flex flex-wrap gap-1">
                                  {assetsOfType.map((asset, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors bg-primary/10 border-primary/20"
                                      onClick={() =>
                                        handleRemoveAsset(
                                          selectedAssets.indexOf(asset)
                                        )
                                      }
                                    >
                                      {asset.value}
                                      <X className="ml-1 h-3 w-3" />
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                        No assets added yet. Add at least one asset to continue.
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
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
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={selectedAssets.length === 0 || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Platform"
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
