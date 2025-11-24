"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import {
  Shield,
  AlertCircle,
  RefreshCw,
  Plus,
  X,
  Search,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { aegisApi } from "@/lib/api";
import { AuthorizeAssetsModal } from "@/components/admin/assets/AuthorizeAssetsModal";
import { DeauthorizeAssetsModal } from "@/components/admin/assets/DeauthorizeAssetsModal";

export default function AssetManagementPage() {
  const [showAuthorizeModal, setShowAuthorizeModal] = useState(false);
  const [showDeauthorizeModal, setShowDeauthorizeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch platform data
  const {
    data: platform,
    isLoading: platformLoading,
    error: platformError,
    refetch: refetchPlatform,
  } = useQuery({
    queryKey: ["aegis-platform"],
    queryFn: async () => {
      const result = await aegisApi.getPlatform();
      if (result.status === 200 && result.data) {
        return result.data;
      }
      throw new Error(result.error || "Failed to fetch platform");
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Treasury balances come from the platform contract
  const balances = platform?.treasury?.treasuryBalances || [];

  const isRefetching = platformLoading;

  // Filter balances by search
  const filteredBalances = balances.filter((balance: any) => {
    const assetType = balance._1 || balance.assetType;
    const matchesSearch =
      assetType?.tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assetType?.value?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleRefresh = async () => {
    try {
      await refetchPlatform();
      toast.success("Asset data refreshed");
    } catch (error) {
      console.error("Error refreshing assets:", error);
      toast.error("Failed to refresh asset data");
    }
  };

  const loading = platformLoading;
  const error = platformError;

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Asset Management
              </h1>
              <p className="text-muted-foreground">
                Manage authorized assets and treasury balances
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
              {platform && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowAuthorizeModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Authorize Assets
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeauthorizeModal(true)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Deauthorize Assets
                  </Button>
                </>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error Loading Assets</strong>
                <br />
                {error instanceof Error
                  ? error.message
                  : "Failed to load assets"}
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
                      Loading asset data...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : !platform ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Platform Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create a platform first to manage assets.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Asset Overview Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Authorized Assets
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {platform.authorizedAssets.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Asset types approved
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Balances
                    </CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{balances.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Asset types in treasury
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Treasury Value
                    </CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {balances
                        .reduce((sum: number, b: any) => {
                          const amount = b._2 || b.amount || "0";
                          return sum + parseFloat(amount);
                        }, 0)
                        .toFixed(2)}
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
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {platform?.treasury?.reserveRatio || "0"}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum threshold
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Authorized Assets */}
              <Card>
                <CardHeader>
                  <CardTitle>Authorized Assets</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Assets approved for use on the platform
                  </p>
                </CardHeader>
                <CardContent>
                  {platform.authorizedAssets.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Authorized Assets
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Authorize assets to enable platform operations.
                      </p>
                      <Button onClick={() => setShowAuthorizeModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Authorize Assets
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {platform.authorizedAssets.map((asset, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm py-2 px-3"
                        >
                          {asset.tag}: {asset.value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Treasury Balances */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Treasury Balances</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Platform treasury asset holdings
                        </p>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <div className="flex-1 min-w-0">
                        <div className="relative w-full">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by asset type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full"
                          />
                        </div>
                      </div>
                      {searchQuery && (
                        <div className="flex-shrink-0">
                          <Button
                            variant="outline"
                            onClick={() => setSearchQuery("")}
                            className="w-full sm:w-auto"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>

                    {filteredBalances.length !== balances.length && (
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredBalances.length} of {balances.length}{" "}
                        assets
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredBalances.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {balances.length === 0
                          ? "No Treasury Balances"
                          : "No Matching Assets"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {balances.length === 0
                          ? "Mint assets to the treasury to get started."
                          : "Try adjusting your search criteria."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredBalances.map((balance: any, index: number) => {
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
                            <div className="flex items-center gap-3 flex-1">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
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
                      })}
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
            <AuthorizeAssetsModal
              open={showAuthorizeModal}
              onOpenChange={setShowAuthorizeModal}
              platform={platform}
              onSuccess={handleRefresh}
            />
            <DeauthorizeAssetsModal
              open={showDeauthorizeModal}
              onOpenChange={setShowDeauthorizeModal}
              platform={platform}
              onSuccess={handleRefresh}
            />
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
