"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  Shield,
  AlertCircle,
  RefreshCw,
  Plus,
  Settings,
  Activity,
  DollarSign,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { aegisApi, authApi } from "@/lib/api";
import {
  CreatePlatformModal,
  UpdateFeeRateModal,
  ManageAssetsModal,
} from "@/components/admin/platform";
import { Platform } from "@/components/icons/Platform";

export default function PlatformManagementPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateFeeModal, setShowUpdateFeeModal] = useState(false);
  const [showManageAssetsModal, setShowManageAssetsModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  // Fetch platform data
  const {
    data: platform,
    isLoading: loading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["aegis-platform"],
    queryFn: async () => {
      console.log("Fetching platform data...");
      const result = await aegisApi.getPlatform();
      console.log("Platform result:", result);

      if (result.status === 200 && result.data) {
        return result.data;
      }
      if (result.status === 404 || !result.data) {
        return null; // No platform exists yet
      }
      throw new Error(result.error || "Failed to fetch platform");
    },
    staleTime: 30000, // 30 seconds - same as users page
    refetchOnWindowFocus: false,
  });

  // Fetch lenders count
  const { data: lenders = [] } = useQuery({
    queryKey: ["lenders"],
    queryFn: async () => {
      const result = await authApi.listLenders();
      if (result.error) {
        console.error("Error fetching lenders:", result.error);
        return [];
      }
      return result.data || [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Platform data refreshed");
    } catch (error) {
      console.error("Error refreshing platform:", error);
      toast.error("Failed to refresh platform data");
    }
  };

  const getPlatformStatusColor = (status: string | undefined) => {
    if (!status) return "outline";
    switch (status) {
      case "PlatformActive":
        return "default";
      case "PlatformMaintenance":
        return "secondary";
      case "PlatformEmergencyShutdown":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPlatformStatusLabel = (status: string | undefined) => {
    if (!status) return "Unknown";
    return status.replace("Platform", "").replace("Emergency", " Emergency ");
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Platform Management
              </h1>
              <p className="text-muted-foreground">
                Configure and monitor the Aegis platform
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefetching || loading}
              >
                <RefreshCw
                  size={16}
                  className={`mr-2 ${isRefetching ? "animate-spin" : ""}`}
                />
                {isRefetching ? "Refreshing..." : "Refresh"}
              </Button>
              {!platform && !loading && (
                <Button onClick={() => setShowCreateModal(true)}>
                  Initialize Platform
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error Loading Platform</strong>
                <br />
                {error instanceof Error
                  ? error.message
                  : "Failed to load platform"}
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw
                      size={32}
                      className="animate-spin mx-auto mb-3 text-primary"
                    />
                    <p className="text-muted-foreground">
                      Loading platform data...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : !platform ? (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-6">
                  {/* Icon */}
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
                      <Platform size={48} className="text-primary" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">
                      No Platform Initialized
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Initialize the Aegis platform to start managing loans,
                      lenders, and platform operations.
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-xl mx-auto">
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <Settings className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-xs font-medium">Configure Operators</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-xs font-medium">Set Fee Rates</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <Activity className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-xs font-medium">Authorize Assets</p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Button
                      size="lg"
                      onClick={() => setShowCreateModal(true)}
                      className="px-8"
                    >
                      Initialize Platform
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Platform Overview */}
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Status</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {getPlatformStatusLabel(platform.platformStatus)}
                    </CardTitle>
                    <CardAction>
                      <Badge
                        variant={getPlatformStatusColor(
                          platform.platformStatus
                        )}
                      >
                        <Activity className="h-4 w-4" />
                        {platform.platformStatus === "PlatformActive"
                          ? "Active"
                          : platform.platformStatus === "PlatformMaintenance"
                          ? "Maintenance"
                          : "Emergency"}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Platform status
                    </div>
                    <div className="text-muted-foreground">
                      Current operational state
                    </div>
                  </CardFooter>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Total Loans</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {platform.totalLoansOriginated}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <DollarSign className="h-4 w-4" />
                        Originated
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Loan volume
                    </div>
                    <div className="text-muted-foreground">
                      Total loans processed
                    </div>
                  </CardFooter>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Fees Collected</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {platform.totalFeesCollected}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <DollarSign className="h-4 w-4" />
                        Revenue
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Platform revenue
                    </div>
                    <div className="text-muted-foreground">
                      Total fees earned
                    </div>
                  </CardFooter>
                </Card>

                <Card className="@container/card">
                  <CardHeader>
                    <CardDescription>Active Lenders</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      {lenders.length}
                    </CardTitle>
                    <CardAction>
                      <Badge variant="outline">
                        <Users className="h-4 w-4" />
                        Registered
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Lender network
                    </div>
                    <div className="text-muted-foreground">
                      Approved lenders
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Platform Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Platform Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">
                        Platform Party
                      </label>
                      <div className="relative group">
                        <p className="text-sm font-mono break-all bg-muted/50 p-2 pr-10 rounded-md border text-muted-foreground/70">
                          {platform.platform}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            handleCopy(platform.platform, "platform")
                          }
                        >
                          {copiedField === "platform" ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">
                        Platform Fee Rate
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono bg-muted/50 px-3 py-2 rounded-md border flex-1 text-muted-foreground/70">
                          {platform.platformFeeRate
                            ? (
                                parseFloat(platform.platformFeeRate) * 100
                              ).toFixed(2)
                            : "0.00"}
                          %
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowUpdateFeeModal(true)}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">
                        Authorized Assets
                      </label>
                      <div className="flex items-start gap-2">
                        <div className="flex-1 bg-muted/50 px-3 py-2 rounded-md border min-h-[42px]">
                          {platform.authorizedAssets &&
                          platform.authorizedAssets.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {platform.authorizedAssets.map(
                                (asset: any, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs font-mono"
                                  >
                                    {asset.value}
                                  </Badge>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground/70">
                              No assets authorized
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowManageAssetsModal(true)}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">
                        Emergency Operator
                      </label>
                      <div className="relative group">
                        <p className="text-sm font-mono break-all bg-muted/50 p-2 pr-10 rounded-md border text-muted-foreground/70">
                          {platform.emergencyOperator}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            handleCopy(
                              platform.emergencyOperator,
                              "emergencyOperator"
                            )
                          }
                        >
                          {copiedField === "emergencyOperator" ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">
                        Compliance Officer
                      </label>
                      <div className="relative group">
                        <p className="text-sm font-mono break-all bg-muted/50 p-2 pr-10 rounded-md border text-muted-foreground/70">
                          {platform.complianceOfficer}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            handleCopy(
                              platform.complianceOfficer,
                              "complianceOfficer"
                            )
                          }
                        >
                          {copiedField === "complianceOfficer" ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Authorized Assets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {platform.authorizedAssets.map((asset, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {asset.tag}: {asset.value}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">
                        Treasury Reserve Ratio
                      </label>
                      <p className="text-sm font-mono bg-muted/50 px-3 py-2 rounded-md border text-muted-foreground/70">
                        {platform.treasury.reserveRatio}%
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">
                        Last Treasury Audit
                      </label>
                      <p className="text-sm bg-muted/50 px-3 py-2 rounded-md border text-muted-foreground/70">
                        {new Date(
                          platform.treasury.lastAuditDate
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Treasury Balances */}
              <Card>
                <CardHeader>
                  <CardTitle>Treasury Balances</CardTitle>
                </CardHeader>
                <CardContent>
                  {platform.treasury.treasuryBalances.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No treasury balances
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {platform.treasury.treasuryBalances.map(
                        (balance, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                {balance.assetType.tag}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {balance.assetType.value}
                              </p>
                            </div>
                            <p className="text-lg font-bold">
                              {balance.amount}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Create Platform Modal */}
        <CreatePlatformModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />

        {/* Update Fee Rate Modal */}
        {platform && (
          <UpdateFeeRateModal
            open={showUpdateFeeModal}
            onOpenChange={setShowUpdateFeeModal}
            platform={platform}
            onSuccess={() => {
              setShowUpdateFeeModal(false);
              refetch();
            }}
          />
        )}

        {/* Manage Assets Modal */}
        {platform && (
          <ManageAssetsModal
            open={showManageAssetsModal}
            onOpenChange={setShowManageAssetsModal}
            platform={platform}
            onSuccess={() => {
              setShowManageAssetsModal(false);
              refetch();
            }}
          />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
