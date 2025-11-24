"use client";

import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  TrendingUp,
  Clock,
  Eye,
  Filter,
  AlertCircle,
  Gavel,
} from "lucide-react";
import { RefreshCw } from "@/components/icons";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { rfqApi, bidsApi } from "@/lib/api";
import type { RFQData } from "@/types/api";
import type { BidData, RFQWithBids, ReceivedBidData } from "@/lib/api/bids";

interface RFQ {
  contractId: string;
  id: string;
  title: string;
  borrower: string;
  loanAmount: number;
  collateralAmount: number;
  collateralAsset: string;
  loanDuration: number;
  approvedLenders: string[];
  createdAt: string;
  expiresAt: string;
  status: "active" | "expired" | "completed" | "cancelled";
  collateralRatio: string;
  daysRemaining: number;
}

// RFQData is now imported from @/types/api

// UI-friendly bid interface
interface Bid {
  contractId: string;
  bidId: string;
  rfqId: string;
  rfqBorrower: string;
  lender: string;
  lenderCategory: string;
  lenderRating: string;
  loanAmount: number;
  interestRate: number;
  paymentFrequency: string;
  amortizationType: string;
  additionalTerms: string;
  status: string;
  submittedAt: string;
}

export default function BiddingPage() {
  const { auth } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHoveringRefresh, setIsHoveringRefresh] = useState(false);

  const fetchAvailableRFQs = useCallback(async () => {
    try {
      // Use the same API as the working "My RFQs" page
      const result = await rfqApi.getRFQs({ status: "active" });

      if (result.status === 200) {
        console.log("All RFQs:", result.data);
        console.log("Current user DAML party:", auth.user?.damlParty);

        // Filter RFQs where current user is an approved lender
        const availableRFQs: RFQ[] = result.data
          .filter((rfqData: RFQData) => {
            const isApproved = rfqData.approvedLenders.includes(
              auth.user?.damlParty || ""
            );
            console.log(
              `RFQ ${rfqData.id} - Approved lenders:`,
              rfqData.approvedLenders,
              "Is approved:",
              isApproved
            );
            return isApproved;
          })
          .map(
            (rfqData: RFQData): RFQ => ({
              ...rfqData,
              title: rfqData.title || `RFQ ${rfqData.id}`, // Provide default title
              loanDuration:
                typeof rfqData.loanDuration === "number"
                  ? rfqData.loanDuration
                  : 0, // Handle unknown type
              status: rfqData.status, // Keep the union type as is
              collateralRatio: rfqData.collateralRatio || "0.00", // Handle undefined
              daysRemaining: rfqData.daysRemaining || 0, // Handle undefined
            })
          );

        console.log("Available RFQs for bidding:", availableRFQs);
        setRfqs(availableRFQs);
      } else {
        const errorMessage =
          result.error || `Failed to fetch RFQs (Status: ${result.status})`;
        console.error("RFQ fetch failed:", {
          status: result.status,
          error: result.error,
        });
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("RFQ fetch error:", error);
      toast.error(
        `Failed to fetch RFQs: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [auth.user?.damlParty]);

  const fetchMyBids = useCallback(async () => {
    try {
      console.log("Fetching bids using new backend endpoints...");

      // Use the new backend endpoints
      const [myBidsResult, receivedBidsResult] = await Promise.all([
        bidsApi.getMyBids(),
        bidsApi.getReceivedBids(),
      ]);

      const allBids: Bid[] = [];

      // Process my submitted bids (as lender)
      if (myBidsResult.status === 200 && myBidsResult.data) {
        console.log("My submitted bids:", myBidsResult.data);
        const mySubmittedBids: Bid[] = myBidsResult.data.map(
          (bidData: BidData) => ({
            contractId: bidData.bidContractId,
            bidId: bidData.bidContractId.split("#")[1] || bidData.bidContractId,
            rfqId: bidData.rfqTitle || `RFQ-${bidData.rfqContractId.slice(-8)}`,
            rfqBorrower: bidData.borrower,
            lender: auth.user?.damlParty || "",
            lenderCategory: "Institutional", // Default category
            lenderRating: "A", // Default rating
            loanAmount: bidData.loanAmount,
            interestRate: parseFloat(bidData.interestRateDecimal) * 100,
            paymentFrequency: "Monthly", // Default frequency
            amortizationType: "Fixed", // Default amortization
            additionalTerms: bidData.additionalTerms,
            status: bidData.status,
            submittedAt: bidData.submittedAt,
          })
        );
        allBids.push(...mySubmittedBids);
      } else if (myBidsResult.error) {
        console.error("Failed to fetch my bids:", myBidsResult.error);
      }

      // Process received bids (as borrower)
      if (receivedBidsResult.status === 200 && receivedBidsResult.data) {
        console.log("Received bids:", receivedBidsResult.data);
        receivedBidsResult.data.forEach((rfqWithBids: RFQWithBids) => {
          const receivedBids: Bid[] = rfqWithBids.bids.map(
            (bidData: ReceivedBidData) => ({
              contractId: bidData.bidContractId,
              bidId:
                bidData.bidContractId.split("#")[1] || bidData.bidContractId,
              rfqId:
                rfqWithBids.rfqTitle ||
                `RFQ-${rfqWithBids.rfqContractId.slice(-8)}`,
              rfqBorrower: auth.user?.damlParty || "",
              lender: bidData.lender,
              lenderCategory: "Institutional", // Default category
              lenderRating: "A", // Default rating
              loanAmount: rfqWithBids.loanAmount,
              interestRate: parseFloat(bidData.interestRateDecimal) * 100,
              paymentFrequency: "Monthly", // Default frequency
              amortizationType: "Fixed", // Default amortization
              additionalTerms: bidData.additionalTerms,
              status: bidData.status,
              submittedAt: bidData.submittedAt,
            })
          );
          allBids.push(...receivedBids);
        });
      } else if (receivedBidsResult.error) {
        console.error(
          "Failed to fetch received bids:",
          receivedBidsResult.error
        );
      }

      console.log("All bids combined:", allBids);
      setMyBids(allBids);

      // Show success message if we got data
      if (allBids.length > 0) {
        toast.success(`Loaded ${allBids.length} bids successfully`);
      } else {
        console.log(
          "No bids found - this might be expected if no bids have been submitted yet"
        );
      }
    } catch (error) {
      console.error("Failed to fetch bids:", error);
      toast.error(
        `Failed to fetch bids: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }, [auth.user?.damlParty]);

  useEffect(() => {
    if (auth.user?.damlParty) {
      fetchAvailableRFQs();
      fetchMyBids();
    }
  }, [auth.user, fetchAvailableRFQs, fetchMyBids]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchAvailableRFQs(), fetchMyBids()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!auth.user) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please log in to access the bidding dashboard.
              </AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
              {/* Page Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="mb-2">
                      <h1 className="text-3xl font-bold text-foreground">
                        Bidding Dashboard
                      </h1>
                    </div>
                    <p className="text-muted-foreground">
                      Track your submitted bids and review bids received on your
                      RFQs
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      onMouseEnter={() => setIsHoveringRefresh(true)}
                      onMouseLeave={() => setIsHoveringRefresh(false)}
                    >
                      <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isRefreshing || loading}
                      >
                        <RefreshCw
                          size={16}
                          className="mr-2"
                          isSpinning={isRefreshing || loading}
                          forceHover={
                            isHoveringRefresh && !isRefreshing && !loading
                          }
                        />
                        {isRefreshing ? "Refreshing..." : "Refresh Data"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 mb-8">
                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Available RFQs</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {rfqs.length}
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Live
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Ready for bidding <Eye className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        RFQs you can bid on
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Submitted Bids</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {
                          myBids.filter(
                            (bid) => bid.lender === auth.user?.damlParty
                          ).length
                        }
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <Gavel className="h-3 w-3 mr-1" />
                          Sent
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Bids I submitted <Gavel className="size-4" />
                      </div>
                      <div className="text-muted-foreground">As a lender</div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Received Bids</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {
                          myBids.filter(
                            (bid) => bid.rfqBorrower === auth.user?.damlParty
                          ).length
                        }
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Received
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Bids on my RFQs <Clock className="size-4" />
                      </div>
                      <div className="text-muted-foreground">As a borrower</div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Success Rate</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {(() => {
                          const submittedBids = myBids.filter(
                            (bid) => bid.lender === auth.user?.damlParty
                          );
                          const acceptedBids = submittedBids.filter(
                            (bid) => bid.status === "BidAccepted"
                          );
                          return submittedBids.length > 0
                            ? Math.round(
                                (acceptedBids.length / submittedBids.length) *
                                  100
                              )
                            : 0;
                        })()}
                        %
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Win Rate
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Accepted bids <TrendingUp className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Conversion rate
                      </div>
                    </CardFooter>
                  </Card>
                </div>

                {/* Quick Action */}
                <div className="mb-6">
                  <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Ready to Submit New Bids?
                          </h3>
                          <p className="text-muted-foreground">
                            Browse available RFQs and submit competitive bids to
                            grow your lending portfolio.
                          </p>
                        </div>
                        <Button asChild className="ml-4">
                          <a href="/dashboard/rfqs">
                            <Eye className="h-4 w-4 mr-2" />
                            Browse RFQs
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* My Bids Section */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gavel className="h-5 w-5" />
                        Bidding Activity
                      </CardTitle>
                      <CardDescription>
                        Track bids you&apos;ve submitted as a lender and bids
                        received on your RFQs as a borrower.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {myBids.length === 0 ? (
                        <div className="text-center py-12">
                          <Gavel className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                          <h3 className="text-xl font-semibold mb-3">
                            No Bidding Activity Yet
                          </h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Start your lending journey by submitting bids on
                            available RFQs, or create your own RFQ to receive
                            bids from lenders. After submitting a bid, click
                            "Refresh Data&quot; to see it appear here.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button asChild>
                              <a href="/dashboard/rfqs">
                                <Eye className="h-4 w-4 mr-2" />
                                Browse Available RFQs
                              </a>
                            </Button>
                            <Button variant="outline" asChild>
                              <a href="/dashboard/rfqs/create">
                                <Filter className="h-4 w-4 mr-2" />
                                Create New RFQ
                              </a>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myBids.map((bid) => {
                            const isMyBid = bid.lender === auth.user?.damlParty;

                            return (
                              <Card
                                key={bid.contractId}
                                className={`border-l-4 ${
                                  isMyBid
                                    ? "border-l-blue-500/50 bg-blue-50/30 dark:bg-blue-950/20"
                                    : "border-l-green-500/50 bg-green-50/30 dark:bg-green-950/20"
                                }`}
                              >
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div
                                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                            isMyBid
                                              ? "bg-blue-100 dark:bg-blue-900"
                                              : "bg-green-100 dark:bg-green-900"
                                          }`}
                                        >
                                          <Gavel
                                            className={`h-5 w-5 ${
                                              isMyBid
                                                ? "text-blue-600"
                                                : "text-green-600"
                                            }`}
                                          />
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg">
                                              {bid.rfqId}
                                            </h3>
                                            <Badge
                                              variant={
                                                isMyBid
                                                  ? "secondary"
                                                  : "default"
                                              }
                                            >
                                              {isMyBid
                                                ? "My Bid"
                                                : "Received Bid"}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-muted-foreground">
                                            {isMyBid ? "Lender" : "Borrower"}:{" "}
                                            {isMyBid
                                              ? bid.lender
                                              : bid.rfqBorrower}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Submitted{" "}
                                            {new Date(
                                              bid.submittedAt
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <div className="bg-muted/30 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1">
                                            Loan Amount
                                          </p>
                                          <p className="text-lg font-bold text-foreground">
                                            ${bid.loanAmount.toLocaleString()}
                                          </p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1">
                                            Interest Rate
                                          </p>
                                          <p className="text-lg font-bold text-green-600">
                                            {bid.interestRate.toFixed(2)}%
                                          </p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1">
                                            Payment Frequency
                                          </p>
                                          <p className="text-sm font-semibold">
                                            {bid.paymentFrequency}
                                          </p>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1">
                                            Status
                                          </p>
                                          <Badge
                                            variant={
                                              bid.status === "BidAccepted"
                                                ? "default"
                                                : bid.status === "BidSubmitted"
                                                ? "secondary"
                                                : bid.status ===
                                                  "BidUnderReview"
                                                ? "outline"
                                                : "destructive"
                                            }
                                            className="text-sm"
                                          >
                                            {bid.status.replace("Bid", "")}
                                          </Badge>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-muted/20 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1">
                                            Lender Rating
                                          </p>
                                          <p className="text-sm font-semibold">
                                            {bid.lenderRating}
                                          </p>
                                        </div>
                                        <div className="bg-muted/20 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1">
                                            Category
                                          </p>
                                          <p className="text-sm font-semibold">
                                            {bid.lenderCategory}
                                          </p>
                                        </div>
                                        <div className="bg-muted/20 rounded-lg p-3">
                                          <p className="text-xs text-muted-foreground mb-1">
                                            Days Ago
                                          </p>
                                          <p className="text-sm font-semibold">
                                            {Math.floor(
                                              (Date.now() -
                                                new Date(
                                                  bid.submittedAt
                                                ).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                            )}
                                          </p>
                                        </div>
                                      </div>

                                      {bid.additionalTerms && (
                                        <div className="bg-muted/20 rounded-lg p-3 mt-3">
                                          <p className="text-xs text-muted-foreground mb-1">
                                            Additional Terms
                                          </p>
                                          <p className="text-sm">
                                            {bid.additionalTerms}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
