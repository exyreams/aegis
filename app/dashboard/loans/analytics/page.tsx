"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Progress } from "@/components/ui/Progress";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Calendar,
  Shield,
  Database,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LoanAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("12m");
  const [reportType, setReportType] = useState("portfolio");

  // Mock analytics data - in real app, this would come from database
  const portfolioMetrics = {
    totalLoans: 156,
    totalValue: 12500000000,
    avgLoanSize: 80128205,
    avgInterestRate: 4.85,
    avgTerm: 54,
    riskDistribution: {
      AAA: 12,
      AA: 28,
      A: 45,
      BBB: 38,
      BB: 22,
      B: 8,
      CCC: 3,
    },
    facilityTypes: {
      "Revolving Credit": 45,
      "Term Loan": 38,
      "Project Finance": 28,
      "Syndicated Loan": 25,
      "Bridge Loan": 12,
      "Bilateral Loan": 8,
    },
    covenantCompliance: {
      compliant: 142,
      warning: 11,
      breach: 3,
    },
    geographicDistribution: {
      "North America": 68,
      Europe: 52,
      "Asia Pacific": 24,
      "Latin America": 8,
      "Middle East": 4,
    },
  };

  const marketBenchmarks = {
    avgMargin: 285, // basis points
    avgArrangementFee: 1.2, // percentage
    avgLeverage: 3.8,
    avgCoverage: 4.2,
    esgLinkedPercentage: 32,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  const generateReport = () => {
    toast.info("Generating comprehensive loan analytics report...");
    // In real app, this would generate and download a report
  };

  const refreshData = () => {
    toast.info("Refreshing loan data from all connected systems...");
    // In real app, this would sync data from various loan systems
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="flex items-center justify-between px-4 lg:px-6">
                <div className="flex items-center gap-4">
                  <Link href="/dashboard/loans">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Loans
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Loan Analytics & Reporting
                    </h1>
                    <p className="text-muted-foreground">
                      Standardized reporting and analytics across loan
                      portfolios
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={refreshData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button onClick={generateReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>

              {/* Controls */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-4">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3m">Last 3 Months</SelectItem>
                      <SelectItem value="6m">Last 6 Months</SelectItem>
                      <SelectItem value="12m">Last 12 Months</SelectItem>
                      <SelectItem value="24m">Last 24 Months</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portfolio">
                        Portfolio Overview
                      </SelectItem>
                      <SelectItem value="risk">Risk Analysis</SelectItem>
                      <SelectItem value="compliance">
                        Compliance Report
                      </SelectItem>
                      <SelectItem value="market">Market Benchmarks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Total Loans
                        </span>
                      </div>
                      <p className="text-3xl font-bold">
                        {portfolioMetrics.totalLoans}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Across all systems
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Portfolio Value
                        </span>
                      </div>
                      <p className="text-3xl font-bold">
                        {formatCurrency(portfolioMetrics.totalValue)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total exposure
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Avg Interest Rate
                        </span>
                      </div>
                      <p className="text-3xl font-bold">
                        {portfolioMetrics.avgInterestRate}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Weighted average
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Compliance Rate
                        </span>
                      </div>
                      <p className="text-3xl font-bold">
                        {formatPercentage(
                          portfolioMetrics.covenantCompliance.compliant,
                          portfolioMetrics.totalLoans
                        )}
                        %
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Covenant compliance
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Analytics */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                    <TabsTrigger value="facilities">Facility Types</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Risk Rating Distribution</CardTitle>
                          <CardDescription>
                            Portfolio breakdown by credit rating
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {Object.entries(
                            portfolioMetrics.riskDistribution
                          ).map(([rating, count]) => (
                            <div key={rating} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{rating}</span>
                                <span className="text-sm text-muted-foreground">
                                  {count} loans (
                                  {formatPercentage(
                                    count,
                                    portfolioMetrics.totalLoans
                                  )}
                                  %)
                                </span>
                              </div>
                              <Progress
                                value={
                                  (count / portfolioMetrics.totalLoans) * 100
                                }
                                className="h-2"
                              />
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Geographic Distribution</CardTitle>
                          <CardDescription>
                            Loans by geographic region
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {Object.entries(
                            portfolioMetrics.geographicDistribution
                          ).map(([region, count]) => (
                            <div key={region} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{region}</span>
                                <span className="text-sm text-muted-foreground">
                                  {count} loans (
                                  {formatPercentage(
                                    count,
                                    portfolioMetrics.totalLoans
                                  )}
                                  %)
                                </span>
                              </div>
                              <Progress
                                value={
                                  (count / portfolioMetrics.totalLoans) * 100
                                }
                                className="h-2"
                              />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="risk" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border-green-200 bg-green-50/50">
                        <CardContent className="p-6 text-center">
                          <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-700">
                            {portfolioMetrics.covenantCompliance.compliant}
                          </p>
                          <p className="text-sm text-green-600">
                            Compliant Loans
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-yellow-200 bg-yellow-50/50">
                        <CardContent className="p-6 text-center">
                          <Info className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-yellow-700">
                            {portfolioMetrics.covenantCompliance.warning}
                          </p>
                          <p className="text-sm text-yellow-600">
                            Warning Status
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-red-200 bg-red-50/50">
                        <CardContent className="p-6 text-center">
                          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-red-700">
                            {portfolioMetrics.covenantCompliance.breach}
                          </p>
                          <p className="text-sm text-red-600">
                            Covenant Breaches
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="facilities" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Facility Type Breakdown</CardTitle>
                        <CardDescription>
                          Distribution of loan facility types
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {Object.entries(portfolioMetrics.facilityTypes).map(
                          ([type, count]) => (
                            <div key={type} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{type}</span>
                                <span className="text-sm text-muted-foreground">
                                  {count} loans (
                                  {formatPercentage(
                                    count,
                                    portfolioMetrics.totalLoans
                                  )}
                                  %)
                                </span>
                              </div>
                              <Progress
                                value={
                                  (count / portfolioMetrics.totalLoans) * 100
                                }
                                className="h-2"
                              />
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="compliance" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Compliance Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Financial Covenants</span>
                              <Badge className="bg-green-500 text-white">
                                98.1% Compliant
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Reporting Requirements</span>
                              <Badge className="bg-green-500 text-white">
                                96.8% On Time
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Documentation Updates</span>
                              <Badge className="bg-yellow-500 text-white">
                                89.2% Current
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>ESG Reporting</span>
                              <Badge className="bg-blue-500 text-white">
                                78.4% Complete
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Upcoming Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                            <Calendar className="h-4 w-4 text-yellow-600" />
                            <div>
                              <p className="font-medium text-sm">
                                Q1 Financial Reports
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Due in 15 days
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">
                                Covenant Testing
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Due in 8 days
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <Globe className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="font-medium text-sm">
                                ESG Metrics Update
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Due in 22 days
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="benchmarks" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Market Benchmarks</CardTitle>
                        <CardDescription>
                          Compare your portfolio against market standards
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Market Avg Margin
                            </p>
                            <p className="text-2xl font-bold">
                              {marketBenchmarks.avgMargin} bps
                            </p>
                            <Badge variant="outline" className="mt-2">
                              Industry Standard
                            </Badge>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Avg Arrangement Fee
                            </p>
                            <p className="text-2xl font-bold">
                              {marketBenchmarks.avgArrangementFee}%
                            </p>
                            <Badge variant="outline" className="mt-2">
                              Market Rate
                            </Badge>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              ESG-Linked Loans
                            </p>
                            <p className="text-2xl font-bold">
                              {marketBenchmarks.esgLinkedPercentage}%
                            </p>
                            <Badge variant="outline" className="mt-2">
                              Growing Trend
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Data Standardization Info */}
              <div className="px-4 lg:px-6">
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Database className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Standardized Data Integration
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                          This analytics platform aggregates data from multiple
                          loan systems using standardized data formats
                          (LMA-EDGE-2024, LSTA-2024, APLMA-2024) to enable
                          cross-system reporting and analysis.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="text-blue-700 border-blue-300"
                          >
                            Bloomberg Integration
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-blue-700 border-blue-300"
                          >
                            Refinitiv Data
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-blue-700 border-blue-300"
                          >
                            S&P Analytics
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-blue-700 border-blue-300"
                          >
                            Moody&apos;s Metrics
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
