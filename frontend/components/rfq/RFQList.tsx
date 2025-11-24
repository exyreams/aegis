"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { Eye, Building, Timer } from "lucide-react";
import { Bidding, FileDescription } from "@/components/icons";
import { BidModal } from "./BidModal";
import { RFQDetailsModal } from "./RFQDetailsModal";

import type { RFQData, UserData } from "@/types/api";

interface RFQListProps {
  rfqs: RFQData[];
  currentUser: UserData | null;
  showActions?: boolean;
}

export function RFQList({
  rfqs,
  currentUser,
  showActions = true,
}: RFQListProps) {
  const [selectedRFQ, setSelectedRFQ] = useState<RFQData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (microseconds: string): string => {
    const ms = parseInt(microseconds) / 1000;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return "<1h";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
            Active
          </Badge>
        );
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewDetails = (rfq: RFQData) => {
    setSelectedRFQ(rfq);
    setShowDetailsModal(true);
  };

  const handleBid = (rfq: RFQData) => {
    setSelectedRFQ(rfq);
    setShowBidModal(true);
  };

  const canBid = (rfq: RFQData) => {
    return currentUser?.role === "lender" && rfq.status === "active";
  };

  const isOwner = (rfq: RFQData) => {
    return rfq.borrower === currentUser?.damlParty;
  };

  if (rfqs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
        No RFQs found
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {rfqs.map((rfq, index) => {
            const collateralRatio = (
              (rfq.collateralAmount / rfq.loanAmount) *
              100
            ).toFixed(1);

            return (
              <motion.div
                key={rfq.contractId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg transition-all duration-200 cursor-pointer group bg-muted/30 border border-border hover:bg-primary/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                onClick={() => handleViewDetails(rfq)}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <FileDescription size={20} className="text-foreground" />
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm truncate">
                        {rfq.title || `${rfq.collateralAsset} Loan`}
                      </span>
                      {getStatusBadge(rfq.status)}
                      {isOwner(rfq) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                Your RFQ
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>You created this RFQ</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>

                    {/* Metrics Row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {formatCurrency(rfq.loanAmount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{rfq.collateralAsset}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {collateralRatio}% ratio
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        <span>
                          {formatDuration(rfq.loanDuration.microseconds)}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-1 text-xs text-muted-foreground font-mono truncate">
                      {rfq.borrower}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(rfq);
                    }}
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Button>

                  {showActions && canBid(rfq) && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBid(rfq);
                      }}
                    >
                      <Bidding className="h-3 w-3" />
                      Bid
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {selectedRFQ && (
        <>
          <RFQDetailsModal
            rfq={selectedRFQ}
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
            currentUser={currentUser}
          />

          <BidModal
            rfq={selectedRFQ}
            open={showBidModal}
            onOpenChange={setShowBidModal}
          />
        </>
      )}
    </>
  );
}
