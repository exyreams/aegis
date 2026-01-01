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
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { LoanMarketplace } from "@/components/secondary-market/LoanMarketplace";
import { DueDiligenceEngine } from "@/components/secondary-market/DueDiligenceEngine";
import { TradingDashboard } from "@/components/secondary-market/TradingDashboard";
import { MarketAnalytics } from "@/components/secondary-market/MarketAnalytics";
import {
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Search,
  Filter,
  BarChart3,
  ShoppingCart,
  Zap,
  FileSearch,
} from "lucide-react";

interface MarketStats {
  totalVolume: number;
  activeListings: number;
  avgDueDiligenceTime: number;
  avgTransactionCost: number;
  completedTrades: number;
  avgYield: number;
}

interface LoanListing {
  id: string;
  borrower: string;
  originalLender: string;
  loanAmount: number;
  outstandingAmount: number;
  interestRate: number;
  maturityDate: string;
  creditRating: string;
  industry: string;
  askingPrice: number;
  yieldToMaturity: number;
  dueDiligenceScore: number;
  listingDate: string;
  status: "active" | "under_review" | "sold" | "withdrawn";
  riskLevel: "low" | "medium" | "high";
}

export default function SecondaryMarketPage() {
  const { auth } = useAuth();
  const user = auth.user;

  const [activeTab, setActiveTab] = useState<
    "marketplace" | "due_diligence" | "trading" | "analytics"
  >("marketplace");
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Mock market statistics
  const marketStats: MarketStats = {
    totalVolume: 2400000000, // $2.4B
    activeListings: 156,
    avgDueDiligenceTime: 2.5, // days
    avgTransactionCost: 15000, // $15K
    completedTrades: 89,
    avgYield: 8.2, // %
  };

  // Mock loan listings
  const loanListings: LoanListing[] = [
    {
      id: "1",
      borrower: "TechCorp Industries",
      originalLender: "First National Bank",
      loanAmount: 50000000,
      outstandingAmount: 42000000,
      interestRate: 7.5,
      maturityDate: "2027-01-15",
      creditRating: "A-",
      industry: "Technology",
      askingPrice: 41500000,
      yieldToMaturity: 8.2,
      dueDiligenceScore: 92,
      listingDate: "2025-01-01",
      status: "active",
      riskLevel: "low",
    },
    {
      id: "2",
      borrower: "Green Energy Solutions",
      originalLender: "Sustainable Capital",
      loanAmount: 25000000,
      outstandingAmount: 23500000,
      interestRate: 6.8,
      maturityDate: "2026-06-30",
      creditRating: "BBB+",
      industry: "Energy",
      askingPrice: 23200000,
      yieldToMaturity: 7.8,
      dueDiligenceScore: 88,
      listingDate: "2024-12-28",
      status: "under_review",
      riskLevel: "medium",
    },
    {
      id: "3",
      borrower: "Manufacturing Corp",
      originalLender: "Industrial Bank",
      loanAmount: 15000000,
      outstandingAmount: 12800000,
      interestRate: 9.2,
      maturityDate: "2025-12-15",
      creditRating: "B+",
      industry: "Manufacturing",
      askingPrice: 12200000,
      yieldToMaturity: 11.5,
      dueDiligenceScore: 74,
      listingDate: "2025-01-02",
      status: "active",
      riskLevel: "high",
    },
  ];

  // Mock market trend data
  const marketTrends = [
    { month: "Jul", volume: 180, avgYield: 7.8 },
    { month: "Aug", volume: 220, avgYield: 8.1 },
    { month: "Sep", volume: 195, avgYield: 7.9 },
    { month: "Oct", volume: 240, avgYield: 8.3 },
    { month: "Nov", volume: 210, avgYield: 8.0 },
    { month: "Dec", volume: 280, avgYield: 8.2 },
  ];

  const industryDistribution = [
    { name: "Technology", value: 35, color: "#3b82f6" },
    { name: "Energy", value: 25, color: "#10b981" },
    { name: "Manufacturing", value: 20, color: "#f59e0b" },
    { name: "Healthcare", value: 12, color: "#ef4444" },
    { name: "Other", value: 8, color: "#8b5cf6" },
  ];

  const filteredListings = loanListings.filter((listing) => {
    if (
      searchQuery &&
      !listing.borrower.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (
      industryFilter !== "all" &&
      listing.industry.toLowerCase() !== industryFilter
    ) {
      return false;
    }
    if (riskFilter !== "all" && listing.riskLevel !== riskFilter) {
      return false;
    }
    return true;
  });

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
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Secondary Loan Market
                  </h1>
                  <p className="text-muted-foreground">
                    {user?.role === "lender"
                      ? "Trade loan positions with automated due diligence and transparent pricing"
                      : "Discover investment opportunities in the secondary loan market"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">
                    <FileSearch className="h-4 w-4 mr-2" />
                    Due Diligence
                  </Button>
                  <Button>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    List Loan
                  </Button>
                </div>
              </div>

              {/* Market Statistics */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Volume</CardDescription>
                      <CardTitle className="text-2xl font-bold">
                        ${(marketStats.totalVolume / 1000000000).toFixed(1)}B
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +12% this month
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Active Listings</CardDescription>
                      <CardTitle className="text-2xl font-bold">
                        {marketStats.activeListings}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Activity className="h-4 w-4 mr-1" />
                        Available now
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Avg DD Time</CardDescription>
                      <CardTitle className="text-2xl font-bold text-green-600">
                        {marketStats.avgDueDiligenceTime}d
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 mr-1" />
                        85% faster
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Avg Cost</CardDescription>
                      <CardTitle className="text-2xl font-bold text-green-600">
                        ${(marketStats.avgTransactionCost / 1000).toFixed(0)}K
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-1" />
                        90% reduction
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Completed Trades</CardDescription>
                      <CardTitle className="text-2xl font-bold">
                        {marketStats.completedTrades}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        This quarter
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Avg Yield</CardDescription>
                      <CardTitle className="text-2xl font-bold text-blue-600">
                        {marketStats.avgYield}%
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Market rate
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Content */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <CardTitle>Loan Trading Platform</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {filteredListings.length} listings
                          </Badge>
                        </div>
                      </div>

                      {/* Tab Navigation */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={
                            activeTab === "marketplace" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveTab("marketplace")}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Marketplace
                        </Button>
                        <Button
                          variant={
                            activeTab === "due_diligence"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveTab("due_diligence")}
                        >
                          <FileSearch className="h-4 w-4 mr-2" />
                          Due Diligence
                        </Button>
                        <Button
                          variant={
                            activeTab === "trading" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveTab("trading")}
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          Trading
                        </Button>
                        <Button
                          variant={
                            activeTab === "analytics" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveTab("analytics")}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>

                      {/* Search and Filters - Only show for marketplace */}
                      {activeTab === "marketplace" && (
                        <div className="flex flex-col lg:flex-row gap-3 w-full">
                          <div className="flex-1 min-w-0">
                            <div className="relative w-full">
                              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search by borrower, industry, or loan details..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                            <Select
                              value={industryFilter}
                              onValueChange={setIndustryFilter}
                            >
                              <SelectTrigger className="w-full lg:w-40">
                                <SelectValue placeholder="Industry" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Industries
                                </SelectItem>
                                <SelectItem value="technology">
                                  Technology
                                </SelectItem>
                                <SelectItem value="energy">Energy</SelectItem>
                                <SelectItem value="manufacturing">
                                  Manufacturing
                                </SelectItem>
                                <SelectItem value="healthcare">
                                  Healthcare
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <Select
                              value={riskFilter}
                              onValueChange={setRiskFilter}
                            >
                              <SelectTrigger className="w-full lg:w-32">
                                <SelectValue placeholder="Risk" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Risk</SelectItem>
                                <SelectItem value="low">Low Risk</SelectItem>
                                <SelectItem value="medium">
                                  Medium Risk
                                </SelectItem>
                                <SelectItem value="high">High Risk</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button variant="outline" size="sm">
                              <Filter className="h-4 w-4 mr-2" />
                              More Filters
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activeTab === "marketplace" && (
                      <LoanMarketplace
                        listings={filteredListings}
                        onViewDetails={(id) => console.log("View details:", id)}
                        onStartDueDiligence={(id) =>
                          console.log("Start DD:", id)
                        }
                      />
                    )}
                    {activeTab === "due_diligence" && <DueDiligenceEngine />}
                    {activeTab === "trading" && <TradingDashboard />}
                    {activeTab === "analytics" && (
                      <MarketAnalytics
                        trends={marketTrends}
                        industryData={industryDistribution}
                        stats={marketStats}
                      />
                    )}
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
