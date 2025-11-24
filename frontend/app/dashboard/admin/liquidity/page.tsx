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
  Droplets,
  AlertCircle,
  RefreshCw,
  Plus,
  Search,
  X,
  TrendingUp,
  Award,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { aegisApi } from "@/lib/api";
import type { LiquiditySupport } from "@/lib/api/aegis";

export default function LiquidityManagementPage() {
  const [showProvideSupportModal, setShowProvideSupportModal] = useState(false);
  const [showRegisterPoolModal, setShowRegisterPoolModal] = useState(false);
  const [showPoolBonusModal, setShowPoolBonusModal] = useState(false);
  const [isHoveringRefresh, setIsHoveringRefresh] = useState(false);
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

  // Fetch liquidity support
  const {
    data: liquiditySupports = [],
    isLoading: supportsLoading,
    error: supportsError,
    refetch: refetchSupports,
    isRefetching,
  } = useQuery({
    queryKey: ["liquidity-support"],
    queryFn: async () => {
      const result = await aegisApi.getLiquiditySupport();
      if (result.status === 200) {
        return result.data || [];
      }
      throw new Error(result.error || "Failed to fetch liquidity support");
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchPlatform(), refetchSupports()]);
      toast.success("Liquidity data refreshed");
    } catch (error) {
      console.error("Error refreshing liquidity:", error);
      toast.error("Failed to refresh liquidity data");
    }
  };

  // Filter liquidity supports
  const filteredSupports = liquiditySupports.filter(
    (support) =>
      support.lender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      support.supportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      support.supportReason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearFilters = () => {
    setSearchQuery("");
  };

  // Calculate statistics
  const activeSupports = liquiditySupports.filter(
    (s) => s.status.tag === "Active"
  );
  const totalSupportAmount = liquiditySupports.reduce(
    (sum, s) => sum + parseFloat(s.supportAmount || "0"),
    0
  );
  const totalOutstanding = activeSupports.reduce(
    (sum, s) => sum + parseFloat(s.outstandingAmount || "0"),
    0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Repaid":
        return "secondary";
      case "Defaulted":
        return "destructive";
      default:
        return "outline";
    }
  };

  const loading = platformLoading || supportsLoading;
  const error = platformError || supportsError;

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Liquidity Management
              </h1>
              <p className="text-muted-foreground">
                Manage liquidity support and pool operations
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
                    onClick={() => setShowRegisterPoolModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Register Pool
                  </Button>
                  <Button onClick={() => setShowProvideSupportModal(true)}>
                    <Droplets className="h-4 w-4 mr-2" />
                    Provide Support
                  </Button>
                </>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error Loading Liquidity</strong>
                <br />
                {error instanceof Error
                  ? error.message
                  : "Failed to load liquidity"}
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
                      Loading liquidity data...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : !platform ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Platform Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create a platform first to manage liquidity.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Liquidity Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Active Supports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {activeSupports.length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Currently active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Total Provided
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalSupportAmount.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      All-time support
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Droplets className="h-5 w-5" />
                      Outstanding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalOutstanding.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      To be repaid
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Pool Management Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Pool Management</CardTitle>
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
                        onClick={() => setShowRegisterPoolModal(true)}
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          <span className="font-semibold">Register Pool</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-left">
                          Register a new liquidity pool
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
                        onClick={() => setShowPoolBonusModal(true)}
                      >
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          <span className="font-semibold">
                            Performance Bonus
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground text-left">
                          Reward pool performance
                        </p>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Liquidity Support List */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col space-y-4">
                    <CardTitle>Liquidity Support Contracts</CardTitle>

                    {/* Search */}
                    <div className="flex gap-3 w-full">
                      <div className="flex-1 min-w-0">
                        <div className="relative w-full">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by lender, ID, or reason..."
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
                            onClick={clearFilters}
                            className="w-full sm:w-auto"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>

                    {filteredSupports.length !== liquiditySupports.length && (
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredSupports.length} of{" "}
                        {liquiditySupports.length} supports
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredSupports.length === 0 ? (
                    <div className="text-center py-12">
                      <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {liquiditySupports.length === 0
                          ? "No Liquidity Support"
                          : "No Matching Support"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {liquiditySupports.length === 0
                          ? "Provide liquidity support to lenders to get started."
                          : "Try adjusting your search criteria."}
                      </p>
                      {liquiditySupports.length === 0 && (
                        <Button
                          onClick={() => setShowProvideSupportModal(true)}
                        >
                          <Droplets className="h-4 w-4 mr-2" />
                          Provide Support
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredSupports.map((support, index) => (
                        <motion.div
                          key={support.supportId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-semibold text-lg">
                                {support.supportId}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Lender: {support.lender.substring(0, 20)}...
                              </p>
                            </div>
                            <Badge variant={getStatusColor(support.status.tag)}>
                              {support.status.tag}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Support Amount
                              </p>
                              <p className="text-lg font-bold">
                                {support.supportAmount}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Outstanding
                              </p>
                              <p className="text-lg font-bold">
                                {support.outstandingAmount}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Reason: {support.supportReason}</p>
                            <p>
                              Interest Rate:{" "}
                              {support.repaymentTerms.interestRate}%
                            </p>
                            <p>
                              Deadline:{" "}
                              {new Date(
                                support.repaymentTerms.repaymentDeadline
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              Support Date:{" "}
                              {new Date(support.supportDate).toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
