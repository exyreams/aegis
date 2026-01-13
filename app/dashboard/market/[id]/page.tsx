"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Share2,
  ShieldCheck,
  TrendingUp,
  Clock,
  PieChart,
  FileText,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useMarketStore } from "@/components/secondary-market/data/store";
import { TradeExecutionModal } from "@/components/secondary-market/trade/TradeExecutionModal";

// --- Types ---
// LoanListing type imported via store (inferred) or explicitly from types if needed

export default function LoanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const listings = useMarketStore((state) => state.listings);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const loanId = params.id as string;

  const loan = useMemo(() => {
     return listings.find((l) => l.id === loanId) || null;
  }, [listings, loanId]);

  const loading = false; // Store is sync/persisted for this demo

  // --- Formatters ---
  const formatCurrency = (amount: number, compact = false) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (val: number) => `${val.toFixed(2)}%`;

  const calculateDaysToMaturity = (maturityDate: string) => {
    const diffTime = new Date(maturityDate).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // --- UI Helpers ---
  const getRatingColor = (rating: string) => {
    if (rating.startsWith("A"))
      return "text-emerald-600 bg-emerald-100 border-emerald-200";
    if (rating.startsWith("B"))
      return "text-amber-600 bg-amber-100 border-amber-200";
    return "text-rose-600 bg-rose-100 border-rose-200";
  };

  if (loading)
    return <div className="p-10 flex justify-center">Loading...</div>;
  if (!loan)
    return <div className="p-10 flex justify-center">Loan not found</div>;

  const daysToMaturity = calculateDaysToMaturity(loan.maturityDate);
  const discountAmount = loan.outstandingAmount - loan.askingPrice;
  const discountPct = (discountAmount / loan.outstandingAmount) * 100;
  const potentialReturn = loan.outstandingAmount - loan.askingPrice;

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
      <SidebarInset className="bg-white dark:bg-neutral-950">
        <SiteHeader />

        <div className="flex flex-col min-h-screen">
          {/* Breadcrumb / Top Nav */}
          <div className="px-6 py-4 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <button
                  onClick={() => router.back()}
                  className="hover:text-foreground transition-colors flex items-center text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Market
                </button>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                <span className="text-foreground font-medium">
                  {loan.borrower}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="h-4 w-4 mr-2" />
                  Teaser
                </Button>
              </div>
            </div>
          </div>

          {/* Header Section - Similar to main page but for detail view */}
          <div className="px-6 py-8 border-b">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {loan.industry}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {loan.status === "active" ? "Live Listing" : loan.status}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {loan.borrower}
                  </h1>
                  <p className="text-muted-foreground">
                    Senior Secured Loan • Listed by {loan.originalLender}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">
                    Credit Rating
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      getRatingColor(loan.creditRating).split(" ")[0]
                    }`}
                  >
                    {loan.creditRating}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* --- LEFT COLUMN: Main Report (8 Cols) --- */}
              <div className="lg:col-span-8 space-y-10">
                {/* Key Metrics Grid (The "Hero" stats) */}
                <div className="grid grid-cols-3 gap-6 p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      Yield to Maturity <TrendingUp className="h-3.5 w-3.5" />
                    </p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPercent(loan.yieldToMaturity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      vs {loan.interestRate}% coupon
                    </p>
                  </div>
                  <div className="space-y-1 border-l border-neutral-200 dark:border-neutral-700 pl-6">
                    <p className="text-sm font-medium text-muted-foreground">
                      Discount to Par
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                      {discountPct.toFixed(2)}%
                    </p>
                    <p className="text-xs text-emerald-600">
                      +{formatCurrency(potentialReturn, true)} upside
                    </p>
                  </div>
                  <div className="space-y-1 border-l border-neutral-200 dark:border-neutral-700 pl-6">
                    <p className="text-sm font-medium text-muted-foreground">
                      Maturity
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                      {daysToMaturity}{" "}
                      <span className="text-lg font-normal text-muted-foreground">
                        days
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(loan.maturityDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* 3. Executive Summary / Highlights */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-neutral-500" />
                    Investment Highlights
                  </h3>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 list-none pl-0">
                      {[
                        "Senior secured position in capital structure",
                        `Attractive ${discountPct.toFixed(
                          1
                        )}% discount creating capital appreciation`,
                        `Strong DD Score of ${loan.dueDiligenceScore}/100 based on recent audit`,
                        `Industry leader in ${loan.industry} sector`,
                        "Established cash flows ensuring debt service coverage",
                        `Originated by ${loan.originalLender}, a tier-1 institution`,
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 pl-0">
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Separator />

                {/* 4. Detailed Term Sheet (Table Style) */}
                <div>
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-neutral-500" />
                    Term Sheet & Financials
                  </h3>

                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-neutral-50 dark:bg-neutral-900 text-muted-foreground font-medium border-b">
                        <tr>
                          <th className="px-6 py-3">Metric</th>
                          <th className="px-6 py-3">Value</th>
                          <th className="px-6 py-3 hidden sm:table-cell">
                            Context
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr className="bg-white dark:bg-neutral-950">
                          <td className="px-6 py-4 font-medium">
                            Original Principal
                          </td>
                          <td className="px-6 py-4">
                            {formatCurrency(loan.loanAmount)}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                            Originated 2023
                          </td>
                        </tr>
                        <tr className="bg-white dark:bg-neutral-950">
                          <td className="px-6 py-4 font-medium">
                            Outstanding Balance
                          </td>
                          <td className="px-6 py-4">
                            {formatCurrency(loan.outstandingAmount)}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                            Current Face Value
                          </td>
                        </tr>
                        <tr className="bg-white dark:bg-neutral-950">
                          <td className="px-6 py-4 font-medium">
                            Asking Price
                          </td>
                          <td className="px-6 py-4">
                            {formatCurrency(loan.askingPrice)}
                          </td>
                          <td className="px-6 py-4 text-emerald-600 hidden sm:table-cell">
                            {(
                              (loan.askingPrice / loan.outstandingAmount) *
                              100
                            ).toFixed(2)}
                            % of Par
                          </td>
                        </tr>
                        <tr className="bg-white dark:bg-neutral-950">
                          <td className="px-6 py-4 font-medium">Coupon Rate</td>
                          <td className="px-6 py-4">{loan.interestRate}%</td>
                          <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                            Paid Quarterly
                          </td>
                        </tr>
                        <tr className="bg-white dark:bg-neutral-950">
                          <td className="px-6 py-4 font-medium">
                            Risk Adjustment
                          </td>
                          <td className="px-6 py-4 capitalize">
                            {loan.riskLevel}
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                DD Score:
                              </span>
                              <span
                                className={
                                  loan.dueDiligenceScore > 80
                                    ? "text-emerald-600"
                                    : "text-amber-600"
                                }
                              >
                                {loan.dueDiligenceScore}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5. Analysis Section - Now using actual loan data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                      <PieChart className="h-4 w-4" /> Security & Collateral
                    </h4>
                    {loan.security ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Security Type</span>
                          <span className="font-medium">{loan.security.type}</span>
                        </div>
                        <Separator />
                        <div className="text-sm">
                          <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Collateral</span>
                          <span className="text-neutral-700 dark:text-neutral-300">{loan.security.collateral}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Guarantors</span>
                          <span className="font-medium">{loan.security.guarantors?.join(", ") || "N/A"}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Security details not available</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> Risk Factors
                    </h4>
                    {loan.riskFactors && loan.riskFactors.length > 0 ? (
                      <div className="space-y-2">
                        {loan.riskFactors.map((risk, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span className="text-muted-foreground">{risk}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific risk factors identified</p>
                    )}
                  </div>
                </div>

                {/* Pricing Details */}
                {loan.pricing && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-neutral-500" />
                        Pricing Structure
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Base Rate</p>
                          <p className="font-semibold mt-1">{loan.pricing.baseRate}</p>
                        </div>
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Spread</p>
                          <p className="font-semibold mt-1">{loan.pricing.spread}</p>
                        </div>
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">All-In Rate</p>
                          <p className="font-semibold mt-1">{loan.pricing.allInRate}</p>
                        </div>
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Payment</p>
                          <p className="font-semibold mt-1">{loan.pricing.paymentFrequency}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Financial Covenants */}
                {loan.financialCovenants && loan.financialCovenants.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-neutral-500" />
                        Financial Covenants
                      </h3>
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-neutral-50 dark:bg-neutral-900 text-muted-foreground font-medium border-b">
                            <tr>
                              <th className="px-4 py-2 text-left">Covenant</th>
                              <th className="px-4 py-2 text-center">Current</th>
                              <th className="px-4 py-2 text-center">Threshold</th>
                              <th className="px-4 py-2 text-center">Headroom</th>
                              <th className="px-4 py-2 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {loan.financialCovenants.map((cov, i) => (
                              <tr key={i} className="bg-white dark:bg-neutral-950">
                                <td className="px-4 py-2 font-medium">{cov.covenant}</td>
                                <td className="px-4 py-2 text-center font-mono">{cov.current}</td>
                                <td className="px-4 py-2 text-center font-mono text-muted-foreground">{cov.threshold}</td>
                                <td className="px-4 py-2 text-center">{cov.headroom}</td>
                                <td className="px-4 py-2 text-center">
                                  <Badge variant="outline" className={`text-xs ${
                                    cov.status === "PASS" ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                                    cov.status === "WARNING" ? "text-amber-600 bg-amber-50 border-amber-200" :
                                    "text-red-600 bg-red-50 border-red-200"
                                  }`}>
                                    {cov.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* --- RIGHT COLUMN: Sticky Action Panel (4 Cols) --- */}
              <div className="lg:col-span-4 space-y-6">
                {/* Order Ticket Card */}
                <div className="rounded-xl border bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
                  <div className="p-6 bg-neutral-50 dark:bg-neutral-900/50 border-b">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Buy Now Price
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">
                        {formatCurrency(loan.askingPrice)}
                      </span>
                      <span className="text-sm text-emerald-600 font-medium">
                        (-{discountPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Est. Annual Return
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            loan.outstandingAmount *
                              (loan.yieldToMaturity / 100)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Yield</span>
                        <span className="font-medium text-emerald-600">
                          {loan.yieldToMaturity.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Settlement
                        </span>
                        <span className="font-medium">T+2 Days</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Button 
                        className="w-full h-11 text-base font-medium shadow-md bg-emerald-600 hover:bg-emerald-500 text-white border-none"
                        onClick={() => setIsTradeModalOpen(true)}
                      >
                        Trade / Bid
                      </Button>
                      <Button variant="outline" className="w-full">
                        Add to Watchlist
                      </Button>
                    </div>

                    <div className="text-xs text-center text-muted-foreground px-4">
                      <p>
                        By submitting, you agree to the Secondary Market Trading
                        Rules and Settlement Procedures.
                      </p>
                    </div>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 border-t text-xs text-center">
                    <span className="text-muted-foreground flex items-center justify-center gap-2">
                      <Clock className="h-3 w-3" /> Market closes in 4h 30m
                    </span>
                  </div>
                </div>

                {/* Seller Info (Simplified) */}
                <div className="rounded-xl border p-6 bg-white dark:bg-neutral-900">
                  <h4 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                    Originator
                  </h4>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                      {loan.originalLender.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {loan.originalLender}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Institutional Lender
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full border border-dashed"
                  >
                    View Lender Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {loan && (
            <TradeExecutionModal 
                open={isTradeModalOpen} 
                onOpenChange={setIsTradeModalOpen} 
                listing={loan} 
            />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
