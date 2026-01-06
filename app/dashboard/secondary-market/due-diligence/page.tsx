"use client";

import Link from "next/link";
import { useMarketStore } from "@/components/secondary-market/data/store";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import {
  FileSearch,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileText,
  AlertTriangle,
  Search,
  Loader2,
  Filter,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Scale,
  Building2,
  MoreHorizontal,
  Eye,
  Download,
  RefreshCw,
  CircleDot,
  Zap,
  ListChecks,
  Info,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LoanListing } from "@/components/secondary-market/data/types";

// Mock enhanced data for demonstration
const mockVerificationItems = [
  { id: 1, name: "Credit Agreement", category: "Legal" },
  { id: 2, name: "Financial Statements", category: "Financial" },
  { id: 3, name: "Security Documents", category: "Legal" },
  { id: 4, name: "Compliance Certificates", category: "Regulatory" },
  { id: 5, name: "Borrower KYC", category: "Regulatory" },
  { id: 6, name: "Intercreditor Agreement", category: "Legal" },
];

const riskCategories = [
  { name: "Legal Risk", key: "legal", color: "bg-violet-500" },
  { name: "Credit Risk", key: "credit", color: "bg-blue-500" },
  { name: "Compliance Risk", key: "compliance", color: "bg-amber-500" },
  { name: "Documentation Risk", key: "documentation", color: "bg-rose-500" },
] as const;

interface EnhancedLoan extends LoanListing {
  verifiedItems: number;
  totalItems: number;
  lastActivity: Date;
  riskBreakdown: {
    legal: number;
    credit: number;
    compliance: number;
    documentation: number;
  };
  estimatedValue: number;
  priority: "high" | "medium" | "low";
}

