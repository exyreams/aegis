"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  WideModal,
  WideModalContent,
  WideModalTitle,
} from "@/components/ui/WideModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Label } from "@/components/ui/Label";
import {
  Clock,
  DollarSign,
  Shield,
  MessageSquare,
  User,
  Building,
  Info,
  X,
  Copy,
  Calendar,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { FileDescription } from "@/components/icons";
import { BidModal } from "./BidModal";
import { toast } from "sonner";

import type { RFQData, UserData } from "@/types/api";

interface RFQDetailsModalProps {
  rfq: RFQData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: UserData | null;
}

export function RFQDetailsModal({
  rfq,
  open,
  onOpenChange,
  currentUser,
}: RFQDetailsModalProps) {
  const [showBidModal, setShowBidModal] = useState(false);

  const formatDuration = (microseconds: string): string => {
    const ms = parseInt(microseconds) / 1000;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      return "Less than 1 hour";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800"
          >
            <X className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const canBid = currentUser?.role === "lender" && rfq.status === "active";
  const isOwner = rfq.borrower === currentUser?.damlParty;
  const collateralRatio = (
    (rfq.collateralAmount / rfq.loanAmount) *
    100
  ).toFixed(1);

  const handleClose = () => {
    onOpenChange(false);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      <WideModal open={open} onOpenChange={handleClose}>
        <WideModalContent className="overflow-hidden" showCloseButton={false}>
          <WideModalTitle className="sr-only">
            RFQ Details - {rfq.title || `${rfq.collateralAsset} Loan`}
          </WideModalTitle>

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex w-full h-full bg-background rounded-lg shadow-2xl border relative"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 p-2 hover:bg-muted/80 rounded-full transition-colors bg-background/80 backdrop-blur-sm border"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left Sidebar - RFQ Overview */}
            <div className="w-80 bg-gradient-to-t from-primary/5 to-card dark:bg-card rounded-xl border shadow-sm flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center ring-2 ring-primary/20">
                      <FileDescription size={32} className="text-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <h1 className="text-xl font-bold text-foreground">
                      {rfq.title ||
                        `${rfq.collateralAsset} Collateralized Loan`}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusBadge(rfq.status)}
                    {isOwner && (
                      <Badge variant="outline" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Your RFQ
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Dates */}
              <div className="flex-1 p-6">
                <div className="space-y-4">
                  <div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Created
                        </Label>
                        <p className="text-sm font-medium">
                          {new Date(rfq.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Expires
                        </Label>
                        <p className="text-sm font-medium">
                          {new Date(rfq.expiresAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {canBid && (
                <div className="p-6 border-t border-border">
                  <Button
                    onClick={() => setShowBidModal(true)}
                    className="w-full"
                    size="sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit Bid
                  </Button>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-muted/30 min-w-0">
              <div className="p-8 pt-16 h-full min-h-full">
                <div className="space-y-8">
                  {/* Contract Information */}
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-6">
                      Contract Information
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Contract ID
                        </Label>
                        <Alert variant="default">
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm break-all">
                                {rfq.contractId}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(rfq.contractId, "Contract ID")
                                }
                                className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                          RFQ ID
                        </Label>
                        <Alert variant="default">
                          <Building className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm">
                                {rfq.id}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(rfq.id, "RFQ ID")
                                }
                                className="h-6 w-6 p-0 ml-2"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>

                  {/* Borrower Information */}
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-6">
                      Borrower Information
                    </h2>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                        DAML Party ID
                      </Label>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-4">
                          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">
                              Borrower Party
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                          <div className="text-xs font-mono text-muted-foreground break-all flex-1 mr-2">
                            {rfq.borrower}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(rfq.borrower, "Borrower Party ID")
                            }
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Loan Details */}
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-6">
                      Loan Details
                    </h2>

                    <Card>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">
                                  Loan Amount
                                </span>
                              </div>
                              <div className="text-2xl font-bold">
                                {formatCurrency(rfq.loanAmount)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Requested funding amount
                              </p>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">
                                  Collateral
                                </span>
                              </div>
                              <div className="text-2xl font-bold">
                                {formatCurrency(rfq.collateralAmount)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {rfq.collateralAsset} • {collateralRatio}% ratio
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">
                                  Duration
                                </span>
                              </div>
                              <div className="text-2xl font-bold">
                                {formatDuration(rfq.loanDuration.microseconds)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Loan term length
                              </p>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">
                                  Status
                                </span>
                              </div>
                              <div className="mb-2">
                                {getStatusBadge(rfq.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {rfq.status === "active" &&
                                  "Accepting bids from lenders"}
                                {rfq.status === "expired" &&
                                  "No longer accepting bids"}
                                {rfq.status === "completed" &&
                                  "Loan has been funded"}
                                {rfq.status === "cancelled" &&
                                  "RFQ was cancelled"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Approved Lenders */}
                  {rfq.approvedLenders && rfq.approvedLenders.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Approved Lenders
                      </h2>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-4">
                          <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div className="space-y-2">
                            <p className="font-medium text-sm">
                              {rfq.approvedLenders.length} Institutional Lender
                              {rfq.approvedLenders.length !== 1 ? "s" : ""}{" "}
                              Approved
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Only these pre-selected lenders can view and bid
                              on this RFQ for privacy and compliance.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {rfq.approvedLenders.map((lenderId, index) => (
                            <div
                              key={lenderId}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded"
                            >
                              <div className="text-xs font-mono text-muted-foreground break-all flex-1 mr-2">
                                {lenderId}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(
                                    lenderId,
                                    `Lender ${index + 1} Party ID`
                                  )
                                }
                                className="h-6 w-6 p-0 flex-shrink-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bidding Status */}
                  {rfq.status === "active" && (
                    <div className="pb-4">
                      <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Bidding Status
                      </h2>

                      <Alert variant="default">
                        <MessageSquare className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-medium text-sm">
                              Awaiting Competitive Bids
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Approved lenders can submit private bids with
                              their interest rates and terms. All bids remain
                              confidential until you choose to accept one.
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </WideModalContent>
      </WideModal>

      {/* Bid Modal */}
      <BidModal rfq={rfq} open={showBidModal} onOpenChange={setShowBidModal} />
    </>
  );
}
