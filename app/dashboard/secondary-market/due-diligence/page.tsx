"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Download,
  Zap,
  Shield,
  FileText,
  Activity,
  Search,
  Scale,
  Banknote,
  Leaf,
  Loader2,
  AlertOctagon,
  FileCheck,
  Landmark,
  Circle,
  BrainCircuit,
  LockKeyhole,
} from "lucide-react";
import { toast } from "sonner";
import loansData from "@/components/secondary-market/data/loans.json";

// --- Deep Dive Types ---

interface Citation {
  docName: string;
  page: number;
  clause?: string;
  textSnippet: string;
}

interface FinancialMetric {
  metric: string;
  actual: string;
  covenant: string;
  headroom: string;
  status: "pass" | "fail" | "warning";
}

interface DueDiligenceCheck {
  id: string;
  category: "Financial" | "Legal" | "Market" | "ESG";
  subCategory: string;
  check: string;
  status: "passed" | "warning" | "failed" | "pending";
  score: number;
  details: string;
  citation?: Citation;
  automated: boolean;
}

interface DueDiligenceReport {
  loanId: string;
  borrower: string;
  industry: string;
  overallScore: number;
  riskLevel: "low" | "medium" | "high";
  generatedAt: string;
  checks: DueDiligenceCheck[];
  financials: FinancialMetric[];
  documentsAnalyzed: Array<{
    name: string;
    type: string;
    status: "verified" | "pending";
  }>;
  recommendations: string[];
  estimatedValue: number;
  confidenceLevel: number;
}

const ANALYSIS_STEPS = [
  {
    id: 1,
    label: "Ingesting VDR Data",
    sub: "Connecting to secure data room...",
  },
  {
    id: 2,
    label: "OCR Document Processing",
    sub: "Parsing PDF financial statements...",
  },
  {
    id: 3,
    label: "Legal Clause Extraction",
    sub: "Analyzing LMA transfer provisions...",
  },
  {
    id: 4,
    label: "Financial Covenant Check",
    sub: "Calculating EBITDA & Leverage...",
  },
  {
    id: 5,
    label: "Market Risk Benchmarking",
    sub: "Comparing spreads against sector...",
  },
  { id: 6, label: "Finalizing Risk Score", sub: "Aggregating findings..." },
];

