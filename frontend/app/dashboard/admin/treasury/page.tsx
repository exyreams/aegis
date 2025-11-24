"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Coins,
  AlertCircle,
  RefreshCw,
  Plus,
  Layers,
  TrendingUp,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { aegisApi } from "@/lib/api";
import {
  MintToTreasuryModal,
  BulkMintModal,
  InjectFundsModal,
  EmergencyMintModal,
} from "@/components/admin/treasury";

export default function TreasuryManagementPage() {
  const queryClient = useQueryClient();
  const [showMintModal, setShowMintModal] = useState(false);
  const [showBulkMintModal, setShowBulkMintModal] = useState(false);
  const [showInjectModal, setShowInjectModal] = useState(false);
  const [showEmergencyMintModal, setShowEmergencyMintModal] = useState(false);
  const [isHoveringRefresh, setIsHoveringRefresh] = useState(false);

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
      const result = await aegisApi.getPlatform();
      console.log("Platform data received:", result.data);
      if (result.status === 200 && result.data) {
        return result.data;
      }
      throw new Error(result.error || "Failed to fetch platform");
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = async () => {
    try {
      console.log("Refreshing treasury data...");
      // Invalidate and refetch the query
      await queryClient.invalidateQueries({ queryKey: ["aegis-platform"] });
      await refetch();
      console.log("Treasury data refreshed");
      toast.success("Treasury data refreshed");
    } catch (error) {
      console.error("Error refreshing treasury:", error);
      toast.error("Failed to refresh treasury data");
    }
  };

  const calculateTotalTreasuryValue = () => {
    if (!platform?.treasury?.treasuryBalances) {
      console.log("No treasury balances found:", platform?.treasury);
      return "0";
    }
    console.log("Treasury balances:", platform.treasury.treasuryBalances);
    return platform.treasury.treasuryBalances
      .reduce((sum, balance: any) => {
        // Handle DAML tuple format: {_1: assetType, _2: amount}
        const amount = balance._2 || balance.amount || "0";
        return sum + parseFloat(amount);
      }, 0)
      .toFixed(2);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Treasury Management
              </h1>
              <p className="text-muted-foreground">
                Manage treasury operations and asset minting
              </p>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                onHoverStart={() => setIsHoveringRefresh(true)}
                onHoverEnd={() => setIsHoveringRefresh(false)}
              >
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
              </motion.div>
              {platform && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowMintModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Mint to Treasury
                  </Button>
                  <Button onClick={() => setShowBulkMintModal(true)}>
                    <Layers className="h-4 w-4 mr-2" />
                    Bulk Mint
                  </Button>
                </>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error Loading Treasury</strong>
                <br />
                {error instanceof Error
                  ? error.message
                  : "Failed to load treasury"}
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
                      Loading treasury data...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : !platform ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Platform Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create a platform first to manage treasury.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Treasury Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Treasury Value
                    </CardTitle>
                    <Coins className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${calculateTotalTreasuryValue()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across all assets
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Reserve Ratio
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {platform.treasury?.reserveRatio || "0"}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum threshold
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Asset Types
                    </CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {platform.treasury?.treasuryBalances?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Different types
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Last Audit
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {platform.treasury?.lastAuditDate
                        ? new Date(
                            platform.treasury.lastAuditDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">Audit date</p>
                  </CardContent>
                </Card>
              </div>

              {/* Treasury Balances */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Treasury Balances</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage and monitor treasury asset holdings
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowInjectModal(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Inject Funds
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowEmergencyMintModal(true)}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Emergency
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!platform.treasury?.treasuryBalances ||
                  platform.treasury.treasuryBalances.length === 0 ? (
                    <div className="text-center py-12">
                      <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Treasury Balances
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Mint assets to the treasury to get started.
                      </p>
                      <Button onClick={() => setShowMintModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Mint to Treasury
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(() => {
                        console.log(
                          "Rendering balances:",
                          platform.treasury.treasuryBalances
                        );
                        return platform.treasury.treasuryBalances
                          .filter((balance: any) => {
                            console.log("Balance item:", balance);
                            // Handle DAML tuple format: {_1: assetType, _2: amount}
                            return balance?._1 || balance?.assetType;
                          })
                          .map((balance: any, index: number) => {
                            // Handle DAML tuple format
                            const assetType = balance._1 || balance.assetType;
                            const amount = balance._2 || balance.amount || "0";

                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Coins className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {assetType?.value || "N/A"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {assetType?.tag || "Unknown"}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold tabular-nums">
                                    {parseFloat(amount).toLocaleString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Available
                                  </p>
                                </div>
                              </motion.div>
                            );
                          });
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Modals */}
        {platform && (
          <>
            <MintToTreasuryModal
              open={showMintModal}
              onOpenChange={setShowMintModal}
              platform={platform}
              onSuccess={handleRefresh}
            />
            <BulkMintModal
              open={showBulkMintModal}
              onOpenChange={setShowBulkMintModal}
              platform={platform}
              onSuccess={handleRefresh}
            />
            <InjectFundsModal
              open={showInjectModal}
              onOpenChange={setShowInjectModal}
              platform={platform}
              onSuccess={handleRefresh}
            />
            <EmergencyMintModal
              open={showEmergencyMintModal}
              onOpenChange={setShowEmergencyMintModal}
              platform={platform}
              onSuccess={handleRefresh}
            />
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
