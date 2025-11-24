"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  AlertTriangle,
  ShieldAlert,
  Power,
  PowerOff,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
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

export default function EmergencyPage() {
  const [emergencyMintOpen, setEmergencyMintOpen] = useState(false);
  const [shutdownOpen, setShutdownOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");

  // Fetch platform
  const {
    data: platform,
    isLoading: platformLoading,
    refetch: refetchPlatform,
  } = useQuery({
    queryKey: ["aegis-platform"],
    queryFn: async () => {
      const result = await aegisApi.getPlatform();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });

  const handleRefresh = async () => {
    await refetchPlatform();
    toast.success("Platform status refreshed");
  };

  const handleEmergencyMint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!platform) {
      toast.error("Platform not initialized");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const assetTag = formData.get("assetType") as string;
    const assetValue = formData.get("assetValue") as string;
    const amount = formData.get("amount") as string;
    const reason = formData.get("reason") as string;

    if (confirmAction !== "EMERGENCY MINT") {
      toast.error('Please type "EMERGENCY MINT" to confirm');
      return;
    }

    try {
      const result = await aegisApi.emergencyMint(platform.contractId, {
        assetType: { tag: assetTag, value: assetValue } as AssetType,
        emergencyAmount: amount,
        emergencyReason: reason,
      });

      if (result.error) throw new Error(result.error);

      toast.success("Emergency mint executed successfully");
      setEmergencyMintOpen(false);
      setConfirmAction("");
      refetchPlatform();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Emergency mint failed"
      );
    }
  };

  const handleEmergencyShutdown = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!platform) {
      toast.error("Platform not initialized");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const reason = formData.get("reason") as string;

    if (confirmAction !== "SHUTDOWN") {
      toast.error('Please type "SHUTDOWN" to confirm');
      return;
    }

    try {
      const result = await aegisApi.emergencyShutdown(
        platform.contractId,
        reason
      );

      if (result.error) throw new Error(result.error);

      toast.success("Platform shutdown initiated");
      setShutdownOpen(false);
      setConfirmAction("");
      refetchPlatform();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Shutdown failed");
    }
  };

  const handleReactivate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!platform) {
      toast.error("Platform not initialized");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const reason = formData.get("reason") as string;

    if (confirmAction !== "REACTIVATE") {
      toast.error('Please type "REACTIVATE" to confirm');
      return;
    }

    try {
      const result = await aegisApi.reactivatePlatform(
        platform.contractId,
        reason
      );

      if (result.error) throw new Error(result.error);

      toast.success("Platform reactivated successfully");
      setReactivateOpen(false);
      setConfirmAction("");
      refetchPlatform();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Reactivation failed"
      );
    }
  };

  const platformStatus = platform?.platformStatus?.tag || "Unknown";
  const isActive = platformStatus === "PlatformActive";
  const isSuspended = platformStatus === "PlatformSuspended";
  const isShutdown = platformStatus === "PlatformShutdown";

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <ShieldAlert className="h-8 w-8 text-red-500" />
                Emergency Operations
              </h1>
              <p className="text-muted-foreground">
                Critical platform controls - use with extreme caution
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={platformLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    platformLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Emergency operations have significant
              impact on the platform. Only use these controls in critical
              situations and ensure proper authorization.
            </AlertDescription>
          </Alert>

          {!platform && !platformLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Platform not initialized. Please create a platform first.
              </AlertDescription>
            </Alert>
          )}

          {/* Platform Status */}
          {platform && (
            <Card>
              <CardHeader>
                <CardTitle>Platform Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Current Status
                    </div>
                    <Badge
                      variant={
                        isActive
                          ? "default"
                          : isShutdown
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-lg px-4 py-2"
                    >
                      {isActive && <CheckCircle2 className="h-4 w-4 mr-2" />}
                      {isSuspended && <AlertCircle className="h-4 w-4 mr-2" />}
                      {isShutdown && <PowerOff className="h-4 w-4 mr-2" />}
                      {platformStatus}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Emergency Operator
                    </div>
                    <div className="font-mono text-sm">
                      {platform.emergencyOperator}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Emergency Mint */}
            <Dialog
              open={emergencyMintOpen}
              onOpenChange={(open) => {
                setEmergencyMintOpen(open);
                if (!open) setConfirmAction("");
              }}
            >
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:border-orange-500 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <Zap className="h-5 w-5" />
                      Emergency Mint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Mint assets to treasury in emergency situations
                    </p>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      disabled={!platform}
                    >
                      Execute
                    </Button>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-orange-600">
                    <Zap className="h-5 w-5" />
                    Emergency Mint
                  </DialogTitle>
                  <DialogDescription>
                    Mint assets to treasury for emergency liquidity needs
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEmergencyMint} className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This action will mint new assets. Ensure proper
                      authorization and documentation.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="assetType">Asset Type</Label>
                    <Select name="assetType" required>
                      <SelectTrigger>
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
                  </div>

                  <div>
                    <Label htmlFor="assetValue">Asset Value/Symbol</Label>
                    <Input
                      id="assetValue"
                      name="assetValue"
                      placeholder="e.g., USD, BTC, ETH"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount">Emergency Amount</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="reason">Emergency Reason</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      placeholder="Detailed explanation of emergency situation..."
                      required
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm">
                      Type "EMERGENCY MINT" to confirm
                    </Label>
                    <Input
                      id="confirm"
                      value={confirmAction}
                      onChange={(e) => setConfirmAction(e.target.value)}
                      placeholder="EMERGENCY MINT"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full"
                    disabled={confirmAction !== "EMERGENCY MINT"}
                  >
                    Execute Emergency Mint
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Emergency Shutdown */}
            <Dialog
              open={shutdownOpen}
              onOpenChange={(open) => {
                setShutdownOpen(open);
                if (!open) setConfirmAction("");
              }}
            >
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:border-red-500 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <PowerOff className="h-5 w-5" />
                      Emergency Shutdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Immediately halt all platform operations
                    </p>
                    <Button
                      variant="destructive"
                      className="w-full mt-4"
                      disabled={!platform || isShutdown}
                    >
                      {isShutdown ? "Already Shutdown" : "Shutdown"}
                    </Button>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <PowerOff className="h-5 w-5" />
                    Emergency Shutdown
                  </DialogTitle>
                  <DialogDescription>
                    Halt all platform operations immediately
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEmergencyShutdown} className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Critical Action:</strong> This will stop all
                      platform operations. Only use in severe security breaches
                      or system failures.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="reason">Shutdown Reason</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      placeholder="Detailed explanation of shutdown reason..."
                      required
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm">Type "SHUTDOWN" to confirm</Label>
                    <Input
                      id="confirm"
                      value={confirmAction}
                      onChange={(e) => setConfirmAction(e.target.value)}
                      placeholder="SHUTDOWN"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full"
                    disabled={confirmAction !== "SHUTDOWN"}
                  >
                    Execute Emergency Shutdown
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Reactivate Platform */}
            <Dialog
              open={reactivateOpen}
              onOpenChange={(open) => {
                setReactivateOpen(open);
                if (!open) setConfirmAction("");
              }}
            >
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:border-green-500 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <Power className="h-5 w-5" />
                      Reactivate Platform
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Resume platform operations after shutdown
                    </p>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      disabled={!platform || isActive}
                    >
                      {isActive ? "Already Active" : "Reactivate"}
                    </Button>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-green-600">
                    <Power className="h-5 w-5" />
                    Reactivate Platform
                  </DialogTitle>
                  <DialogDescription>
                    Resume normal platform operations
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleReactivate} className="space-y-4">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Ensure all issues have been resolved before reactivating
                      the platform.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="reason">Reactivation Reason</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      placeholder="Explanation of issue resolution and readiness..."
                      required
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm">
                      Type "REACTIVATE" to confirm
                    </Label>
                    <Input
                      id="confirm"
                      value={confirmAction}
                      onChange={(e) => setConfirmAction(e.target.value)}
                      placeholder="REACTIVATE"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={confirmAction !== "REACTIVATE"}
                  >
                    Reactivate Platform
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Emergency Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Operation Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Emergency Mint</h3>
                <p className="text-sm text-muted-foreground">
                  Use only when immediate liquidity is required to prevent
                  system failure. Document all minting operations thoroughly for
                  audit purposes.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Emergency Shutdown</h3>
                <p className="text-sm text-muted-foreground">
                  Activate in case of: severe security breach, critical system
                  vulnerability, regulatory requirement, or catastrophic
                  technical failure. Notify all stakeholders immediately.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Platform Reactivation</h3>
                <p className="text-sm text-muted-foreground">
                  Before reactivating: verify all issues are resolved, conduct
                  security audit, test critical functions, and obtain necessary
                  approvals.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
