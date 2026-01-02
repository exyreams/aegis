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
          bg: "bg-emerald-500 dark:bg-emerald-500",
          lightBg: "bg-emerald-50 dark:bg-emerald-950/50",
          text: "text-emerald-700 dark:text-emerald-400",
          border: "border-emerald-200 dark:border-emerald-800",
          badge:
            "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
        };
      case "medium":
        return {
          bg: "bg-amber-500 dark:bg-amber-500",
          lightBg: "bg-amber-50 dark:bg-amber-950/50",
          text: "text-amber-700 dark:text-amber-400",
          border: "border-amber-200 dark:border-amber-800",
          badge:
            "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
        };
      case "high":
        return {
          bg: "bg-rose-500 dark:bg-rose-500",
          lightBg: "bg-rose-50 dark:bg-rose-950/50",
          text: "text-rose-700 dark:text-rose-400",
          border: "border-rose-200 dark:border-rose-800",
          badge:
            "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300",
        };
      default:
        return {
          bg: "bg-slate-500 dark:bg-slate-500",
          lightBg: "bg-slate-50 dark:bg-slate-800",
          text: "text-slate-700 dark:text-slate-400",
          border: "border-slate-200 dark:border-slate-700",
          badge:
            "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Sold
          </span>
        );
      case "withdrawn":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500">
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
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
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
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

  const renderSortButton = (option: SortOption, label: string, Icon: any) => (
    <button
      key={option}
      onClick={() => handleSort(option)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
        sortBy === option
          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      {sortBy === option && (
        <span className="ml-1">
          {sortOrder === "desc" ? (
            <TrendingDown className="h-3 w-3" />
          ) : (
            <TrendingUp className="h-3 w-3" />
          )}
        </span>
      )}
    </button>
  );

  return (
    <div className="px-4 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Loan Positions
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {listings.length} opportunities available for secondary market
            trading
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Sort by:
          </span>
          <div className="flex gap-1">
            {renderSortButton("yield", "Yield", TrendingUp)}
            {renderSortButton("amount", "Amount", DollarSign)}
            {renderSortButton("rating", "Rating", Filter)}
            {renderSortButton("score", "Score", BarChart3)}
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl border border-slate-200 dark:border-slate-700">
        <div className="col-span-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Borrower / Lender
          </span>
        </div>
        <div className="col-span-2 text-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Outstanding
          </span>
        </div>
        <div className="col-span-2 text-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Yield
          </span>
        </div>
        <div className="col-span-2 text-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Rating
          </span>
        </div>
        <div className="col-span-2 text-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            DD Score
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
              className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden transition-all duration-200 ${
                isExpanded
                  ? "border-slate-300 dark:border-slate-600 shadow-lg dark:shadow-xl"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm dark:hover:shadow-lg"
              }`}
            >
              {/* Main Row */}
              <div
                className="px-5 py-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : listing.id)}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Borrower Info */}
                  <div className="col-span-4 flex items-center gap-4">
                    <div className={`w-1 h-10 rounded-full ${riskConfig.bg}`} />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {listing.borrower}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {listing.originalLender}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">
                          •
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {listing.industry}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Metrics */}
                  <div className="hidden lg:grid lg:grid-cols-8 col-span-8 gap-4 items-center">
                    <div className="col-span-2 text-center">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(listing.outstandingAmount)}
                      </p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {listing.yieldToMaturity.toFixed(2)}%
                      </p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p
                        className={`text-sm font-semibold ${getRatingStyle(
                          listing.creditRating
                        )}`}
                      >
                        {listing.creditRating}
                      </p>
                    </div>
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <p
                        className={`text-sm font-semibold ${getScoreStyle(
                          listing.dueDiligenceScore
                        )}`}
                      >
                        {listing.dueDiligenceScore}
                      </p>
                      {listing.dueDiligenceScore >= 90 ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                      ) : listing.dueDiligenceScore >= 75 ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
                      )}
                    </div>
                  </div>

                  {/* Mobile Metrics & Status */}
                  <div className="col-span-8 lg:col-span-0 flex items-center justify-between">
                    <div className="lg:hidden grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Yield
                        </p>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {listing.yieldToMaturity.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
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
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(listing.status)}
                      <ChevronRight
                        className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Section */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="p-6">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                      {/* Investment Details Grid */}
                      <div className="xl:col-span-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {/* Asking Price */}
                          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Asking Price
                              </span>
                            </div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                              {formatCurrency(listing.askingPrice)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {getPercentage(
                                listing.askingPrice,
                                listing.outstandingAmount
                              )}
                              % of outstanding
                            </p>
                          </div>

                          {/* Discount */}
                          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingDown className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Discount
                              </span>
                            </div>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {discountPercentage.toFixed(1)}%
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {formatCurrency(
                                listing.outstandingAmount - listing.askingPrice
                              )}{" "}
                              savings
                            </p>
                          </div>

                          {/* Maturity */}
                          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Maturity Date
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {new Date(
                                listing.maturityDate
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {daysToMaturity} days remaining
                            </p>
                          </div>

                          {/* Current Rate */}
                          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Percent className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Current Rate
                              </span>
                            </div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                              {listing.interestRate}%
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              +
                              {(
                                listing.yieldToMaturity - listing.interestRate
                              ).toFixed(1)}
                              % spread
                            </p>
                          </div>
                        </div>

                        {/* Secondary Info Row */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Risk Level
                              </span>
                            </div>
                            <Badge
                              className={`${riskConfig.lightBg} ${riskConfig.text} border-0`}
                            >
                              {listing.riskLevel.charAt(0).toUpperCase() +
                                listing.riskLevel.slice(1)}
                            </Badge>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {listing.dueDiligenceScore >= 90
                                ? "Low risk profile"
                                : listing.dueDiligenceScore >= 75
                                ? "Moderate risk"
                                : "Higher risk"}
                            </p>
                          </div>

                          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Listed
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {listing.listingDate}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Original lender
                            </p>
                          </div>

                          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Briefcase className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Original Loan
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(listing.loanAmount)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {getPercentage(
                                listing.outstandingAmount,
                                listing.loanAmount
                              )}
                              % outstanding
                            </p>
                          </div>

                          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <BarChart3 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Credit Rating
                              </span>
                            </div>
                            <p
                              className={`text-lg font-semibold ${getRatingStyle(
                                listing.creditRating
                              )}`}
                            >
                              {listing.creditRating}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              External rating
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Panel */}
                      <div className="xl:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                          <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                            Available Actions
                          </h5>
                          <div className="space-y-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-between h-10 text-sm border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                  onClick={() => setSelectedLoan(listing)}
                                >
                                  <span className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </span>
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl dark:bg-slate-900 dark:border-slate-700">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2 text-lg dark:text-white">
                                    <Building className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                                    {selectedLoan?.borrower}
                                  </DialogTitle>
                                  <DialogDescription className="dark:text-slate-400">
                                    Complete loan position details and due
                                    diligence summary
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedLoan && (
                                  <div className="mt-6 space-y-6">
                                    {/* Loan Details Grid */}
                                    <div className="grid grid-cols-2 gap-6">
                                      <div>
                                        <h6 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                          <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                          Loan Details
                                        </h6>
                                        <div className="space-y-2">
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
                                              value: selectedLoan.maturityDate,
                                            },
                                            {
                                              label: "Original Lender",
                                              value:
                                                selectedLoan.originalLender,
                                            },
                                            {
                                              label: "Listing Date",
                                              value: selectedLoan.listingDate,
                                            },
                                          ].map((item, idx) => (
                                            <div
                                              key={idx}
                                              className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800"
                                            >
                                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                                {item.label}
                                              </span>
                                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                {item.value}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <h6 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                          <Filter className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                          Risk Assessment
                                        </h6>
                                        <div className="space-y-2">
                                          {[
                                            {
                                              label: "Credit Rating",
                                              value: selectedLoan.creditRating,
                                              color: getRatingStyle(
                                                selectedLoan.creditRating
                                              ),
                                            },
                                            {
                                              label: "Risk Level",
                                              value:
                                                selectedLoan.riskLevel.toUpperCase(),
                                              badge:
                                                riskConfig.lightBg +
                                                " " +
                                                riskConfig.text,
                                            },
                                            {
                                              label: "DD Score",
                                              value: `${selectedLoan.dueDiligenceScore}/100`,
                                              color: getScoreStyle(
                                                selectedLoan.dueDiligenceScore
                                              ),
                                            },
                                            {
                                              label: "Industry",
                                              value: selectedLoan.industry,
                                            },
                                            {
                                              label: "Status",
                                              value: getStatusBadge(
                                                selectedLoan.status
                                              ),
                                            },
                                          ].map((item, idx) => (
                                            <div
                                              key={idx}
                                              className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800"
                                            >
                                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                                {item.label}
                                              </span>
                                              <span
                                                className={`text-sm font-medium ${
                                                  item.color || ""
                                                } ${item.badge || ""}`}
                                              >
                                                {item.value}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Investment Summary */}
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                                      <h6 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        Investment Summary
                                      </h6>
                                      <div className="grid grid-cols-2 gap-6">
                                        <div>
                                          <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Investment Required
                                          </p>
                                          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                            {formatCurrency(
                                              selectedLoan.askingPrice
                                            )}
                                          </p>
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {getPercentage(
                                              selectedLoan.askingPrice,
                                              selectedLoan.outstandingAmount
                                            )}
                                            % of outstanding
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Expected Yield
                                          </p>
                                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                            {selectedLoan.yieldToMaturity.toFixed(
                                              2
                                            )}
                                            %
                                          </p>
                                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Current rate:{" "}
                                            {selectedLoan.interestRate}%
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              className="w-full justify-start h-10 text-sm border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              onClick={() => {
                                onStartDueDiligence(listing.id);
                                toast.success("Due diligence report generated");
                              }}
                            >
                              <FileSearch className="h-4 w-4 mr-2" />
                              Due Diligence Report
                            </Button>
                            <Button
                              className="w-full justify-start h-10 text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                              onClick={() => {
                                toast.success("Purchase interest submitted");
                              }}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Express Interest
                            </Button>
                          </div>
                        </div>

                        {/* Summary Card */}
                        <div className="mt-4 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-800 rounded-lg p-4 text-white">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-slate-400 dark:text-slate-400">
                              Investment
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-400">
                              Expected Return
                            </span>
                          </div>
                          <div className="flex items-end justify-between">
                            <span className="text-xl font-bold">
                              {formatCurrency(listing.askingPrice)}
                            </span>
                            <span className="text-lg font-semibold text-emerald-400 dark:text-emerald-400">
                              {listing.yieldToMaturity.toFixed(2)}%
                            </span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-700 dark:border-slate-600 flex items-center justify-between text-xs text-slate-400 dark:text-slate-400">
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
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {listings.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="h-14 w-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Building className="h-7 w-7 text-slate-400 dark:text-slate-500" />
          </div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
            No loan positions available
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            There are currently no loan positions matching your criteria. Please
            adjust your filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
