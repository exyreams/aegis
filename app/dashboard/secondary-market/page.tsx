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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { useAuth } from "@/hooks/useAuth";
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
  Eye,
  Building,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import loansData from "@/components/secondary-market/data/loans.json";

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
  status: string;
  riskLevel: string;
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

export default function SecondaryMarketPage() {
  const { auth } = useAuth();
  const user = auth.user;
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLoan, setSelectedLoan] = useState<LoanListing | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Load loan listings from JSON data
  const loanListings: LoanListing[] = loansData;

  // Mock market statistics
  const marketStats: MarketStats = {
    totalVolume: 1847000000000,
    activeListings: loanListings.length,
    avgDueDiligenceTime: 2.3,
    avgTransactionCost: 12500,
    completedTrades: 156,
    avgYield: 9.45,
  };

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

  // Helper functions for loan marketplace
  const getRiskConfig = (risk: string) => {
    switch (risk) {
      case "low":
        return {
          bg: "bg-emerald-500",
          lightBg: "bg-emerald-50 dark:bg-emerald-950/50",
          text: "text-emerald-700 dark:text-emerald-400",
          border: "border-emerald-200 dark:border-emerald-800",
          badge:
            "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
        };
      case "medium":
        return {
          bg: "bg-amber-500",
          lightBg: "bg-amber-50 dark:bg-amber-950/50",
          text: "text-amber-700 dark:text-amber-400",
          border: "border-amber-200 dark:border-amber-800",
          badge:
            "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
        };
      case "high":
        return {
          bg: "bg-rose-500",
          lightBg: "bg-rose-50 dark:bg-rose-950/50",
          text: "text-rose-700 dark:text-rose-400",
          border: "border-rose-200 dark:border-rose-800",
          badge:
            "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300",
        };
      default:
        return {
          bg: "bg-muted-foreground",
          lightBg: "bg-muted",
          text: "text-muted-foreground",
          border: "border",
          badge: "bg-muted text-muted-foreground",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
            Under Review
          </span>
        );
      case "sold":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            Sold
          </span>
        );
      case "withdrawn":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            {status}
          </span>
        );
    }
  };

  const getRatingStyle = (rating: string) => {
    if (rating.startsWith("A")) return "text-emerald-700 dark:text-emerald-400";
    if (rating.startsWith("B")) return "text-amber-700 dark:text-amber-400";
    return "text-rose-700 dark:text-rose-400";
  };

  const getScoreStyle = (score: number) => {
    if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 75) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDaysToMaturity = (maturityDate: string) => {
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const onViewDetails = (id: string) => {
    console.log("View details:", id);
  };

  const onStartDueDiligence = (id: string) => {
    console.log("Start DD:", id);
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
                <Card className="overflow-hidden gap-0 pt-0">
                  <CardHeader className="bg-muted/50 border-b pt-6">
                    <div className="space-y-6">
                      {/* Consolidated Header Section */}
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">
                              Loan Positions
                            </CardTitle>
                          </div>
                          <CardDescription>
                            {filteredListings.length} of {loanListings.length}{" "}
                            available for trading
                          </CardDescription>
                        </div>

                        <Badge
                          variant="outline"
                          className="px-3 py-1.5 text-sm font-medium w-fit"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-2 animate-pulse" />
                          {filteredListings.length} Live
                        </Badge>
                      </div>

                      {/* Unified Search & Filters */}
                      <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="Search by borrower, lender, or industry..."
                            value={searchQuery}
                            onChange={(e) =>
                              handleFilterChange("search", e.target.value)
                            }
                            className="pl-12 h-12 text-base rounded-xl border-2 focus:border-primary transition-all"
                          />
                        </div>

                        {/* Filters & Quick Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <Select
                              value={industryFilter}
                              onValueChange={(value) =>
                                handleFilterChange("industry", value)
                              }
                            >
                              <SelectTrigger className="w-auto min-w-40 h-10 rounded-lg">
                                <SelectValue placeholder="All Industries" />
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
                                <SelectItem value="industrial services">
                                  Industrial Services
                                </SelectItem>
                                <SelectItem value="renewable energy">
                                  Renewable Energy
                                </SelectItem>
                                <SelectItem value="transportation & logistics">
                                  Transportation
                                </SelectItem>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="construction">
                                  Construction
                                </SelectItem>
                                <SelectItem value="hospitality">
                                  Hospitality
                                </SelectItem>
                                <SelectItem value="mining">Mining</SelectItem>
                                <SelectItem value="real estate">
                                  Real Estate
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <Select
                              value={riskFilter}
                              onValueChange={(value) =>
                                handleFilterChange("risk", value)
                              }
                            >
                              <SelectTrigger className="w-auto min-w-32 h-10 rounded-lg">
                                <SelectValue placeholder="Risk Level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">
                                  All Risk Levels
                                </SelectItem>
                                <SelectItem value="low">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Low Risk
                                  </div>
                                </SelectItem>
                                <SelectItem value="medium">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    Medium Risk
                                  </div>
                                </SelectItem>
                                <SelectItem value="high">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    High Risk
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Clear Filters */}
                            {(searchQuery ||
                              industryFilter !== "all" ||
                              riskFilter !== "all") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSearchQuery("");
                                  setIndustryFilter("all");
                                  setRiskFilter("all");
                                  setCurrentPage(1);
                                }}
                                className="h-10 px-4 rounded-lg"
                              >
                                Clear All
                              </Button>
                            )}
                          </div>

                          {/* Quick Filters */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground hidden sm:block">
                              Quick:
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFilterChange("risk", "low")}
                              className="h-8 px-3 text-xs rounded-full hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
                            >
                              Low Risk
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleFilterChange("industry", "healthcare")
                              }
                              className="h-8 px-3 text-xs rounded-full hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950"
                            >
                              Healthcare
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleFilterChange("industry", "technology")
                              }
                              className="h-8 px-3 text-xs rounded-full hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950"
                            >
                              Technology
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-0">
                    {/* Table Header */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 bg-muted/30 border-b border-border/50">
                      <div className="col-span-3">
                        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                          Borrower / Lender
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                          Outstanding
                        </span>
                      </div>
                      <div className="col-span-1.5 flex justify-center">
                        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                          Yield
                        </span>
                      </div>
                      <div className="col-span-1.5 flex justify-center">
                        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                          Maturity
                        </span>
                      </div>
                      <div className="col-span-1.5 flex justify-center">
                        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                          Rating
                        </span>
                      </div>
                      <div className="col-span-1.5 flex justify-center">
                        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                          DD Score
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                          Actions
                        </span>
                      </div>
                    </div>

                    {/* Loan List */}
                    <div className="px-4 py-2 space-y-2">
                      {paginatedListings.map((listing) => {
                        const riskConfig = getRiskConfig(listing.riskLevel);
                        const daysToMaturity = calculateDaysToMaturity(
                          listing.maturityDate
                        );
                        const discountPercentage =
                          ((listing.outstandingAmount - listing.askingPrice) /
                            listing.outstandingAmount) *
                          100;
                        const isExpanded = expandedId === listing.id;

                        return (
                          <div
                            key={listing.id}
                            className={`bg-card border rounded-xl overflow-hidden transition-all duration-200 ${
                              isExpanded
                                ? "shadow-lg dark:shadow-xl"
                                : "hover:shadow-sm dark:hover:shadow-lg"
                            }`}
                          >
                            {/* Main Row */}
                            <div
                              className="px-5 py-4 cursor-pointer"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : listing.id)
                              }
                            >
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                {/* Borrower Info */}
                                <div className="col-span-3 flex items-center gap-3">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-semibold truncate">
                                      {listing.borrower}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-xs text-muted-foreground truncate">
                                        {listing.originalLender}
                                      </span>
                                      <span className="text-muted-foreground/50">
                                        •
                                      </span>
                                      <span className="text-xs text-muted-foreground truncate">
                                        {listing.industry}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Desktop Metrics */}
                                <div className="hidden lg:grid lg:grid-cols-9 col-span-9 gap-4 items-center">
                                  <div className="col-span-2 text-center">
                                    <p className="text-sm font-semibold">
                                      {formatCurrency(
                                        listing.outstandingAmount
                                      )}
                                    </p>
                                  </div>
                                  <div className="col-span-1.5 text-center">
                                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                      {listing.yieldToMaturity.toFixed(2)}%
                                    </p>
                                  </div>
                                  <div className="col-span-1.5 text-center">
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(
                                        listing.maturityDate
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        year: "2-digit",
                                      })}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {daysToMaturity} days
                                    </p>
                                  </div>
                                  <div className="col-span-1.5 text-center">
                                    <p
                                      className={`text-sm font-semibold ${getRatingStyle(
                                        listing.creditRating
                                      )}`}
                                    >
                                      {listing.creditRating}
                                    </p>
                                  </div>
                                  <div className="col-span-1.5 flex items-center justify-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <p
                                        className={`text-sm font-semibold ${getScoreStyle(
                                          listing.dueDiligenceScore
                                        )}`}
                                      >
                                        {listing.dueDiligenceScore}
                                      </p>
                                      {listing.dueDiligenceScore >= 90 ? (
                                        <CheckCircle className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                                      ) : listing.dueDiligenceScore >= 75 ? (
                                        <AlertTriangle className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                                      ) : (
                                        <AlertTriangle className="h-3 w-3 text-rose-500 dark:text-rose-400" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="col-span-1 flex items-center justify-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 hover:bg-primary/10"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onViewDetails(listing.id);
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Mobile Metrics & Status */}
                                <div className="col-span-9 lg:col-span-0 flex items-center justify-between">
                                  <div className="lg:hidden grid grid-cols-3 gap-2">
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        Yield
                                      </p>
                                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                        {listing.yieldToMaturity.toFixed(2)}%
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        Rating
                                      </p>
                                      <p
                                        className={`text-sm font-semibold ${getRatingStyle(
                                          listing.creditRating
                                        )}`}
                                      >
                                        {listing.creditRating}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        Score
                                      </p>
                                      <div className="flex items-center gap-1">
                                        <p
                                          className={`text-sm font-semibold ${getScoreStyle(
                                            listing.dueDiligenceScore
                                          )}`}
                                        >
                                          {listing.dueDiligenceScore}
                                        </p>
                                        {listing.dueDiligenceScore >= 90 ? (
                                          <CheckCircle className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                                        ) : listing.dueDiligenceScore >= 75 ? (
                                          <AlertTriangle className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                                        ) : (
                                          <AlertTriangle className="h-3 w-3 text-rose-500 dark:text-rose-400" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {getStatusBadge(listing.status)}
                                    <ChevronRight
                                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                                        isExpanded ? "rotate-90" : ""
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Section */}
                            {isExpanded && (
                              <div className="border-t">
                                <div className="p-6">
                                  <div className="bg-card rounded-xl border p-6 shadow-sm">
                                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                                      {/* Main Details Section */}
                                      <div className="xl:col-span-3 space-y-6">
                                        {/* Investment Overview */}
                                        <div>
                                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Investment Overview
                                          </h4>
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="space-y-1">
                                              <p className="text-xs text-muted-foreground">
                                                Asking Price
                                              </p>
                                              <p className="text-lg font-bold">
                                                {formatCurrency(
                                                  listing.askingPrice
                                                )}
                                              </p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-xs text-muted-foreground">
                                                Discount
                                              </p>
                                              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                {discountPercentage.toFixed(1)}%
                                              </p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-xs text-muted-foreground">
                                                Current Rate
                                              </p>
                                              <p className="text-lg font-bold">
                                                {listing.interestRate}%
                                              </p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-xs text-muted-foreground">
                                                Expected Return
                                              </p>
                                              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                {listing.yieldToMaturity.toFixed(
                                                  2
                                                )}
                                                %
                                              </p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Loan Details */}
                                        <div>
                                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            Loan Details
                                          </h4>
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="space-y-1">
                                              <p className="text-xs text-muted-foreground">
                                                Outstanding
                                              </p>
                                              <p className="text-sm font-semibold">
                                                {formatCurrency(
                                                  listing.outstandingAmount
                                                )}
                                              </p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-xs text-muted-foreground">
                                                Maturity Date
                                              </p>
                                              <p className="text-sm font-semibold">
                                                {new Date(
                                                  listing.maturityDate
                                                ).toLocaleDateString()}
                                              </p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-xs text-muted-foreground">
                                                Credit Rating
                                              </p>
                                              <p
                                                className={`text-sm font-semibold ${getRatingStyle(
                                                  listing.creditRating
                                                )}`}
                                              >
                                                {listing.creditRating}
                                              </p>
                                            </div>
                                            <div className="space-y-1">
                                              <p className="text-xs text-muted-foreground">
                                                Risk Level
                                              </p>
                                              <Badge
                                                className={`${riskConfig.lightBg} ${riskConfig.text} border-0 text-xs`}
                                              >
                                                {listing.riskLevel
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                  listing.riskLevel.slice(1)}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Actions Section */}
                                      <div className="xl:col-span-1">
                                        <div className="space-y-4">
                                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                            Available Actions
                                          </h4>
                                          <div className="space-y-3">
                                            <Dialog>
                                              <DialogTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  className="w-full justify-between h-11"
                                                  onClick={() =>
                                                    setSelectedLoan(listing)
                                                  }
                                                >
                                                  <span className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                  </span>
                                                  <ArrowRight className="h-4 w-4" />
                                                </Button>
                                              </DialogTrigger>
                                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                  <DialogTitle className="flex items-center gap-2 text-lg">
                                                    <Building className="h-5 w-5 text-muted-foreground" />
                                                    {selectedLoan?.borrower}
                                                  </DialogTitle>
                                                  <DialogDescription>
                                                    Complete loan position
                                                    details and due diligence
                                                    summary
                                                  </DialogDescription>
                                                </DialogHeader>
                                                {selectedLoan && (
                                                  <div className="mt-6 space-y-6">
                                                    {/* Investment Summary */}
                                                    <div className="bg-muted/50 rounded-xl p-6">
                                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div className="space-y-1">
                                                          <p className="text-xs text-muted-foreground">
                                                            Asking Price
                                                          </p>
                                                          <p className="text-lg font-bold">
                                                            {formatCurrency(
                                                              selectedLoan.askingPrice
                                                            )}
                                                          </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                          <p className="text-xs text-muted-foreground">
                                                            Discount
                                                          </p>
                                                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                            {(
                                                              ((selectedLoan.outstandingAmount -
                                                                selectedLoan.askingPrice) /
                                                                selectedLoan.outstandingAmount) *
                                                              100
                                                            ).toFixed(1)}
                                                            %
                                                          </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                          <p className="text-xs text-muted-foreground">
                                                            Current Rate
                                                          </p>
                                                          <p className="text-lg font-bold">
                                                            {
                                                              selectedLoan.interestRate
                                                            }
                                                            %
                                                          </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                          <p className="text-xs text-muted-foreground">
                                                            Expected Return
                                                          </p>
                                                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                            {selectedLoan.yieldToMaturity.toFixed(
                                                              2
                                                            )}
                                                            %
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </div>

                                                    {/* Key Details */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                      <div>
                                                        <h4 className="text-sm font-semibold mb-3">
                                                          Loan Information
                                                        </h4>
                                                        <div className="space-y-2">
                                                          {[
                                                            {
                                                              label:
                                                                "Outstanding",
                                                              value:
                                                                formatCurrency(
                                                                  selectedLoan.outstandingAmount
                                                                ),
                                                            },
                                                            {
                                                              label:
                                                                "Maturity Date",
                                                              value: new Date(
                                                                selectedLoan.maturityDate
                                                              ).toLocaleDateString(),
                                                            },
                                                            {
                                                              label:
                                                                "Original Lender",
                                                              value:
                                                                selectedLoan.originalLender,
                                                            },
                                                            {
                                                              label: "Industry",
                                                              value:
                                                                selectedLoan.industry,
                                                            },
                                                          ].map((item, idx) => (
                                                            <div
                                                              key={idx}
                                                              className="flex justify-between py-1"
                                                            >
                                                              <span className="text-sm text-muted-foreground">
                                                                {item.label}
                                                              </span>
                                                              <span className="text-sm font-medium">
                                                                {item.value}
                                                              </span>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>

                                                      <div>
                                                        <h4 className="text-sm font-semibold mb-3">
                                                          Risk Assessment
                                                        </h4>
                                                        <div className="space-y-2">
                                                          <div className="flex justify-between py-1">
                                                            <span className="text-sm text-muted-foreground">
                                                              Credit Rating
                                                            </span>
                                                            <span
                                                              className={`text-sm font-medium ${getRatingStyle(
                                                                selectedLoan.creditRating
                                                              )}`}
                                                            >
                                                              {
                                                                selectedLoan.creditRating
                                                              }
                                                            </span>
                                                          </div>
                                                          <div className="flex justify-between py-1">
                                                            <span className="text-sm text-muted-foreground">
                                                              DD Score
                                                            </span>
                                                            <span
                                                              className={`text-sm font-medium ${getScoreStyle(
                                                                selectedLoan.dueDiligenceScore
                                                              )}`}
                                                            >
                                                              {
                                                                selectedLoan.dueDiligenceScore
                                                              }
                                                              /100
                                                            </span>
                                                          </div>
                                                          <div className="flex justify-between py-1">
                                                            <span className="text-sm text-muted-foreground">
                                                              Status
                                                            </span>
                                                            <span>
                                                              {getStatusBadge(
                                                                selectedLoan.status
                                                              )}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-3 pt-4 border-t">
                                                      <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => {
                                                          onStartDueDiligence(
                                                            selectedLoan.id
                                                          );
                                                          toast.success(
                                                            "Due diligence report generated"
                                                          );
                                                        }}
                                                      >
                                                        <FileSearch className="h-4 w-4 mr-2" />
                                                        Due Diligence Report
                                                      </Button>
                                                      <Button
                                                        className="flex-1"
                                                        onClick={() => {
                                                          toast.success(
                                                            "Purchase interest submitted"
                                                          );
                                                        }}
                                                      >
                                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                                        Express Interest
                                                      </Button>
                                                    </div>
                                                  </div>
                                                )}
                                              </DialogContent>
                                            </Dialog>
                                            <Button
                                              variant="outline"
                                              className="w-full justify-between h-11"
                                              onClick={() => {
                                                onStartDueDiligence(listing.id);
                                                toast.success(
                                                  "Due diligence report generated"
                                                );
                                              }}
                                            >
                                              <span className="flex items-center gap-2">
                                                <FileSearch className="h-4 w-4" />
                                                Due Diligence
                                              </span>
                                              <ArrowRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              className="w-full justify-between h-11"
                                              onClick={() => {
                                                toast.success(
                                                  "Purchase interest submitted"
                                                );
                                              }}
                                            >
                                              <span className="flex items-center gap-2">
                                                <ShoppingCart className="h-4 w-4" />
                                                Express Interest
                                              </span>
                                              <ArrowRight className="h-4 w-4" />
                                            </Button>
                                          </div>

                                          {/* Investment Summary */}
                                          <div className="bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                              <span className="text-xs text-muted-foreground font-medium">
                                                Investment Required
                                              </span>
                                              <span className="text-xs text-muted-foreground font-medium">
                                                Expected Return
                                              </span>
                                            </div>
                                            <div className="flex items-end justify-between">
                                              <span className="text-xl font-bold">
                                                {formatCurrency(
                                                  listing.askingPrice
                                                )}
                                              </span>
                                              <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                                                {listing.yieldToMaturity.toFixed(
                                                  2
                                                )}
                                                %
                                              </span>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-primary/20 flex items-center justify-between text-xs text-muted-foreground">
                                              <span>
                                                {discountPercentage.toFixed(1)}%
                                                discount
                                              </span>
                                              <span>
                                                {daysToMaturity} days to
                                                maturity
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Empty State */}
                      {paginatedListings.length === 0 && (
                        <div className="text-center py-16 bg-card rounded-xl border">
                          <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                            <Building className="h-7 w-7 text-muted-foreground" />
                          </div>
                          <h4 className="text-base font-semibold mb-2">
                            No loan positions available
                          </h4>
                          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            There are currently no loan positions matching your
                            criteria. Please adjust your filters or check back
                            later.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Pagination */}
                    {filteredListings.length > itemsPerPage && (
                      <div className="flex items-center justify-between px-6 py-4 border-t bg-card">
                        <div className="text-sm text-muted-foreground">
                          Showing {startIndex + 1}-
                          {Math.min(endIndex, filteredListings.length)} of{" "}
                          {filteredListings.length}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-9 w-9 p-0 rounded-lg"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center gap-1">
                            {Array.from(
                              { length: Math.min(totalPages, 5) },
                              (_, i) => {
                                let page;
                                if (totalPages <= 5) {
                                  page = i + 1;
                                } else if (currentPage <= 3) {
                                  page = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  page = totalPages - 4 + i;
                                } else {
                                  page = currentPage - 2 + i;
                                }

                                return (
                                  <Button
                                    key={page}
                                    variant={
                                      currentPage === page
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className="h-9 w-9 p-0 rounded-lg"
                                  >
                                    {page}
                                  </Button>
                                );
                              }
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-9 w-9 p-0 rounded-lg"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
