"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Building2,
  Calendar,
  DollarSign,
  FileText,
  MoreHorizontal,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Edit,
  Download,
  Share,
  Archive,
} from "lucide-react";

import { LoanData } from "./types";

export interface LoanCardProps {
  loan: LoanData;
  onView?: (loan: LoanData) => void;
  onEdit?: (loan: LoanData) => void;
  onDownload?: (loan: LoanData) => void;
  onShare?: (loan: LoanData) => void;
  onArchive?: (loan: LoanData) => void;
}

const statusConfig = {
  draft: { color: "bg-gray-500", label: "Draft", icon: Edit },
  under_review: { color: "bg-yellow-500", label: "Under Review", icon: Clock },
  approved: { color: "bg-blue-500", label: "Approved", icon: CheckCircle2 },
  active: { color: "bg-green-500", label: "Active", icon: TrendingUp },
  completed: {
    color: "bg-emerald-500",
    label: "Completed",
    icon: CheckCircle2,
  },
  defaulted: { color: "bg-red-500", label: "Defaulted", icon: AlertTriangle },
};

const riskColors = {
  AAA: "text-green-700 bg-green-50 border-green-200",
  AA: "text-green-600 bg-green-50 border-green-200",
  A: "text-green-500 bg-green-50 border-green-200",
  BBB: "text-yellow-600 bg-yellow-50 border-yellow-200",
  BB: "text-orange-500 bg-orange-50 border-orange-200",
  B: "text-orange-600 bg-orange-50 border-orange-200",
  CCC: "text-red-500 bg-red-50 border-red-200",
  CC: "text-red-600 bg-red-50 border-red-200",
  C: "text-red-700 bg-red-50 border-red-200",
  D: "text-red-800 bg-red-50 border-red-200",
};

import Link from "next/link";

export function LoanCard({
  loan,
  onView,
  onEdit,
  onDownload,
  onShare,
  onArchive,
}: LoanCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCovenantStatus = () => {
    const breaches = loan.covenants.filter((c) => c.status === "breach").length;
    const warnings = loan.covenants.filter(
      (c) => c.status === "warning"
    ).length;
    const compliant = loan.covenants.filter(
      (c) => c.status === "compliant"
    ).length;

    if (breaches > 0)
      return { status: "breach", count: breaches, color: "text-red-600" };
    if (warnings > 0)
      return { status: "warning", count: warnings, color: "text-yellow-600" };
    return { status: "compliant", count: compliant, color: "text-green-600" };
  };

  const covenantStatus = getCovenantStatus();
  const StatusIcon = statusConfig[loan.status].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={`${
                    statusConfig[loan.status].color
                  } text-white border-0`}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[loan.status].label}
                </Badge>
                <Badge
                  variant="outline"
                  className={(riskColors as Record<string, string>)[loan.riskRating] || "text-gray-600 bg-gray-50 border-gray-200"}
                >
                  {loan.riskRating}
                </Badge>
                {loan.sustainabilityLinked && (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    ESG
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg font-semibold truncate hover:text-primary cursor-pointer">
                <Link href={`/dashboard/loans/${loan.id}`}>
                  {loan.borrower}
                </Link>
              </CardTitle>
              <CardDescription className="text-sm">
                {loan.facilityType} • {loan.purpose}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/loans/${loan.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(loan)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload?.(loan)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(loan)}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive?.(loan)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                Loan Amount
              </div>
              <div className="font-semibold">
                {formatCurrency(loan.amount, loan.currency)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Interest Rate
              </div>
              <div className="font-semibold">{loan.interestRate}%</div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                Lender
              </div>
              <div className="truncate">{loan.lender}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Maturity
              </div>
              <div>{formatDate(loan.maturityDate)}</div>
            </div>
          </div>

          {/* Covenant Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Covenants</span>
              <span className={`font-medium ${covenantStatus.color}`}>
                {covenantStatus.count} {covenantStatus.status}
              </span>
            </div>
            <Progress
              value={
                (loan.covenants.filter((c) => c.status === "compliant").length /
                  loan.covenants.length) *
                100
              }
              className="h-2"
            />
          </div>

          {/* Documents */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <FileText className="h-3 w-3" />
              Documents
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{loan.documents.length}</span>
              <Badge variant="outline" className="text-xs">
                {loan.documents.filter((d) => d.processed).length} processed
              </Badge>
            </div>
          </div>

          {/* ESG Score */}
          {loan.esgScore && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ESG Score</span>
                <span className="font-medium">{loan.esgScore}/100</span>
              </div>
              <Progress value={loan.esgScore} className="h-2" />
            </div>
          )}

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Link href={`/dashboard/loans/${loan.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
