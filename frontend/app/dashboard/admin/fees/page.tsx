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
import {
  DollarSign,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Percent,
  FileText,
  ShoppingCart,
  Users as UsersIcon,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import { aegisApi } from "@/lib/api";

export default function FeeCollectionPage() {
  const [showCollectPlatformFeeModal, setShowCollectPlatformFeeModal] =
    useState(false);
  const [showCollectSecondaryFeeModal, setShowCollectSecondaryFeeModal] =
    useState(false);
  const [showCollectSyndicationFeeModal, setShowCollectSyndicationFeeModal] =
    useState(false);
  const [showCollectPoolFeeModal, setShowCollectPoolFeeModal] = useState(false);
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
      await refetch();
      toast.success("Fee data refreshed");
    } catch (error) {
      console.error("Error refreshing fees:", error);
      toast.error("Failed to refresh fee data");
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Fee Collection
              </h1>
              <p className="text-muted-foreground">
                Monitor and collect platform fees
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
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error Loading Fees</strong>
                <br />
                {error instanceof Error ? error.message : "Failed to load fees"}
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
                    <p className="text-muted-foreground">Loading fee data...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : !platform ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Platform Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create a platform first to manage fees.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Fee Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Total Fees Collected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {platform.totalFeesCollected}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      All-time platform revenue
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      Platform Fee Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {platform.platformFeeRate}%
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Current fee percentage
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Fee Collection Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Fee Collection Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto py-6 flex flex-col items-start gap-2"
                        onClick={() => setShowCollectPlatformFeeModal(true)}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          <span className="font-semibold">Platform Fee</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-left">
                          Collect fees from loan originations
                        </p>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto py-6 flex flex-col items-start gap-2"
                        onClick={() => setShowCollectSecondaryFeeModal(true)}
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          <span className="font-semibold">
                            Secondary Market Fee
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground text-left">
                          Collect fees from loan transfers
                        </p>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto py-6 flex flex-col items-start gap-2"
                        onClick={() => setShowCollectSyndicationFeeModal(true)}
                      >
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-5 w-5" />
                          <span className="font-semibold">Syndication Fee</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-left">
                          Collect fees from syndicated loans
                        </p>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto py-6 flex flex-col items-start gap-2"
                        onClick={() => setShowCollectPoolFeeModal(true)}
                      >
                        <div className="flex items-center gap-2">
                          <Coins className="h-5 w-5" />
                          <span className="font-semibold">
                            Pool Management Fee
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground text-left">
                          Collect fees from liquidity pools
                        </p>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Fee Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Fee Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Loan Origination</p>
                          <p className="text-sm text-muted-foreground">
                            Fee on new loans
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">
                        {platform.platformFeeRate}%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">Secondary Market</p>
                          <p className="text-sm text-muted-foreground">
                            Fee on loan transfers
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">
                        {platform.platformFeeRate}%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <UsersIcon className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="font-medium">Syndication</p>
                          <p className="text-sm text-muted-foreground">
                            Fee on syndicated loans
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">
                        {platform.platformFeeRate}%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Coins className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium">Pool Management</p>
                          <p className="text-sm text-muted-foreground">
                            Fee on liquidity pools
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">
                        {platform.platformFeeRate}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
