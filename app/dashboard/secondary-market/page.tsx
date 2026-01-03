"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
  TrendingUp,
  Search,
  ShoppingCart,
  Zap,
  FileSearch,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Clock,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MarketStats {
  totalVolume: number;
  activeListings: number;
  avgDueDiligenceTime: number;
  avgTransactionCost: number;
  completedTrades: number;
  avgYield: number;
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor?: string;
}

function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  iconColor = "text-blue-600",
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md dark:hover:shadow-xl transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-2">
              {trend && (
                <div
                  className={`flex items-center text-xs font-semibold ${
                    trend.isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {trend.isPositive ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {trend.value}
                </div>
              )}
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <div
            className={`p-2.5 rounded-lg bg-muted group-hover:scale-110 transition-transform duration-300 ${iconColor}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock market statistics
  const marketStats: MarketStats = {
    totalVolume: 1847000000000,
    activeListings: 234,
    avgDueDiligenceTime: 2.3,
    avgTransactionCost: 12500,
    completedTrades: 156,
    avgYield: 9.45,
  };

  // Mock loan listings
  const loanListings: LoanListing[] = [
    {
      id: "1",
      borrower: "Meridian Holdings PLC",
      originalLender: "Barclays Bank PLC",
      loanAmount: 75000000,
      outstandingAmount: 68500000,
      interestRate: 8.25,
      maturityDate: "2028-06-15",
      creditRating: "BB+",
      industry: "Industrial Services",
      askingPrice: 67825000,
      yieldToMaturity: 8.65,
      dueDiligenceScore: 94,
      listingDate: "2025-01-02",
      status: "active",
      riskLevel: "low",
    },
    // Add more listings as needed...
  ];

  const filteredListings = loanListings.filter((listing) => {
    if (
      searchQuery &&
      !listing.borrower.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !listing.originalLender
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !listing.industry.toLowerCase().includes(searchQuery.toLowerCase())
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

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    if (filterType === "search") {
      setSearchQuery(value);
    } else if (filterType === "industry") {
      setIndustryFilter(value);
    } else if (filterType === "risk") {
      setRiskFilter(value);
    }
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
            <div className="flex flex-col gap-8 py-6 md:gap-10 md:py-8">
              {/* HERO SECTION */}
              <div className="px-4 md:px-8">
                <div className="relative overflow-hidden rounded-4xl bg-slate-950 text-white shadow-2xl">
                  {/* Abstract Background Elements */}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
                  <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl bg-indigo-500/10 rounded-full blur-[80px]" />

                  <div className="relative z-10 p-6 md:p-8 lg:p-12">
                    <div className="grid lg:grid-cols-12 gap-8 items-center">
                      {/* Hero Content */}
                      <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs text-blue-200">
                          <Building2 className="h-3 w-3" />
                          <span>LMA / LSTA Compliant Infrastructure</span>
                        </div>

                        <div className="space-y-3">
                          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
                            Secondary Loan <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-white to-emerald-400">
                              Market
                            </span>
                          </h1>
                          <p className="text-base text-slate-300 max-w-xl leading-relaxed">
                            {user?.role === "lender"
                              ? "Trade loan positions with institutional-grade automation. Access the $1.8T market with transparent pricing and AI-driven due diligence."
                              : "Discover institutional-quality investment opportunities powered by real-time analytics and automated compliance checks."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-1">
                          <Button
                            size="default"
                            className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Browse Opportunities
                          </Button>
                          <Link href="/dashboard/secondary-market/due-diligence">
                            <Button
                              size="default"
                              variant="outline"
                              className="h-10 px-6 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white rounded-xl font-medium backdrop-blur-md transition-all"
                            >
                              <FileSearch className="h-4 w-4 mr-2" />
                              Due Diligence
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Hero Visual / Quick Stats */}
                      <div className="lg:col-span-5 relative">
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                          <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            LIVE MARKET
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-white">
                              Market Pulse
                            </h3>
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-xs text-slate-400">
                                  Total Volume
                                </p>
                                <p className="text-2xl font-bold text-white mt-0.5">
                                  $1.8T
                                </p>
                              </div>
                              <Badge className="mb-3 bg-emerald-500/20 text-emerald-300 border-0 hover:bg-emerald-500/30 text-xs">
                                +12.5% MoM
                              </Badge>
                            </div>

                            {/* Simulated Chart Line */}
                            <div className="h-16 flex items-end gap-1 mt-4 px-2">
                              {[
                                65, 72, 68, 85, 78, 92, 98, 105, 115, 108, 125,
                                132,
                              ].map((h, i) => (
                                <div
                                  key={i}
                                  className="flex-1 bg-linear-to-t from-blue-600 to-blue-400 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 mt-3">
                              <div>
                                <p className="text-xs text-slate-400">
                                  Active Listings
                                </p>
                                <p className="text-lg font-semibold text-white">
                                  234
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400">
                                  Avg. Yield
                                </p>
                                <p className="text-lg font-semibold text-white">
                                  9.45%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-8 -left-8 bg-white text-slate-900 rounded-xl p-3 shadow-xl flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-slate-700" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">
                              Time Saved
                            </p>
                            <p className="text-xs font-bold">
                              85% Faster Analysis
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MARKET STATISTICS */}
              <div className="px-4 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Volume"
                    value={`${(marketStats.totalVolume / 1000000000).toFixed(
                      0
                    )}B`}
                    description="LSTA registered"
                    icon={<Globe className="h-5 w-5" />}
                    trend={{ value: "+12% MoM", isPositive: true }}
                    iconColor="text-blue-600"
                  />
                  <StatCard
                    title="Active Listings"
                    value={marketStats.activeListings.toString()}
                    description="Real-time count"
                    icon={<Briefcase className="h-5 w-5" />}
                    iconColor="text-emerald-600"
                  />
                  <StatCard
                    title="Due Diligence"
                    value={`${marketStats.avgDueDiligenceTime}d`}
                    description="vs 2-3 weeks manual"
                    icon={<Zap className="h-5 w-5" />}
                    trend={{ value: "85% faster", isPositive: true }}
                    iconColor="text-amber-600"
                  />
                  <StatCard
                    title="Avg. Yield"
                    value={`${marketStats.avgYield}%`}
                    description="Weighted average"
                    icon={<TrendingUp className="h-5 w-5" />}
                    iconColor="text-purple-600"
                  />
                </div>
              </div>

              {/* MARKETPLACE CONTENT */}
              <div className="px-4 md:px-8">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b pb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <ShoppingCart className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <CardTitle className="text-xl">
                            Live Marketplace
                          </CardTitle>
                        </div>
                        <CardDescription>
                          Browse and discover secondary loan opportunities with
                          automated settlement.
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="px-3 py-1.5 text-sm font-medium"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-2 animate-pulse" />
                          {filteredListings.length} Live Opportunities
                        </Badge>
                      </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex items-center gap-3 mt-4">
                      <div className="relative group flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          placeholder="Search borrower, lender, industry..."
                          value={searchQuery}
                          onChange={(e) =>
                            handleFilterChange("search", e.target.value)
                          }
                          className="pl-10 h-11 rounded-lg transition-all text-sm"
                        />
                      </div>

                      <Select
                        value={industryFilter}
                        onValueChange={(value) =>
                          handleFilterChange("industry", value)
                        }
                      >
                        <SelectTrigger className="w-auto min-w-32 h-11 rounded-lg text-sm">
                          <SelectValue placeholder="Industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Industries</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="energy">Energy</SelectItem>
                          <SelectItem value="manufacturing">
                            Manufacturing
                          </SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={riskFilter}
                        onValueChange={(value) =>
                          handleFilterChange("risk", value)
                        }
                      >
                        <SelectTrigger className="w-auto min-w-24 h-11 rounded-lg text-sm">
                          <SelectValue placeholder="Risk" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Risk</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 bg-muted/30">
                    <div className="space-y-4">
                      <LoanMarketplace
                        listings={paginatedListings}
                        onViewDetails={(id) => console.log("View details:", id)}
                        onStartDueDiligence={(id) =>
                          console.log("Start DD:", id)
                        }
                      />

                      {/* Pagination */}
                      {filteredListings.length > itemsPerPage && (
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-card">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              Showing {startIndex + 1} to{" "}
                              {Math.min(endIndex, filteredListings.length)} of{" "}
                              {filteredListings.length} results
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-1">
                              {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                              ).map((page) => (
                                <Button
                                  key={page}
                                  variant={
                                    currentPage === page ? "default" : "outline"
                                  }
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className="h-8 w-8 p-0"
                                >
                                  {page}
                                </Button>
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
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
