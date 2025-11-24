"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Clock, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { RefreshCw } from "@/components/icons";
import { useLoans, useLoanStats } from "@/hooks/useLoans";

export default function LoansPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHoveringRefresh, setIsHoveringRefresh] = useState(false);

  const {
    data: loans,
    loading: loansLoading,
    error: loansError,
    refetch: refetchLoans,
  } = useLoans();
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useLoanStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRepaymentProgress = (repaid: number, total: number) => {
    return Math.round((repaid / total) * 100);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchLoans(), refetchStats()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
              <p className="text-muted-foreground">
                Track and manage your active loan agreements
              </p>
            </div>
            <motion.div
              onHoverStart={() => setIsHoveringRefresh(true)}
              onHoverEnd={() => setIsHoveringRefresh(false)}
            >
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing || loansLoading || statsLoading}
              >
                <RefreshCw
                  size={16}
                  className="mr-2"
                  isSpinning={isRefreshing || loansLoading || statsLoading}
                  forceHover={
                    isHoveringRefresh &&
                    !isRefreshing &&
                    !loansLoading &&
                    !statsLoading
                  }
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </motion.div>
          </div>

          {(loansError || statsError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load loan data: {loansError || statsError}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Loans
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats.activeLoans}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Borrowed
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : formatCurrency(stats.totalBorrowed)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all loans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Interest
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading
                    ? "..."
                    : `${stats.averageInterestRate.toFixed(1)}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  Weighted average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats.loansDueSoon}
                </div>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              {loansLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading loans...
                </div>
              ) : loans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active loans found. Complete some RFQs to see loan data
                  here.
                </div>
              ) : (
                <div className="space-y-6">
                  {loans.map((loan) => (
                    <div
                      key={loan.contractId}
                      className="space-y-3 p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{loan.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Lender: {loan.lender} • Rate:{" "}
                            {loan.interestRate.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(loan.loanAmount)}
                          </div>
                          <Badge
                            variant={
                              loan.status === "active" ? "default" : "secondary"
                            }
                          >
                            {loan.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Repayment Progress</span>
                          <span>
                            {formatCurrency(loan.repaidAmount)} /{" "}
                            {formatCurrency(loan.loanAmount)}
                          </span>
                        </div>
                        <Progress
                          value={getRepaymentProgress(
                            loan.repaidAmount,
                            loan.loanAmount
                          )}
                          className="h-2"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Started: {formatDate(loan.startDate)}</span>
                        <span>Due: {formatDate(loan.dueDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Collateral: {formatCurrency(loan.collateralAmount)}{" "}
                          {loan.collateralAsset}
                        </span>
                        <span className="text-muted-foreground">
                          Monthly: {formatCurrency(loan.monthlyPayment)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
