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
  Activity,
  Search,
  ShoppingCart,
  Zap,
  FileSearch,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Clock,
  PieChart,
  Briefcase,
  Network,
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

interface TabButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
}

function TabButton({ active, icon, label, count, onClick }: TabButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`h-10 px-4 rounded-lg transition-all duration-200 ${
        active
          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <span
        className={`mr-2 ${
          active ? "text-primary-foreground/80" : "text-muted-foreground"
        }`}
      >
        {icon}
      </span>
      <span className="font-medium text-sm">{label}</span>
      {count !== undefined && (
        <span
          className={`ml-2 px-1.5 py-0.5 text-xs rounded-md ${
            active
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
    </Button>
  );
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock market statistics
  const marketStats: MarketStats = {
    totalVolume: 1847000000000, // Updated to reflect 15 loans
    activeListings: 234,
    avgDueDiligenceTime: 2.3,
    avgTransactionCost: 12500,
    completedTrades: 156,
    avgYield: 9.45,
  };

  // Mock trends data for analytics
  const mockTrends = [
    { month: "Jan", volume: 145, avgYield: 8.2 },
    { month: "Feb", volume: 167, avgYield: 8.4 },
    { month: "Mar", volume: 189, avgYield: 8.1 },
    { month: "Apr", volume: 203, avgYield: 8.6 },
    { month: "May", volume: 178, avgYield: 8.9 },
    { month: "Jun", volume: 234, avgYield: 8.7 },
    { month: "Jul", volume: 256, avgYield: 8.5 },
    { month: "Aug", volume: 289, avgYield: 8.8 },
    { month: "Sep", volume: 267, avgYield: 9.1 },
    { month: "Oct", volume: 298, avgYield: 8.9 },
    { month: "Nov", volume: 312, avgYield: 8.6 },
    { month: "Dec", volume: 334, avgYield: 8.7 },
  ];

  // Mock industry data for analytics
  const mockIndustryData = [
    { name: "Healthcare", value: 28, color: "var(--chart-1)" },
    { name: "Technology", value: 22, color: "var(--chart-2)" },
    { name: "Manufacturing", value: 18, color: "var(--chart-3)" },
    { name: "Energy", value: 15, color: "var(--chart-4)" },
    { name: "Real Estate", value: 12, color: "var(--chart-5)" },
    { name: "Other", value: 5, color: "#94a3b8" },
  ];

  // Mock loan listings - 15 total positions
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
    {
      id: "2",
      borrower: "Nordic Energy AS",
      originalLender: "DNB Bank ASA",
      loanAmount: 120000000,
      outstandingAmount: 115000000,
      interestRate: 7.5,
      maturityDate: "2031-03-01",
      creditRating: "BBB-",
      industry: "Renewable Energy",
      askingPrice: 116150000,
      yieldToMaturity: 7.35,
      dueDiligenceScore: 91,
      listingDate: "2024-12-28",
      status: "under_review",
      riskLevel: "low",
    },
    {
      id: "3",
      borrower: "Atlas Logistics Inc",
      originalLender: "Wells Fargo Bank NA",
      loanAmount: 200000000,
      outstandingAmount: 185000000,
      interestRate: 9.75,
      maturityDate: "2027-09-01",
      creditRating: "B+",
      industry: "Transportation & Logistics",
      askingPrice: 175750000,
      yieldToMaturity: 12.8,
      dueDiligenceScore: 72,
      listingDate: "2025-01-03",
      status: "active",
      riskLevel: "high",
    },
    {
      id: "4",
      borrower: "Pinnacle Healthcare Group",
      originalLender: "JPMorgan Chase Bank NA",
      loanAmount: 150000000,
      outstandingAmount: 142500000,
      interestRate: 7.85,
      maturityDate: "2029-12-15",
      creditRating: "BB",
      industry: "Healthcare",
      askingPrice: 141075000,
      yieldToMaturity: 8.15,
      dueDiligenceScore: 88,
      listingDate: "2025-01-01",
      status: "active",
      riskLevel: "medium",
    },
    {
      id: "5",
      borrower: "Continental Manufacturing GmbH",
      originalLender: "Deutsche Bank AG",
      loanAmount: 85000000,
      outstandingAmount: 78200000,
      interestRate: 8.5,
      maturityDate: "2026-08-30",
      creditRating: "BB-",
      industry: "Manufacturing",
      askingPrice: 76636000,
      yieldToMaturity: 9.25,
      dueDiligenceScore: 82,
      listingDate: "2024-12-20",
      status: "active",
      riskLevel: "medium",
    },
    {
      id: "6",
      borrower: "TechVentures Software Ltd",
      originalLender: "Silicon Valley Bank",
      loanAmount: 45000000,
      outstandingAmount: 43500000,
      interestRate: 10.25,
      maturityDate: "2027-04-15",
      creditRating: "B",
      industry: "Technology",
      askingPrice: 41325000,
      yieldToMaturity: 13.2,
      dueDiligenceScore: 68,
      listingDate: "2025-01-02",
      status: "active",
      riskLevel: "high",
    },
    {
      id: "7",
      borrower: "Global Retail Partners",
      originalLender: "Bank of America NA",
      loanAmount: 95000000,
      outstandingAmount: 89000000,
      interestRate: 7.75,
      maturityDate: "2030-11-20",
      creditRating: "BBB",
      industry: "Retail",
      askingPrice: 87110000,
      yieldToMaturity: 8.45,
      dueDiligenceScore: 89,
      listingDate: "2024-12-15",
      status: "active",
      riskLevel: "low",
    },
    {
      id: "8",
      borrower: "Apex Construction Corp",
      originalLender: "Citibank NA",
      loanAmount: 180000000,
      outstandingAmount: 172000000,
      interestRate: 9.25,
      maturityDate: "2026-07-10",
      creditRating: "B+",
      industry: "Construction",
      askingPrice: 165440000,
      yieldToMaturity: 11.8,
      dueDiligenceScore: 75,
      listingDate: "2025-01-01",
      status: "active",
      riskLevel: "high",
    },
    {
      id: "9",
      borrower: "Quantum Pharmaceuticals",
      originalLender: "HSBC Bank USA",
      loanAmount: 65000000,
      outstandingAmount: 61500000,
      interestRate: 8.0,
      maturityDate: "2029-05-25",
      creditRating: "BB+",
      industry: "Healthcare",
      askingPrice: 60270000,
      yieldToMaturity: 8.75,
      dueDiligenceScore: 92,
      listingDate: "2024-12-30",
      status: "active",
      riskLevel: "low",
    },
    {
      id: "10",
      borrower: "Sterling Hospitality Group",
      originalLender: "PNC Bank NA",
      loanAmount: 110000000,
      outstandingAmount: 105000000,
      interestRate: 8.75,
      maturityDate: "2028-03-18",
      creditRating: "BB-",
      industry: "Hospitality",
      askingPrice: 100800000,
      yieldToMaturity: 9.65,
      dueDiligenceScore: 79,
      listingDate: "2024-12-25",
      status: "active",
      riskLevel: "medium",
    },
    {
      id: "11",
      borrower: "Frontier Mining Ltd",
      originalLender: "Royal Bank of Canada",
      loanAmount: 250000000,
      outstandingAmount: 235000000,
      interestRate: 10.5,
      maturityDate: "2027-12-01",
      creditRating: "B",
      industry: "Mining",
      askingPrice: 220750000,
      yieldToMaturity: 14.2,
      dueDiligenceScore: 65,
      listingDate: "2025-01-03",
      status: "under_review",
      riskLevel: "high",
    },
    {
      id: "12",
      borrower: "Pacific Telecom Solutions",
      originalLender: "TD Bank NA",
      loanAmount: 80000000,
      outstandingAmount: 76000000,
      interestRate: 7.25,
      maturityDate: "2030-09-15",
      creditRating: "BBB-",
      industry: "Technology",
      askingPrice: 74480000,
      yieldToMaturity: 7.95,
      dueDiligenceScore: 87,
      listingDate: "2024-12-18",
      status: "active",
      riskLevel: "low",
    },
    {
      id: "13",
      borrower: "Metro Transportation Inc",
      originalLender: "US Bank NA",
      loanAmount: 135000000,
      outstandingAmount: 128000000,
      interestRate: 8.95,
      maturityDate: "2026-10-30",
      creditRating: "BB",
      industry: "Transportation & Logistics",
      askingPrice: 121600000,
      yieldToMaturity: 10.85,
      dueDiligenceScore: 81,
      listingDate: "2024-12-22",
      status: "active",
      riskLevel: "medium",
    },
    {
      id: "14",
      borrower: "Renewable Power Corp",
      originalLender: "Credit Suisse",
      loanAmount: 190000000,
      outstandingAmount: 182000000,
      interestRate: 6.75,
      maturityDate: "2032-04-12",
      creditRating: "A-",
      industry: "Renewable Energy",
      askingPrice: 180180000,
      yieldToMaturity: 7.15,
      dueDiligenceScore: 96,
      listingDate: "2024-12-10",
      status: "active",
      riskLevel: "low",
    },
    {
      id: "15",
      borrower: "Urban Development Partners",
      originalLender: "Morgan Stanley",
      loanAmount: 220000000,
      outstandingAmount: 208000000,
      interestRate: 9.5,
      maturityDate: "2027-08-20",
      creditRating: "B-",
      industry: "Real Estate",
      askingPrice: 197520000,
      yieldToMaturity: 12.4,
      dueDiligenceScore: 70,
      listingDate: "2025-01-02",
      status: "sold",
      riskLevel: "high",
    },
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

  // Pagination logic
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  // Reset to first page when filters change
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
              {/* HERO SECTION - Unchanged (Chef's Kiss) */}
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
                              Marketplace
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
                            onClick={() => {}}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Browse Opportunities
                          </Button>
                          <Button
                            size="default"
                            variant="outline"
                            className="h-10 px-6 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white rounded-xl font-medium backdrop-blur-md transition-all"
                            onClick={() => setActiveTab("due_diligence")}
                          >
                            <FileSearch className="h-4 w-4 mr-2" />
                            Due Diligence
                          </Button>
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

              {/* MARKET STATISTICS - Clean and Professional */}
              <div className="px-4 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Volume"
                    value={`$${(marketStats.totalVolume / 1000000000).toFixed(
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

              {/* MAIN CONTENT SECTION - Clean Card Design */}
              <div className="px-4 md:px-8">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b pb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <Network className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <CardTitle className="text-xl">
                            Trading Floor
                          </CardTitle>
                        </div>
                        <CardDescription>
                          Browse, analyze, and execute secondary loan trades
                          with automated settlement.
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

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-1 p-1 bg-card border rounded-xl shadow-sm mt-6 w-fit">
                      <TabButton
                        active={activeTab === "marketplace"}
                        icon={<ShoppingCart className="h-4 w-4" />}
                        label="Marketplace"
                        count={filteredListings.length}
                        onClick={() => setActiveTab("marketplace")}
                      />
                      <TabButton
                        active={activeTab === "due_diligence"}
                        icon={<FileSearch className="h-4 w-4" />}
                        label="Due Diligence"
                        onClick={() => setActiveTab("due_diligence")}
                      />
                      <TabButton
                        active={activeTab === "trading"}
                        icon={<Activity className="h-4 w-4" />}
                        label="Trading"
                        onClick={() => setActiveTab("trading")}
                      />
                      <TabButton
                        active={activeTab === "analytics"}
                        icon={<PieChart className="h-4 w-4" />}
                        label="Analytics"
                        onClick={() => setActiveTab("analytics")}
                      />
                    </div>

                    {/* Search & Filters */}
                    {activeTab === "marketplace" && (
                      <div className="flex items-center gap-3 mt-4">
                        {/* Search bar takes most space */}
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

                        {/* Filters on the right */}
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
                    )}
                  </CardHeader>

                  <CardContent className="p-0 bg-muted/30">
                    {activeTab === "marketplace" && (
                      <div className="space-y-4">
                        <LoanMarketplace
                          listings={paginatedListings}
                          onViewDetails={(id) =>
                            console.log("View details:", id)
                          }
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
                                      currentPage === page
                                        ? "default"
                                        : "outline"
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
                    )}
                    {activeTab === "due_diligence" && <DueDiligenceEngine />}
                    {activeTab === "trading" && <TradingDashboard />}
                    {activeTab === "analytics" && (
                      <MarketAnalytics
                        trends={mockTrends}
                        industryData={mockIndustryData}
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
