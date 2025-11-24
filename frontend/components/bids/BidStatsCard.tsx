"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Inbox,
} from "lucide-react";
import { useBidStats } from "@/hooks/useBids";
import { useAuth } from "@/hooks/useAuth";

interface BidStatsCardProps {
  className?: string;
}

export function BidStatsCard({ className }: BidStatsCardProps) {
  const { data: stats, isLoading, error } = useBidStats();
  const { auth } = useAuth();
  const user = auth.user;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Bidding Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Bidding Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load statistics: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isLender = user?.role === "lender";
  const isBorrower = user?.role === "borrower";

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Bidding Statistics
          <Badge variant="outline" className="ml-2">
            {isLender ? "Lender" : isBorrower ? "Borrower" : "User"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLender && stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Total Bids</p>
              </div>
              <p className="text-2xl font-bold">
                {stats.totalBidsSubmitted || 0}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-muted-foreground">Avg Rate</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.averageInterestRate || "0.00%"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pendingBids || 0}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-sm text-muted-foreground">Accepted</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {stats.acceptedBids || 0}
              </p>
            </div>
          </div>
        )}

        {isBorrower && stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">RFQs Created</p>
              </div>
              <p className="text-2xl font-bold">
                {stats.totalRFQsCreated || 0}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-muted-foreground">Bids Received</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalBidsReceived || 0}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <p className="text-sm text-muted-foreground">Active RFQs</p>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.activeRFQs || 0}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {stats.completedLoans || 0}
              </p>
            </div>
          </div>
        )}

        {!isLender && !isBorrower && (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No Statistics Available
            </h3>
            <p className="text-sm text-muted-foreground">
              Bidding statistics are available for lenders and borrowers only.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
