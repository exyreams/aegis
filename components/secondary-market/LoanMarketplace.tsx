"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
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
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Building,
  Star,
  AlertTriangle,
  CheckCircle,
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

export function LoanMarketplace({
  listings,
  onViewDetails,
  onStartDueDiligence,
}: LoanMarketplaceProps) {
  const [selectedLoan, setSelectedLoan] = useState<LoanListing | null>(null);
  const [sortBy, setSortBy] = useState<"yield" | "amount" | "rating" | "score">(
    "yield"
  );

  const sortedListings = [...listings].sort((a, b) => {
    switch (sortBy) {
      case "yield":
        return b.yieldToMaturity - a.yieldToMaturity;
      case "amount":
        return b.outstandingAmount - a.outstandingAmount;
      case "rating":
        return a.creditRating.localeCompare(b.creditRating);
      case "score":
        return b.dueDiligenceScore - a.dueDiligenceScore;
      default:
        return 0;
    }
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      case "withdrawn":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCreditRatingColor = (rating: string) => {
    if (rating.startsWith("A")) return "text-green-600";
    if (rating.startsWith("B")) return "text-yellow-600";
    return "text-red-600";
  };

  const getDueDiligenceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const formatCurrency = (amount: number) => {
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">Available Loan Positions</h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="yield">Yield to Maturity</option>
            <option value="amount">Loan Amount</option>
            <option value="rating">Credit Rating</option>
            <option value="score">DD Score</option>
          </select>
        </div>
      </div>

      {/* Loan Listings */}
      <div className="grid gap-4">
        {sortedListings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{listing.borrower}</CardTitle>
                  <p className="text-sm text-gray-600">
                    Listed by {listing.originalLender} • {listing.industry}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getRiskColor(listing.riskLevel)}>
                    {listing.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <Badge className={getStatusColor(listing.status)}>
                    {listing.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(listing.outstandingAmount)}
                  </div>
                  <div className="text-sm text-gray-600">Outstanding</div>
                  <div className="text-xs text-gray-500">
                    of {formatCurrency(listing.loanAmount)} original
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {listing.yieldToMaturity.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Yield to Maturity</div>
                  <div className="text-xs text-gray-500">
                    Current rate: {listing.interestRate}%
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${getCreditRatingColor(
                      listing.creditRating
                    )}`}
                  >
                    {listing.creditRating}
                  </div>
                  <div className="text-sm text-gray-600">Credit Rating</div>
                  <div className="text-xs text-gray-500">
                    {calculateDaysToMaturity(listing.maturityDate)} days to
                    maturity
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${getDueDiligenceColor(
                      listing.dueDiligenceScore
                    )}`}
                  >
                    {listing.dueDiligenceScore}
                  </div>
                  <div className="text-sm text-gray-600">DD Score</div>
                  <div className="flex items-center justify-center text-xs text-gray-500">
                    {listing.dueDiligenceScore >= 90 ? (
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    ) : listing.dueDiligenceScore >= 75 ? (
                      <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    Auto-verified
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Asking Price</div>
                    <div className="text-xl font-bold">
                      {formatCurrency(listing.askingPrice)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(
                        (listing.askingPrice / listing.outstandingAmount) *
                        100
                      ).toFixed(1)}
                      % of outstanding
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">
                      Potential Discount
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(
                        listing.outstandingAmount - listing.askingPrice
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(
                        ((listing.outstandingAmount - listing.askingPrice) /
                          listing.outstandingAmount) *
                        100
                      ).toFixed(1)}
                      % discount
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Maturity Date</div>
                    <div className="text-xl font-bold">
                      {new Date(listing.maturityDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {calculateDaysToMaturity(listing.maturityDate)} days
                      remaining
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Listed {listing.listingDate}</span>
                </div>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLoan(listing)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {selectedLoan?.borrower} - Loan Details
                        </DialogTitle>
                        <DialogDescription>
                          Comprehensive loan information and due diligence
                          summary
                        </DialogDescription>
                      </DialogHeader>
                      {selectedLoan && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">
                                Loan Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Original Amount:</span>
                                  <span>
                                    {formatCurrency(selectedLoan.loanAmount)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Outstanding:</span>
                                  <span>
                                    {formatCurrency(
                                      selectedLoan.outstandingAmount
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Interest Rate:</span>
                                  <span>{selectedLoan.interestRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Maturity:</span>
                                  <span>{selectedLoan.maturityDate}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">
                                Risk Assessment
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Credit Rating:</span>
                                  <span
                                    className={getCreditRatingColor(
                                      selectedLoan.creditRating
                                    )}
                                  >
                                    {selectedLoan.creditRating}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Risk Level:</span>
                                  <Badge
                                    className={getRiskColor(
                                      selectedLoan.riskLevel
                                    )}
                                    variant="secondary"
                                  >
                                    {selectedLoan.riskLevel}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>DD Score:</span>
                                  <span
                                    className={getDueDiligenceColor(
                                      selectedLoan.dueDiligenceScore
                                    )}
                                  >
                                    {selectedLoan.dueDiligenceScore}/100
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Industry:</span>
                                  <span>{selectedLoan.industry}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2">
                              Investment Summary
                            </h4>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">
                                    Investment Required:
                                  </span>
                                  <div className="text-lg font-bold">
                                    {formatCurrency(selectedLoan.askingPrice)}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Expected Yield:
                                  </span>
                                  <div className="text-lg font-bold text-green-600">
                                    {selectedLoan.yieldToMaturity.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onStartDueDiligence(listing.id);
                      toast.success(
                        "Due diligence report generated instantly!"
                      );
                    }}
                  >
                    <FileSearch className="h-4 w-4 mr-1" />
                    DD Report
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      toast.success("Purchase interest submitted!");
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Express Interest
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No loans found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or check back later for new
            listings.
          </p>
        </div>
      )}
    </div>
  );
}
