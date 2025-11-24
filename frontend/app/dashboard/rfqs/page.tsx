"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

import { CreateRFQModal, RFQList } from "@/components/rfq";
import {
  Plus,
  FileText,
  Clock,
  DollarSign,
  AlertCircle,
  Search,
  X,
  TrendingUp,
} from "lucide-react";
import { RefreshCw } from "@/components/icons";
import { useRFQs, useRFQStats } from "@/hooks/useRFQ";
import { useAuth } from "@/hooks/useAuth";

export default function RFQsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHoveringRefresh, setIsHoveringRefresh] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assetFilter, setAssetFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { auth } = useAuth();
  const {
    data: rfqs = [],
    loading: rfqsLoading,
    error: rfqsError,
    refetch: refetchRFQs,
  } = useRFQs();
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useRFQStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchRFQs(), refetchStats()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateSuccess = () => {
    handleRefresh();
  };

  // Filter and sort RFQs
  const filteredRFQs = rfqs
    .filter((rfq) => {
      const matchesSearch =
        rfq.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rfq.borrower?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rfq.collateralAsset?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || rfq.status === statusFilter;
      const matchesAsset =
        assetFilter === "all" || rfq.collateralAsset === assetFilter;

      return matchesSearch && matchesStatus && matchesAsset;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "amount-high":
          return b.loanAmount - a.loanAmount;
        case "amount-low":
          return a.loanAmount - b.loanAmount;
        case "expiring":
          return (a.daysRemaining || 0) - (b.daysRemaining || 0);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setAssetFilter("all");
    setSortBy("newest");
  };

  // Get unique asset types for filter
  const uniqueAssets = [
    ...new Set(rfqs.map((rfq) => rfq.collateralAsset)),
  ].filter(Boolean);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">RFQs</h1>
              <p className="text-muted-foreground">
                Manage your Request for Quote submissions and responses
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
                  disabled={isRefreshing || rfqsLoading || statsLoading}
                >
                  <RefreshCw
                    size={16}
                    className="mr-2"
                    isSpinning={isRefreshing || rfqsLoading || statsLoading}
                    forceHover={
                      isHoveringRefresh &&
                      !isRefreshing &&
                      !rfqsLoading &&
                      !statsLoading
                    }
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
              </motion.div>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create RFQ
              </Button>
            </div>
          </div>

          {(rfqsError || statsError) &&
            (rfqsError?.includes("DAML") ||
              statsError?.includes("DAML") ||
              rfqsError?.includes("connection") ||
              statsError?.includes("connection")) && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    <div>
                      <p className="font-medium">DAML Ledger Not Available</p>
                      <p className="text-sm text-amber-600 mt-1">
                        The DAML ledger is not running. Start it with{" "}
                        <code className="bg-amber-100 px-1 rounded">
                          daml start
                        </code>{" "}
                        to view RFQ data.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {(rfqsError || statsError) &&
            !(
              rfqsError?.includes("DAML") ||
              statsError?.includes("DAML") ||
              rfqsError?.includes("connection") ||
              statsError?.includes("connection")
            ) && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Error Loading RFQ Data</p>
                      <p className="text-sm text-red-600 mt-1">
                        {rfqsError || statsError}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Total RFQs</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {statsLoading ? "..." : statsError ? "0" : stats.total}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    All time
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  All time requests <FileText className="size-4" />
                </div>
                <div className="text-muted-foreground">Total RFQs created</div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Active RFQs</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {statsLoading ? "..." : statsError ? "0" : stats.active}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Awaiting responses <Clock className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Currently accepting bids
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Total Value</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {statsLoading
                    ? "..."
                    : statsError
                    ? "$0"
                    : formatCurrency(stats.totalValue)}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <DollarSign className="h-3 w-3 mr-1" />
                    USD
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Across all RFQs <DollarSign className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Combined loan volume
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Success Rate</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {statsLoading
                    ? "..."
                    : statsError
                    ? "0%"
                    : `${stats.successRate}%`}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Rate
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  RFQs with responses <TrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">Conversion rate</div>
              </CardFooter>
            </Card>
          </div>

          {/* Enhanced RFQ List with Filtering */}
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle>All RFQs</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {filteredRFQs.length} of {rfqs.length}
                    </Badge>
                  </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex flex-col lg:flex-row gap-3 w-full">
                  <div className="flex-1 min-w-0">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by title, borrower, or asset..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full lg:w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={assetFilter} onValueChange={setAssetFilter}>
                      <SelectTrigger className="w-full lg:w-32">
                        <SelectValue placeholder="Asset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assets</SelectItem>
                        {uniqueAssets.map((asset) => (
                          <SelectItem key={asset} value={asset}>
                            {asset}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full lg:w-36">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="amount-high">
                          Amount: High to Low
                        </SelectItem>
                        <SelectItem value="amount-low">
                          Amount: Low to High
                        </SelectItem>
                        <SelectItem value="expiring">Expiring Soon</SelectItem>
                      </SelectContent>
                    </Select>

                    {(searchQuery ||
                      statusFilter !== "all" ||
                      assetFilter !== "all" ||
                      sortBy !== "newest") && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filter Results Info */}
                {filteredRFQs.length !== rfqs.length && (
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredRFQs.length} of {rfqs.length} RFQs
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {rfqsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw
                      size={32}
                      className="animate-spin mx-auto mb-3 text-primary"
                    />
                    <p className="text-muted-foreground">Loading RFQs...</p>
                  </div>
                </div>
              ) : filteredRFQs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {rfqs.length === 0 ? "No RFQs Found" : "No Matching RFQs"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {rfqs.length === 0
                      ? "Create your first RFQ to get started with institutional lending."
                      : "Try adjusting your search or filter criteria."}
                  </p>
                  {rfqs.length === 0 && (
                    <Button onClick={() => setCreateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First RFQ
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <RFQList rfqs={filteredRFQs} currentUser={auth.user} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <CreateRFQModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSuccess={handleCreateSuccess}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
