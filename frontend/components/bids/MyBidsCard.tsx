"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useMyBids, useRefreshBids } from "@/hooks/useBids";
import type { BidData } from "@/lib/api/bids";

interface MyBidsCardProps {
  className?: string;
}

export function MyBidsCard({ className }: MyBidsCardProps) {
  const { data: bids, isLoading, error, refetch } = useMyBids();
  const refreshBids = useRefreshBids();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      refreshBids();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string, rfqStatus: string) => {
    if (rfqStatus === "expired") return "secondary";
    switch (status.toLowerCase()) {
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      case "pending":
      case "bidsubmitted":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string, rfqStatus: string) => {
    if (rfqStatus === "expired") return "RFQ Expired";
    switch (status.toLowerCase()) {
      case "accepted":
        return "Accepted";
      case "rejected":
        return "Rejected";
      case "pending":
      case "bidsubmitted":
        return "Pending";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            My Submitted Bids
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full" />
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
            <TrendingUp className="h-5 w-5" />
            My Submitted Bids
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load bids: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            My Submitted Bids
            <Badge variant="outline" className="ml-2">
              {bids?.length || 0}
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
        {!bids || bids.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Bids Submitted
            </h3>
            <p className="text-sm text-muted-foreground">
              You haven&apos;t submitted any bids yet. Browse available RFQs to
              start bidding.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid: BidData) => (
              <div
                key={bid.bidContractId}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{bid.rfqTitle}</h4>
                    <p className="text-xs text-muted-foreground">
                      Borrower: {bid.borrower}
                    </p>
                  </div>
                  <Badge
                    variant={getStatusColor(bid.status, bid.rfqStatus)}
                    className="text-xs"
                  >
                    {getStatusText(bid.status, bid.rfqStatus)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Loan Amount
                      </p>
                      <p className="text-sm font-medium">
                        ${bid.loanAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
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
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Submitted</p>
                    <p className="text-sm">
                      {new Date(bid.submittedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
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

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Collateral: {bid.collateralAsset}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    View RFQ
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