export default function DueDiligenceDashboard() {
  const router = useRouter();
  const listings = useMarketStore((state) => state.listings);
  const [isNewAuditOpen, setIsNewAuditOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Enhanced data with mock verification progress
  // Note: For a real app, these values would come from an API
  const enhancedListings = useMemo<EnhancedLoan[]>(() => {
    // Fixed baseline for mock dates to keep render pure
    const baseDate = new Date("2026-01-01").getTime();

    return listings.map((loan) => {
      // Simple pseudo-random seed from ID string
      const seed = loan.id
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const getPseudoRandom = (offset: number) =>
        (Math.sin(seed + offset) + 1) / 2;

      return {
        ...loan,
        verifiedItems: Math.floor(getPseudoRandom(1) * 6) + 1,
        totalItems: 6,
        lastActivity: new Date(
          baseDate - Math.floor(getPseudoRandom(2) * 7 * 24 * 60 * 60 * 1000)
        ),
        riskBreakdown: {
          legal: Math.floor(getPseudoRandom(3) * 30) + 70,
          credit: Math.floor(getPseudoRandom(4) * 30) + 70,
          compliance: Math.floor(getPseudoRandom(5) * 30) + 70,
          documentation: Math.floor(getPseudoRandom(6) * 30) + 70,
        },
        estimatedValue:
          (loan.loanAmount || 0) * (0.85 + getPseudoRandom(7) * 0.15),
        priority:
          getPseudoRandom(8) > 0.7
            ? "high"
            : getPseudoRandom(8) > 0.4
            ? "medium"
            : "low",
      };
    });
  }, [listings]);

  // Filter logic
  const filteredListings = useMemo(() => {
    let filtered = enhancedListings;

    if (activeTab === "verified") {
      filtered = filtered.filter((l) => l.dueDiligenceScore >= 80);
    } else if (activeTab === "reviewing") {
      filtered = filtered.filter(
        (l) => l.dueDiligenceScore >= 50 && l.dueDiligenceScore < 80
      );
    } else if (activeTab === "flagged") {
      filtered = filtered.filter((l) => l.dueDiligenceScore < 50);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (l) =>
          l.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.industry.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [enhancedListings, activeTab, searchQuery]);

  // Stats
  const stats = useMemo(
    () => ({
      total: listings.length,
      verified: listings.filter((l) => l.dueDiligenceScore >= 80).length,
      reviewing: listings.filter(
        (l) => l.dueDiligenceScore >= 50 && l.dueDiligenceScore < 80
      ).length,
      flagged: listings.filter((l) => l.dueDiligenceScore < 50).length,
      avgScore:
        listings.length > 0
          ? Math.round(
              listings.reduce((sum, l) => sum + l.dueDiligenceScore, 0) /
                listings.length
            )
          : 0,
      totalValue: enhancedListings.reduce(
        (sum, l) => sum + l.estimatedValue,
        0
      ),
    }),
    [listings, enhancedListings]
  );

  const handleStartAudit = () => {
    if (!selectedLoanId) return;
    setIsStarting(true);
    setTimeout(() => {
      router.push(
        `/dashboard/secondary-market/due-diligence/${selectedLoanId}`
      );
    }, 1500);
  };

  const getStatusConfig = (score: number) => {
    if (score >= 80)
      return {
        label: "Verified",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/50",
        border: "border-emerald-200 dark:border-emerald-800",
        icon: ShieldCheck,
        badge:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
      };
    if (score >= 50)
      return {
        label: "In Review",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/50",
        border: "border-amber-200 dark:border-amber-800",
        icon: Clock,
        badge:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      };
    return {
      label: "Flagged",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/50",
      border: "border-red-200 dark:border-red-800",
      icon: ShieldAlert,
      badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    };
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${(value / 1e3).toFixed(0)}K`;
  };

  const formatTimeAgo = (date: Date) => {
    // Use a fixed "now" reference to keep the function pure during a single render
    const baseDate = new Date("2026-01-01").getTime();
    const hours = Math.floor((baseDate - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
      <SidebarInset className="bg-zinc-50/50 dark:bg-zinc-950/50">
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          {/* Hero Header */}
          <div className="border-b bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-zinc-950 dark:to-blue-950/20">
            <div className="max-w-[1600px] mx-auto w-full px-6 md:px-8 py-8">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Title Section */}
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Scale className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-primary">
                      LMA Standard Framework
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Due Diligence Center
                  </h1>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    Automated compliance verification for secondary loan trades.
                    Review legal documentation, assess credit risks, and ensure
                    regulatory adherence before transaction settlement.
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Reports
                  </Button>

                  <Dialog
                    open={isNewAuditOpen}
                    onOpenChange={setIsNewAuditOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2 shadow-md">
                        <Sparkles className="h-4 w-4" />
                        New Audit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2.5 rounded-xl bg-primary/10">
                            <FileSearch className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <DialogTitle>Initiate Due Diligence</DialogTitle>
                            <DialogDescription className="mt-0.5">
                              Begin automated verification process
                            </DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>

                      <div className="py-4 space-y-5">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Select Loan Asset
                          </Label>
                          <Select
                            onValueChange={setSelectedLoanId}
                            value={selectedLoanId}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Choose a loan to audit..." />
                            </SelectTrigger>
                            <SelectContent>
                              {listings.map((loan) => (
                                <SelectItem key={loan.id} value={loan.id}>
                                  <div className="flex items-center gap-3">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                      {loan.borrower}
                                    </span>
                                    <span className="text-muted-foreground">
                                      •
                                    </span>
                                    <span className="text-muted-foreground text-sm">
                                      {loan.industry}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Verification Framework
                          </Label>
                          <Select defaultValue="lma" disabled>
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lma">
                                LMA Standard - Comprehensive
                              </SelectItem>
                              <SelectItem value="lsta">
                                LSTA Framework
                              </SelectItem>
                              <SelectItem value="custom">
                                Custom Checklist
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Verification Preview */}
                        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <ListChecks className="h-4 w-4 text-primary" />
                            Automated Checks Include:
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {mockVerificationItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                              >
                                <CircleDot className="h-3 w-3" />
                                {item.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <DialogFooter className="gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setIsNewAuditOpen(false)}
                          disabled={isStarting}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleStartAudit}
                          disabled={!selectedLoanId || isStarting}
                          className="min-w-[140px] gap-2"
                        >
                          {isStarting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Initializing...
                            </>
                          ) : (
                            <>
                              Start Analysis
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-[1600px] mx-auto w-full px-6 md:px-8 py-8 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Pipeline Value */}
              <Card className="col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-400 text-sm font-medium">
                      Pipeline Value
                    </span>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalValue)}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">Under review</p>
                </CardContent>
              </Card>

              {/* Average Score */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-muted-foreground text-sm font-medium">
                      Avg. Score
                    </span>
                    <div
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        stats.avgScore >= 70
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {stats.avgScore >= 70 ? "Healthy" : "Review"}
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold">{stats.avgScore}</p>
                    <span className="text-muted-foreground text-sm mb-1">
                      /100
                    </span>
                  </div>
                  <Progress value={stats.avgScore} className="h-1.5 mt-2" />
                </CardContent>
              </Card>

              {/* Verified */}
              <Card className="border-emerald-200/50 dark:border-emerald-800/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-muted-foreground text-sm font-medium">
                      Verified
                    </span>
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {stats.verified}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Ready for trade
                  </p>
                </CardContent>
              </Card>

              {/* In Review */}
              <Card className="border-amber-200/50 dark:border-amber-800/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-muted-foreground text-sm font-medium">
                      In Review
                    </span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {stats.reviewing}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Pending verification
                  </p>
                </CardContent>
              </Card>

              {/* Flagged */}
              <Card className="border-red-200/50 dark:border-red-800/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-muted-foreground text-sm font-medium">
                      Flagged
                    </span>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.flagged}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Requires attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Table Section */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/30 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Tabs */}
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full lg:w-auto"
                  >
                    <TabsList className="bg-background border h-10">
                      <TabsTrigger value="all" className="gap-2 px-4">
                        All
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          {stats.total}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="verified" className="gap-2 px-4">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        Verified
                      </TabsTrigger>
                      <TabsTrigger value="reviewing" className="gap-2 px-4">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        Reviewing
                      </TabsTrigger>
                      <TabsTrigger value="flagged" className="gap-2 px-4">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        Flagged
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Search & Filter */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by borrower or industry..."
                        className="pl-9 w-[280px] h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-4">Asset / Borrower</div>
                  <div className="col-span-2">Verification Progress</div>
                  <div className="col-span-2 text-center">Risk Score</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y">
                  {filteredListings.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <FileSearch className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">
                        No audits found
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  ) : (
                    filteredListings.map((loan) => {
                      const status = getStatusConfig(loan.dueDiligenceScore);
                      const StatusIcon = status.icon;
                      const verificationPercent =
                        (loan.verifiedItems / loan.totalItems) * 100;

                      return (
                        <Link
                          href={`/dashboard/secondary-market/due-diligence/${loan.id}`}
                          key={loan.id}
                          className="block"
                        >
                          <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-muted/30 transition-colors group">
                            {/* Asset Info */}
                            <div className="col-span-4">
                              <div className="flex items-center gap-4">
                                <div
                                  className={cn(
                                    "p-2.5 rounded-xl shrink-0 transition-colors",
                                    status.bg,
                                    status.border,
                                    "border"
                                  )}
                                >
                                  <StatusIcon
                                    className={cn("h-5 w-5", status.color)}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                                      {loan.borrower}
                                    </h4>
                                    {loan.priority === "high" && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            High Priority
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] font-medium"
                                    >
                                      {loan.industry}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatCurrency(loan.estimatedValue)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Verification Progress */}
                            <div className="col-span-2">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {loan.verifiedItems}/{loan.totalItems} items
                                  </span>
                                  <span className="font-medium">
                                    {Math.round(verificationPercent)}%
                                  </span>
                                </div>
                                <Progress
                                  value={verificationPercent}
                                  className={cn(
                                    "h-1.5",
                                    verificationPercent === 100 &&
                                      "[&>div]:bg-emerald-500"
                                  )}
                                />
                              </div>
                            </div>

                            {/* Risk Score */}
                            <div className="col-span-2">
                              <div className="flex flex-col items-center">
                                <div
                                  className={cn(
                                    "text-2xl font-bold font-mono",
                                    loan.dueDiligenceScore >= 80
                                      ? "text-emerald-600"
                                      : loan.dueDiligenceScore >= 50
                                      ? "text-amber-600"
                                      : "text-red-600"
                                  )}
                                >
                                  {loan.dueDiligenceScore}
                                </div>
                                <div className="flex gap-0.5 mt-1">
                                  {riskCategories.map((cat) => (
                                    <TooltipProvider key={cat.key}>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div
                                            className={cn(
                                              "w-6 h-1.5 rounded-full opacity-80",
                                              cat.color,
                                              loan.riskBreakdown[
                                                cat.key as keyof typeof loan.riskBreakdown
                                              ] < 70 && "opacity-40"
                                            )}
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {cat.name}:{" "}
                                          {
                                            loan.riskBreakdown[
                                              cat.key as keyof typeof loan.riskBreakdown
                                            ]
                                          }
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-2">
                              <div className="space-y-1.5">
                                <Badge
                                  className={cn("font-medium", status.badge)}
                                >
                                  {status.label}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  Updated {formatTimeAgo(loan.lastActivity)}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-2 flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                View Report
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Download Report
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Re-run Analysis
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    View Listing
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bottom Section - Risk Categories Summary */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Risk Categories Breakdown */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Verification Categories
                  </CardTitle>
                  <CardDescription>
                    Automated checks performed across all audit categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      {
                        name: "Legal Documentation",
                        items: [
                          "Credit Agreement",
                          "Security Docs",
                          "Intercreditor",
                        ],
                        score: 87,
                        icon: Scale,
                        color: "violet",
                      },
                      {
                        name: "Financial Analysis",
                        items: ["Audited Statements", "Projections", "Ratios"],
                        score: 92,
                        icon: TrendingUp,
                        color: "blue",
                      },
                      {
                        name: "Regulatory Compliance",
                        items: ["KYC/AML", "Sanctions", "Licenses"],
                        score: 78,
                        icon: ShieldCheck,
                        color: "emerald",
                      },
                      {
                        name: "Documentation Quality",
                        items: ["Completeness", "Accuracy", "Currency"],
                        score: 84,
                        icon: FileText,
                        color: "amber",
                      },
                    ].map((category) => (
                      <div
                        key={category.name}
                        className={cn(
                          "p-4 rounded-xl border",
                          `bg-${category.color}-50/50 border-${category.color}-200/50`,
                          `dark:bg-${category.color}-950/20 dark:border-${category.color}-800/50`
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <category.icon
                              className={cn(
                                "h-4 w-4",
                                `text-${category.color}-600`
                              )}
                            />
                            <span className="font-medium text-sm">
                              {category.name}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "text-lg font-bold",
                              category.score >= 80
                                ? "text-emerald-600"
                                : "text-amber-600"
                            )}
                          >
                            {category.score}%
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {category.items.map((item) => (
                            <Badge
                              key={item}
                              variant="secondary"
                              className="text-[10px] bg-white/70 dark:bg-black/30"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips / Info Panel */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Compliance Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      {
                        title: "LMA Standard Requirements",
                        description:
                          "All trades must meet LMA documentation standards before settlement.",
                      },
                      {
                        title: "Review Timeline",
                        description:
                          "Standard due diligence reviews complete within 2-3 business days.",
                      },
                      {
                        title: "Flagged Items",
                        description:
                          "Red flags require manual review and additional documentation.",
                      },
                    ].map((tip, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-background/80 border"
                      >
                        <p className="font-medium text-sm">{tip.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tip.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <ExternalLink className="h-4 w-4" />
                    View LMA Guidelines
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
