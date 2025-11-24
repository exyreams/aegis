"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/Collapsible";
import {
  Inbox,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Clock,
  FileText,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  User,
} from "lucide-react";
import { useReceivedBids, useRefreshBids, useAcceptBid } from "@/hooks/useBids";
import type { RFQWithBids, ReceivedBidData } from "@/lib/api/bids";

interface ReceivedBidsCardProps {
  className?: string;
}

export function ReceivedBidsCard({ className }: ReceivedBidsCardProps) {
  const { data: rfqsWithBids, isLoading, error, refetch } = useReceivedBids();
  const refreshBids = useRefreshBids();
  const acceptBidMutation = useAcceptBid();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRFQs, setExpandedRFQs] = useState<Set<string>>(new Set());

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      refreshBids();
    } finally {
      setRefreshing(false);
    }
  };

  const toggleRFQ = (rfqId: string) => {
    const newExpanded = new Set(expandedRFQs);
    if (newExpanded.has(rfqId)) {
      newExpanded.delete(rfqId);
    } else {
      newExpanded.add(rfqId);
    }
    setExpandedRFQs(newExpanded);
  };

  const handleAcceptBid = async (
    rfqContractId: string,
    bidContractId: string
  ) => {
    try {
      await acceptBidMutation.mutateAsync({ rfqContractId, bidContractId });
    } catch {
      // Error handling is done in the mutation
    }
  };

  const getBidStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Received Bids
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Received Bids
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load received bids: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalBids =
    rfqsWithBids?.reduce((sum, rfq) => sum + rfq.bidCount, 0) || 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Received Bids
            <Badge variant="outline" className="ml-2">
              {totalBids} bids on {rfqsWithBids?.length || 0} RFQs
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!rfqsWithBids || rfqsWithBids.length === 0 ? (
          <div className="text-center py-8">
            <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Bids Received
            </h3>
            <p className="text-sm text-muted-foreground">
              You haven&apos;t received any bids on your RFQs yet. Create an RFQ
              to start receiving bids.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rfqsWithBids.map((rfq: RFQWithBids) => (
              <Collapsible
                key={rfq.rfqContractId}
                open={expandedRFQs.has(rfq.rfqContractId)}
                onOpenChange={() => toggleRFQ(rfq.rfqContractId)}
              >
                <div className="border rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        {expandedRFQs.has(rfq.rfqContractId) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div>
                          <h4 className="font-medium text-sm">
                            {rfq.rfqTitle}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {rfq.bidCount} bid{rfq.bidCount !== 1 ? "s" : ""}{" "}
                            received
                            {rfq.bestRate && (
                              <span className="text-primary font-medium ml-2">
                                Best: {rfq.bestRate}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            rfq.rfqStatus === "active" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {rfq.rfqStatus}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${rfq.loanAmount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rfq.collateralAsset}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t p-4 space-y-3">
                      {rfq.bids.map((bid: ReceivedBidData) => (
                        <div
                          key={bid.bidContractId}
                          className="border rounded-lg p-3 bg-muted/30"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  {bid.lender}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Submitted{" "}
                                  {new Date(
                                    bid.submittedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={getBidStatusColor(bid.status)}
                              className="text-xs"
                            >
                              {bid.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Interest Rate
                                </p>
                                <p className="text-sm font-medium text-primary">
                                  {bid.interestRate}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Status
                                </p>
                                <p className="text-sm font-medium">
                                  {bid.status}
                                </p>
                              </div>
                            </div>
                          </div>

                          {bid.additionalTerms && (
                            <div className="flex items-start gap-2 mb-3">
                              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">
                                  Additional Terms
                                </p>
                                <p className="text-sm">{bid.additionalTerms}</p>
                              </div>
                            </div>
                          )}

                          {bid.status.toLowerCase() === "pending" &&
                            rfq.rfqStatus === "active" && (
                              <div className="flex justify-end pt-2 border-t">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleAcceptBid(
                                      rfq.rfqContractId,
                                      bid.bidContractId
                                    )
                                  }
                                  disabled={acceptBidMutation.isPending}
                                  className="h-7 px-3 text-xs"
                                >
                                  {acceptBidMutation.isPending ? (
                                    <>
                                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                      Accepting...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Accept Bid
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
