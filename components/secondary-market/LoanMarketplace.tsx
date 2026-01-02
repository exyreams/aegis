"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Eye,
  FileSearch,
  ShoppingCart,
  Calendar,
  Building,
  TrendingUp,
  TrendingDown,
  Filter,
  AlertTriangle,
  CheckCircle,
  Percent,
  DollarSign,
  Clock,
  ChevronRight,
  Target,
  BarChart3,
  Wallet,
  ArrowRight,
  Briefcase,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

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

interface LoanMarketplaceProps {
  listings: LoanListing[];
  onViewDetails: (id: string) => void;
  onStartDueDiligence: (id: string) => void;
}

type SortOption = "yield" | "amount" | "rating" | "score";

export function LoanMarketplace({
  listings,
  onViewDetails,
  onStartDueDiligence,
}: LoanMarketplaceProps) {
  const [selectedLoan, setSelectedLoan] = useState<LoanListing | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("yield");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedListings = [...listings].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "yield":
        comparison = b.yieldToMaturity - a.yieldToMaturity;
        break;
      case "amount":
        comparison = b.outstandingAmount - a.outstandingAmount;
        break;
      case "rating":
        comparison = a.creditRating.localeCompare(b.creditRating);
        break;
      case "score":
        comparison = b.dueDiligenceScore - a.dueDiligenceScore;
        break;
    }
    return sortOrder === "desc" ? comparison : -comparison;
  });

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(option);
      setSortOrder("desc");
    }
  };

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

  const getPercentage = (part: number, total: number) => {
    return ((part / total) * 100).toFixed(1);
  };

  return (
    <div className="px-4 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Loan Positions</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {sortedListings.length} of {listings.length} opportunities available
            for secondary market trading
          </p>
        </div>
      </div>

      {/* Quick Filters & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/30 rounded-xl">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            <Target className="h-3 w-3 mr-1" />
            High Yield (
            {sortedListings.filter((l) => l.yieldToMaturity > 9).length})
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            High DD Score (
            {sortedListings.filter((l) => l.dueDiligenceScore >= 90).length})
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Maturing Soon (
            {
              sortedListings.filter(
                (l) => calculateDaysToMaturity(l.maturityDate) < 365
              ).length
            }
            )
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>Avg Yield:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {(
                sortedListings.reduce((sum, l) => sum + l.yieldToMaturity, 0) /
                sortedListings.length
              ).toFixed(1)}
              %
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Total Value:</span>
            <span className="font-semibold">
              {formatCurrency(
                sortedListings.reduce((sum, l) => sum + l.outstandingAmount, 0)
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Table Header with Sorting */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-3 bg-muted/50 rounded-t-xl border">
        <div className="col-span-3">
          <button
            onClick={() => handleSort("rating")}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            Borrower / Lender
            {sortBy === "rating" && (
              <span className="text-primary">
                {sortOrder === "desc" ? "↓" : "↑"}
              </span>
            )}
          </button>
        </div>
        <div className="col-span-2 flex justify-center">
          <button
            onClick={() => handleSort("amount")}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            Outstanding
            {sortBy === "amount" && (
              <span className="text-primary">
                {sortOrder === "desc" ? "↓" : "↑"}
              </span>
            )}
          </button>
        </div>
        <div className="col-span-1.5 flex justify-center">
          <button
            onClick={() => handleSort("yield")}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            Yield
            {sortBy === "yield" && (
              <span className="text-primary">
                {sortOrder === "desc" ? "↓" : "↑"}
              </span>
            )}
          </button>
        </div>
        <div className="col-span-1.5 flex justify-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Maturity
          </span>
        </div>
        <div className="col-span-1.5 flex justify-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Rating
          </span>
        </div>
        <div className="col-span-1.5 flex justify-center">
          <button
            onClick={() => handleSort("score")}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            DD Score
            {sortBy === "score" && (
              <span className="text-primary">
                {sortOrder === "desc" ? "↓" : "↑"}
              </span>
            )}
          </button>
        </div>
        <div className="col-span-1 flex justify-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Actions
          </span>
        </div>
      </div>
      {/* Loan List */}
      <div className="space-y-2">
        {sortedListings.map((listing) => {
          const riskConfig = getRiskConfig(listing.riskLevel);
          const daysToMaturity = calculateDaysToMaturity(listing.maturityDate);
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
                onClick={() => setExpandedId(isExpanded ? null : listing.id)}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Borrower Info */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={`w-1 h-10 rounded-full ${riskConfig.bg}`} />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold truncate">
                        {listing.borrower}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground truncate">
                          {listing.originalLender}
                        </span>
                        <span className="text-muted-foreground/50">•</span>
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
                        {formatCurrency(listing.outstandingAmount)}
                      </p>
                    </div>
                    <div className="col-span-1.5 text-center">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {listing.yieldToMaturity.toFixed(2)}%
                      </p>
                    </div>
                    <div className="col-span-1.5 text-center">
                      <p className="text-xs text-muted-foreground">
                        {new Date(listing.maturityDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            year: "2-digit",
                          }
                        )}
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
                        <p className="text-xs text-muted-foreground">Yield</p>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {listing.yieldToMaturity.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                        <p
                          className={`text-sm font-semibold ${getRatingStyle(
                            listing.creditRating
                          )}`}
                        >
                          {listing.creditRating}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Score</p>
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
              {/* Expanded Section - Unified Card */}
              {isExpanded && (
                <div className="border-t">
                  <div className="p-6">
                    {/* Single Unified Card */}
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
                                  {formatCurrency(listing.askingPrice)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {getPercentage(
                                    listing.askingPrice,
                                    listing.outstandingAmount
                                  )}
                                  % of outstanding
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Discount
                                </p>
                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                  {discountPercentage.toFixed(1)}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(
                                    listing.outstandingAmount -
                                      listing.askingPrice
                                  )}{" "}
                                  savings
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Current Rate
                                </p>
                                <p className="text-lg font-bold">
                                  {listing.interestRate}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  +
                                  {(
                                    listing.yieldToMaturity -
                                    listing.interestRate
                                  ).toFixed(1)}
                                  % spread
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Expected Return
                                </p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {listing.yieldToMaturity.toFixed(2)}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Yield to maturity
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
                                  Original Loan
                                </p>
                                <p className="text-sm font-semibold">
                                  {formatCurrency(listing.loanAmount)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {getPercentage(
                                    listing.outstandingAmount,
                                    listing.loanAmount
                                  )}
                                  % outstanding
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
                                <p className="text-xs text-muted-foreground">
                                  {daysToMaturity} days remaining
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
                                <p className="text-xs text-muted-foreground">
                                  External rating
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Risk Level
                                </p>
                                <Badge
                                  className={`${riskConfig.lightBg} ${riskConfig.text} border-0 text-xs`}
                                >
                                  {listing.riskLevel.charAt(0).toUpperCase() +
                                    listing.riskLevel.slice(1)}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  {listing.dueDiligenceScore >= 90
                                    ? "Low risk"
                                    : listing.dueDiligenceScore >= 75
                                    ? "Moderate"
                                    : "Higher risk"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Listing Information */}
                          <div>
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Listing Information
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Listed Date
                                </p>
                                <p className="text-sm font-semibold">
                                  {listing.listingDate}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Original lender
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  Industry
                                </p>
                                <p className="text-sm font-semibold">
                                  {listing.industry}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Sector classification
                                </p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  DD Score
                                </p>
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`text-sm font-semibold ${getScoreStyle(
                                      listing.dueDiligenceScore
                                    )}`}
                                  >
                                    {listing.dueDiligenceScore}
                                  </p>
                                  {listing.dueDiligenceScore >= 90 ? (
                                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                                  ) : listing.dueDiligenceScore >= 75 ? (
                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                  ) : (
                                    <AlertTriangle className="h-3 w-3 text-rose-500" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Automated analysis
                                </p>
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
                                    onClick={() => setSelectedLoan(listing)}
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
                                      Complete loan position details and due
                                      diligence summary
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedLoan && (
                                    <div className="mt-6 space-y-6">
                                      {/* Investment Overview */}
                                      <div className="bg-muted/50 rounded-xl p-6">
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
                                                selectedLoan.askingPrice
                                              )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {getPercentage(
                                                selectedLoan.askingPrice,
                                                selectedLoan.outstandingAmount
                                              )}
                                              % of outstanding
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
                                            <p className="text-xs text-muted-foreground">
                                              {formatCurrency(
                                                selectedLoan.outstandingAmount -
                                                  selectedLoan.askingPrice
                                              )}{" "}
                                              savings
                                            </p>
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">
                                              Current Rate
                                            </p>
                                            <p className="text-lg font-bold">
                                              {selectedLoan.interestRate}%
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              +
                                              {(
                                                selectedLoan.yieldToMaturity -
                                                selectedLoan.interestRate
                                              ).toFixed(1)}
                                              % spread
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
                                            <p className="text-xs text-muted-foreground">
                                              Yield to maturity
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Loan Details */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            Loan Details
                                          </h4>
                                          <div className="space-y-3">
                                            {[
                                              {
                                                label: "Original Amount",
                                                value: formatCurrency(
                                                  selectedLoan.loanAmount
                                                ),
                                              },
                                              {
                                                label: "Outstanding",
                                                value: formatCurrency(
                                                  selectedLoan.outstandingAmount
                                                ),
                                              },
                                              {
                                                label: "Interest Rate",
                                                value: `${selectedLoan.interestRate}%`,
                                              },
                                              {
                                                label: "Maturity Date",
                                                value: new Date(
                                                  selectedLoan.maturityDate
                                                ).toLocaleDateString(),
                                              },
                                              {
                                                label: "Original Lender",
                                                value:
                                                  selectedLoan.originalLender,
                                              },
                                              {
                                                label: "Industry",
                                                value: selectedLoan.industry,
                                              },
                                            ].map((item, idx) => (
                                              <div
                                                key={idx}
                                                className="flex justify-between items-center py-2 border-b border-border/50"
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
                                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            Risk Assessment
                                          </h4>
                                          <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                              <span className="text-sm text-muted-foreground">
                                                Credit Rating
                                              </span>
                                              <span
                                                className={`text-sm font-medium ${getRatingStyle(
                                                  selectedLoan.creditRating
                                                )}`}
                                              >
                                                {selectedLoan.creditRating}
                                              </span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                              <span className="text-sm text-muted-foreground">
                                                Risk Level
                                              </span>
                                              <Badge
                                                className={`${
                                                  getRiskConfig(
                                                    selectedLoan.riskLevel
                                                  ).lightBg
                                                } ${
                                                  getRiskConfig(
                                                    selectedLoan.riskLevel
                                                  ).text
                                                } border-0 text-xs`}
                                              >
                                                {selectedLoan.riskLevel
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                  selectedLoan.riskLevel.slice(
                                                    1
                                                  )}
                                              </Badge>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                              <span className="text-sm text-muted-foreground">
                                                DD Score
                                              </span>
                                              <div className="flex items-center gap-2">
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
                                                {selectedLoan.dueDiligenceScore >=
                                                90 ? (
                                                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                                                ) : selectedLoan.dueDiligenceScore >=
                                                  75 ? (
                                                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                                                ) : (
                                                  <AlertTriangle className="h-3 w-3 text-rose-500" />
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                              <span className="text-sm text-muted-foreground">
                                                Status
                                              </span>
                                              <span>
                                                {getStatusBadge(
                                                  selectedLoan.status
                                                )}
                                              </span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                              <span className="text-sm text-muted-foreground">
                                                Listed Date
                                              </span>
                                              <span className="text-sm font-medium">
                                                {selectedLoan.listingDate}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Action Buttons */}
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
                                  toast.success("Purchase interest submitted");
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
                                  {formatCurrency(listing.askingPrice)}
                                </span>
                                <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                                  {listing.yieldToMaturity.toFixed(2)}%
                                </span>
                              </div>
                              <div className="mt-3 pt-3 border-t border-primary/20 flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  {discountPercentage.toFixed(1)}% discount
                                </span>
                                <span>{daysToMaturity} days to maturity</span>
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
      </div>
      {/* Empty State */}
      {listings.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl border">
          <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Building className="h-7 w-7 text-muted-foreground" />
          </div>
          <h4 className="text-base font-semibold mb-2">
            No loan positions available
          </h4>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            There are currently no loan positions matching your criteria. Please
            adjust your filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