export default function DueDiligencePage() {
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeReport, setActiveReport] = useState<DueDiligenceReport | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "all" | "Financial" | "Legal" | "Market" | "ESG"
  >("all");

  // --- Helpers ---
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "warning":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "failed":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "warning":
        return <AlertTriangle className="h-3.5 w-3.5" />;
      case "failed":
        return <XCircle className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  // --- Logic ---
  const generateDueDiligenceReport = async () => {
    if (!selectedLoanId) {
      toast.error("Please select a loan position");
      return;
    }
    const selectedLoan = loansData.find((loan) => loan.id === selectedLoanId);
    if (!selectedLoan) return;

    setIsGenerating(true);
    setCurrentStep(0);
    setActiveReport(null);

    // Step-by-step loader logic
    let step = 0;
    const interval = setInterval(() => {
      if (step >= ANALYSIS_STEPS.length) {
        clearInterval(interval);
        finishGeneration(selectedLoan);
        return;
      }
      setCurrentStep(step);
      step++;
    }, 800); // 800ms per step
  };

  const finishGeneration = (selectedLoan: (typeof loansData)[0]) => {
    setTimeout(() => {
      setIsGenerating(false);

      const mockReport: DueDiligenceReport = {
        loanId: selectedLoan.id,
        borrower: selectedLoan.borrower,
        industry: selectedLoan.industry,
        overallScore: selectedLoan.dueDiligenceScore,
        riskLevel: selectedLoan.riskLevel as "low" | "medium" | "high",
        generatedAt: new Date().toISOString(),
        estimatedValue: selectedLoan.askingPrice,
        confidenceLevel: 96,
        documentsAnalyzed: [
          {
            name: "Senior Facility Agreement",
            type: "Legal",
            status: "verified",
          },
          {
            name: "FY23 Audited Accounts",
            type: "Financial",
            status: "verified",
          },
          { name: "Q3 Compliance Cert", type: "Financial", status: "verified" },
          {
            name: "Intercreditor Agreement",
            type: "Legal",
            status: "verified",
          },
          { name: "ESG Impact Report 2024", type: "ESG", status: "pending" },
        ],
        financials: [
          {
            metric: "Net Leverage",
            actual: "3.8x",
            covenant: "< 4.50x",
            headroom: "15.5%",
            status: "pass",
          },
          {
            metric: "Interest Cover",
            actual: "4.2x",
            covenant: "> 3.00x",
            headroom: "40.0%",
            status: "pass",
          },
          {
            metric: "Capex Spend",
            actual: "$12.5M",
            covenant: "< $15.0M",
            headroom: "16.6%",
            status: "warning",
          },
          {
            metric: "Fixed Charge",
            actual: "2.1x",
            covenant: "> 1.10x",
            headroom: "90.9%",
            status: "pass",
          },
        ],
        checks: [
          {
            id: "f1",
            category: "Financial",
            subCategory: "Covenant Compliance",
            check: "Net Leverage Headroom",
            status: selectedLoan.dueDiligenceScore > 80 ? "passed" : "warning",
            score: 88,
            automated: true,
            details:
              "Leverage remains within agreed parameters, though recent acquisition of Subsidiary B has increased debt load by 12%.",
            citation: {
              docName: "Compliance Cert Q3",
              page: 4,
              clause: "12.1 (Financial Condition)",
              textSnippet:
                "Consolidated Total Net Debt shall not exceed 4.50:1",
            },
          },
          {
            id: "l1",
            category: "Legal",
            subCategory: "Transferability",
            check: "Assignment & Transfer",
            status: "passed",
            score: 100,
            automated: true,
            details:
              "Standard LMA transfer provisions. No Borrower consent required for transfers to Approved Lenders or during an Event of Default.",
            citation: {
              docName: "Facility Agreement",
              page: 142,
              clause: "25.2 (Conditions of Assignment)",
              textSnippet:
                "The consent of the Borrower is not required for any assignment...",
            },
          },
          {
            id: "l2",
            category: "Legal",
            subCategory: "Control",
            check: "Change of Control Puts",
            status: "warning",
            score: 65,
            automated: false,
            details:
              "Lender put option triggers upon Change of Control, but 'Portability' clause applies if Net Leverage < 3.25x (Current: 3.8x).",
            citation: {
              docName: "Facility Agreement",
              page: 68,
              clause: "9.1 (Exit)",
              textSnippet:
                "Mandatory Prepayment shall not apply if Leverage Ratio is less than 3.25:1",
            },
          },
          {
            id: "m1",
            category: "Market",
            subCategory: "Valuation",
            check: "Market Price Verification",
            status: "passed",
            score: 92,
            automated: true,
            details: `Bid/Ask spread in secondary market for ${selectedLoan.industry} B+ credits has tightened to 50bps. Asset is priced inline.`,
            citation: {
              docName: "Bloomberg Pricing Feed",
              page: 1,
              textSnippet: "Sector Curve B+ 3Y: 98.50 / 99.00",
            },
          },
          {
            id: "e1",
            category: "ESG",
            subCategory: "Reporting",
            check: "SBTi Alignment",
            status: "failed",
            score: 45,
            automated: true,
            details:
              "Borrower has not yet submitted validation targets to Science Based Targets initiative (SBTi) despite facility incentives.",
            citation: {
              docName: "Sustainability Report",
              page: 12,
              textSnippet: "Target validation expected Q4 2025",
            },
          },
        ],
        recommendations: [
          "Monitor Capex spend; currently at 84% of covenant limit with one quarter remaining.",
          "Verify validity of 'Portability' clause given current leverage exceeds the 3.25x threshold.",
          "Request waiver for delayed SBTi submission to avoid margin ratchet penalty (+5 bps).",
        ],
      };
      setActiveReport(mockReport);
    }, 500); // Small delay after last step
  };

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
        <div className="flex flex-1 flex-col bg-background h-screen overflow-hidden">
          {/* --- PAGE HEADER --- */}
          <div className="shrink-0 border-b bg-background z-20 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Due Diligence Engine
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Automated document analysis & risk grading for secondary loan
                  opportunities
                </p>
              </div>
            </div>
          </div>

          {/* --- SEARCH & AUDIT BAR --- */}
          <div className="shrink-0 bg-muted/30 border-b px-6 py-4">
            <div className="flex items-center gap-6">
              <div className="flex-1 max-w-md">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Loan Position
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={selectedLoanId}
                    onValueChange={setSelectedLoanId}
                  >
                    <SelectTrigger className="pl-9 h-11 bg-background border-border">
                      <SelectValue placeholder="Search by borrower name, industry, or credit rating..." />
                    </SelectTrigger>
                    <SelectContent className="w-[400px]">
                      {loansData.map((loan) => (
                        <SelectItem
                          key={loan.id}
                          value={loan.id}
                          className="py-3"
                        >
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-semibold text-sm text-foreground">
                                {loan.borrower}
                              </span>
                              <span className="text-xs font-mono text-muted-foreground">
                                {formatCurrency(loan.outstandingAmount)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{loan.industry}</span>
                              <span>•</span>
                              <span>{loan.creditRating} Rated</span>
                              <span>•</span>
                              <span
                                className={`font-medium ${
                                  loan.riskLevel === "low"
                                    ? "text-emerald-600"
                                    : loan.riskLevel === "medium"
                                    ? "text-amber-600"
                                    : "text-red-600"
                                }`}
                              >
                                {loan.riskLevel} risk
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selected Loan Info */}
              {selectedLoanId && (
                <div className="flex-1 max-w-sm">
                  <div className="text-sm font-medium text-foreground mb-2">
                    Selected Position
                  </div>
                  <div className="bg-background border border-border rounded-lg p-3">
                    {(() => {
                      const selectedLoan = loansData.find(
                        (loan) => loan.id === selectedLoanId
                      );
                      return selectedLoan ? (
                        <div className="space-y-1">
                          <div className="font-semibold text-sm">
                            {selectedLoan.borrower}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{selectedLoan.industry}</span>
                            <span>•</span>
                            <span>
                              {formatCurrency(selectedLoan.outstandingAmount)}
                            </span>
                            <span>•</span>
                            <span
                              className={`font-medium ${
                                selectedLoan.riskLevel === "low"
                                  ? "text-emerald-600"
                                  : selectedLoan.riskLevel === "medium"
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {selectedLoan.riskLevel} risk
                            </span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

              <div className="flex items-end gap-3">
                <Button
                  onClick={generateDueDiligenceReport}
                  disabled={isGenerating || !selectedLoanId}
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running Audit...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Run Due Diligence Audit
                    </span>
                  )}
                </Button>

                {selectedLoanId && (
                  <Button variant="outline" className="h-11 px-4 border-border">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* --- MAIN WORKSPACE --- */}
          <div className="flex-1 overflow-auto bg-muted/10 p-6 relative">
            {/* Step-by-Step Loader Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="bg-card border shadow-2xl rounded-xl w-full max-w-md overflow-hidden">
                  <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <BrainCircuit className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        AI Analysis in Progress
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Processing VDR content for{" "}
                        {
                          loansData.find((l) => l.id === selectedLoanId)
                            ?.borrower
                        }
                      </p>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="relative">
                      {/* Connector Line */}
                      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-muted" />

                      {ANALYSIS_STEPS.map((step, idx) => {
                        const isActive = idx === currentStep;
                        const isCompleted = idx < currentStep;

                        return (
                          <div
                            key={step.id}
                            className="relative flex items-start gap-4 mb-5 last:mb-0 z-10"
                          >
                            <div
                              className={`
                                                flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300
                                                ${
                                                  isCompleted
                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                    : isActive
                                                    ? "bg-background border-primary text-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                    : "bg-background border-muted text-muted-foreground"
                                                }
                                            `}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : isActive ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Circle className="h-3 w-3" />
                              )}
                            </div>
                            <div
                              className={`transition-all duration-300 ${
                                isActive ? "translate-x-1" : ""
                              }`}
                            >
                              <p
                                className={`text-sm font-medium ${
                                  isActive
                                    ? "text-foreground"
                                    : isCompleted
                                    ? "text-foreground/80"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {isActive ? step.sub : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-muted/30 px-6 py-3 border-t text-center">
                    <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-2">
                      <LockKeyhole className="h-3 w-3" />
                      End-to-End Encryption Enabled
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!activeReport && !isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <Landmark className="h-24 w-24 mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Waiting for Input</h2>
                <p>Select a loan to begin the due diligence process.</p>
              </div>
            ) : activeReport ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-20">
                {/* --- LEFT COLUMN: DATA INVENTORY & FINANCIALS --- */}
                <div className="xl:col-span-4 space-y-6">
                  {/* 1. Scorecard */}
                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-4xl font-bold tracking-tight">
                            {activeReport.overallScore}
                          </div>
                          <div className="text-xs font-semibold uppercase text-muted-foreground mt-1">
                            Weighted Score
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge
                            variant="outline"
                            className={`font-bold ${
                              activeReport.riskLevel === "low"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : activeReport.riskLevel === "medium"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            {activeReport.riskLevel.toUpperCase()} RISK
                          </Badge>
                          <div className="text-[10px] text-muted-foreground">
                            Confidence: {activeReport.confidenceLevel}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Asking Price
                          </p>
                          <p className="font-mono font-medium text-lg">
                            {formatCurrency(activeReport.estimatedValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Industry
                          </p>
                          <p className="font-medium text-sm">
                            {activeReport.industry}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 2. Covenant Monitor */}
                  <Card>
                    <CardHeader className="pb-2 bg-muted/20 border-b py-3">
                      <CardTitle className="text-xs font-bold uppercase flex items-center gap-2 tracking-wider text-muted-foreground">
                        <Banknote className="h-3.5 w-3.5" />
                        Financial Covenants
                      </CardTitle>
                    </CardHeader>
                    <div className="p-0">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/10 text-[10px] uppercase text-muted-foreground font-semibold">
                          <tr>
                            <th className="text-left px-4 py-2">Metric</th>
                            <th className="text-right px-4 py-2">Actual</th>
                            <th className="text-right px-4 py-2">Limit</th>
                            <th className="text-right px-4 py-2">Headroom</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {activeReport.financials.map((fin, i) => (
                            <tr
                              key={i}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <td className="px-4 py-2.5 font-medium">
                                {fin.metric}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                                {fin.actual}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                                {fin.covenant}
                              </td>
                              <td
                                className={`px-4 py-2.5 text-right font-mono font-bold ${
                                  fin.status === "pass"
                                    ? "text-emerald-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {fin.headroom}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* 3. Document Inventory */}
                  <Card>
                    <CardHeader className="pb-2 bg-muted/20 border-b py-3">
                      <CardTitle className="text-xs font-bold uppercase flex items-center gap-2 tracking-wider text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        VDR Inventory
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {activeReport.documentsAnalyzed.map((doc, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-4 py-2.5 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-1.5 w-1.5 rounded-full ${
                                  doc.status === "verified"
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                                }`}
                              />
                              <span className="truncate max-w-[180px] font-medium text-foreground">
                                {doc.name}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 font-normal"
                            >
                              {doc.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* --- RIGHT COLUMN: DETAILED AUDIT LEDGER --- */}
                <div className="xl:col-span-8 space-y-4">
                  {/* Custom Tabs */}
                  <div className="flex items-center justify-between">
                    <div className="flex bg-background border p-1 rounded-lg shadow-sm">
                      {(
                        ["all", "Financial", "Legal", "Market", "ESG"] as const
                      ).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                            activeTab === tab
                              ? "bg-muted text-foreground font-semibold shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-2 text-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export Legal Report
                    </Button>
                  </div>

                  {/* Main Ledger Card */}
                  <Card className="overflow-hidden border-border/80 shadow-sm">
                    <div className="grid grid-cols-12 gap-4 border-b bg-muted/30 px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <div className="col-span-2">Status</div>
                      <div className="col-span-9">Audit Check & Evidence</div>
                      <div className="col-span-1 text-right">Score</div>
                    </div>

                    <div className="divide-y">
                      {activeReport.checks
                        .filter(
                          (c) => activeTab === "all" || c.category === activeTab
                        )
                        .map((check) => (
                          <div
                            key={check.id}
                            className="group grid grid-cols-12 gap-4 px-6 py-5 items-start hover:bg-muted/10 transition-colors"
                          >
                            {/* Status Column */}
                            <div className="col-span-2 pt-1">
                              <Badge
                                variant="outline"
                                className={`w-fit font-medium gap-1.5 pl-1.5 pr-2.5 py-1 text-[10px] uppercase ${getStatusColor(
                                  check.status
                                )}`}
                              >
                                {getStatusIcon(check.status)}
                                {check.status}
                              </Badge>
                              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                {check.category === "Financial" && (
                                  <Banknote className="h-3 w-3" />
                                )}
                                {check.category === "Legal" && (
                                  <Scale className="h-3 w-3" />
                                )}
                                {check.category === "Market" && (
                                  <Activity className="h-3 w-3" />
                                )}
                                {check.category === "ESG" && (
                                  <Leaf className="h-3 w-3" />
                                )}
                                {check.category}
                              </div>
                            </div>

                            {/* Content Column */}
                            <div className="col-span-9 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  {check.check}
                                  {check.automated && (
                                    <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-medium">
                                      <Zap className="h-2 w-2" /> AI
                                    </span>
                                  )}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {check.subCategory}
                                </span>
                              </div>

                              <p className="text-sm text-foreground/80 leading-relaxed">
                                {check.details}
                              </p>

                              {/* EVIDENCE BOX: The "Depth" feature */}
                              {check.citation && (
                                <div className="mt-2 rounded-md bg-muted/40 border border-border/50 p-3 text-xs">
                                  <div className="flex items-center gap-2 mb-1.5 text-muted-foreground font-medium">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>
                                      Source: {check.citation.docName}
                                    </span>
                                    <span className="text-muted-foreground/50">
                                      •
                                    </span>
                                    <span>Page {check.citation.page}</span>
                                    {check.citation.clause && (
                                      <span>
                                        • Clause {check.citation.clause}
                                      </span>
                                    )}
                                  </div>
                                  <div className="pl-2 border-l-2 border-primary/20 italic text-muted-foreground font-serif bg-background/50 p-1.5 rounded-r">
                                    &ldquo;{check.citation.textSnippet}&rdquo;
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Score Column */}
                            <div className="col-span-1 text-right pt-1">
                              <div
                                className={`text-sm font-bold font-mono ${
                                  check.score >= 80
                                    ? "text-emerald-600"
                                    : check.score >= 60
                                    ? "text-amber-600"
                                    : "text-red-600"
                                }`}
                              >
                                {check.score}
                              </div>
                              <div className="text-[9px] text-muted-foreground mt-0.5">
                                PTS
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>

                  {/* Recommendations Footer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {activeReport.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-4 rounded-lg border bg-card shadow-sm text-sm items-start"
                      >
                        <AlertOctagon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-foreground/90">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
