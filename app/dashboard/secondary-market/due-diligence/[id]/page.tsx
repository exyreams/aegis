"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Download,
  Shield,
  FileText,
  Banknote,
  Loader2,
  AlertOctagon,
  Landmark,
  LockKeyhole,
  ChevronLeft,
  Eye,
  FileSearch
} from "lucide-react";
import { toast } from "sonner";
import {
  WideModal,
  WideModalContent,
} from "@/components/ui/WideModal";
import loansData from "@/components/secondary-market/data/loans.json";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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
  estimatedAt?: string;
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

// --- Constants ---
const MOCK_DELAY = 1200; // Optimal duration for feedback awareness without frustration

export default function DueDiligenceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.id as string;
  
  const [isGenerating, setIsGenerating] = useState(true);
  const [activeReport, setActiveReport] = useState<DueDiligenceReport | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "Financial" | "Legal" | "Market" | "ESG">("all");
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const selectedLoan = loansData.find((loan) => loan.id === loanId);

  // --- Helpers ---
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

  const handleExportPDF = async (mode: "download" | "preview" = "download") => {
    if (!activeReport || !selectedLoan) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // --- Header ---
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 40, "F");
    
    // Logo & Branding
    try {
      const img = new Image();
      img.src = "/aegis_dark.png"; // Light logo for dark header
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      doc.addImage(img, "PNG", 14, 12, 12, 12);
    } catch (e) {
      console.error("Logo load failed", e);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("AEGIS", 32, 21); // Shifted right for logo
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Due Diligence Report", 32, 29); // Shifted right
    
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 32, 37); // Shifted right
    doc.text(`Report ID: ${activeReport.loanId}-AUDIT`, pageWidth - 14, 26, { align: "right" });
    doc.text(`Confidence: ${activeReport.confidenceLevel}%`, pageWidth - 14, 34, { align: "right" });

    y = 50;

    // --- Executive Summary ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); // Slate 500
    
    const summaryLines = [
      `Borrower: ${activeReport.borrower}`,
      `Industry: ${activeReport.industry}`,
      `Estimated Value: ${formatCurrency(activeReport.estimatedValue)}`,
      `Original Lender: ${selectedLoan.originalLender}`,
      `Maturity Date: ${selectedLoan.maturityDate}`,
    ];
    summaryLines.forEach(line => {
      doc.text(line, 14, y);
      y += 6;
    });
    y += 4;

    // --- Score Badge ---
    const scoreX = pageWidth - 50;
    const scoreY = 50;
    const scoreColor = activeReport.overallScore >= 80 ? [16, 185, 129] : activeReport.overallScore >= 60 ? [245, 158, 11] : [239, 68, 68];
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.roundedRect(scoreX, scoreY, 36, 24, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(String(activeReport.overallScore), scoreX + 18, scoreY + 14, { align: "center" });
    doc.setFontSize(7);
    doc.text(activeReport.riskLevel.toUpperCase() + " RISK", scoreX + 18, scoreY + 20, { align: "center" });

    y += 6;

    // --- Covenant Compliance Table ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Covenant Compliance", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Actual", "Covenant", "Headroom", "Status"]],
      body: activeReport.financials.map(f => [
        f.metric,
        f.actual,
        f.covenant,
        f.headroom,
        f.status.toUpperCase()
      ]),
      theme: "grid",
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        4: { halign: "center", fontStyle: "bold" }
      },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === "body") {
          const status = String(data.cell.raw).toLowerCase();
          if (status === "pass") {
            data.cell.styles.textColor = [16, 185, 129];
          } else if (status === "warning") {
            data.cell.styles.textColor = [245, 158, 11];
          } else if (status === "fail") {
            data.cell.styles.textColor = [239, 68, 68];
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

    // --- Audit Checks Table ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Audit Analysis & Evidence", 14, y);
    y += 6;
    
    autoTable(doc, {
      startY: y,
      head: [["Category", "Check", "Status", "Score", "Source"]],
      body: activeReport.checks.map(c => [
        c.category,
        c.check,
        c.status.toUpperCase(),
        String(c.score),
        c.citation ? `${c.citation.docName} (p.${c.citation.page})` : "N/A"
      ]),
      theme: "grid",
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        2: { halign: "center", fontStyle: "bold" },
        3: { halign: "center" }
      },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          const status = String(data.cell.raw).toLowerCase();
          if (status === "passed") {
            data.cell.styles.textColor = [16, 185, 129];
          } else if (status === "warning") {
            data.cell.styles.textColor = [245, 158, 11];
          } else if (status === "failed") {
            data.cell.styles.textColor = [239, 68, 68];
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

    // --- Recommendations ---
    if (y < 250) {
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Recommendations", 14, y);
      y += 8;
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      activeReport.recommendations.forEach((rec, i) => {
        if (y < 280) {
          const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, pageWidth - 28);
          doc.text(lines, 14, y);
          y += lines.length * 5 + 3;
        }
      });
    }

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: "center" });
      doc.text("Aegis • Automated Due Diligence Platform", 14, 290);
    }

    if (mode === "preview") {
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(pdfUrl);
    } else {
      doc.save(`aegis-audit-report-${activeReport.loanId}.pdf`);
      toast.success("PDF exported successfully!");
    }
  };
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

  const finishGeneration = (loan: typeof loansData[0]) => {
    setTimeout(() => {
      setIsGenerating(false);

      const mockReport: DueDiligenceReport = {
        loanId: loan.id,
        borrower: loan.borrower,
        industry: loan.industry,
        overallScore: loan.dueDiligenceScore,
        riskLevel: loan.riskLevel as "low" | "medium" | "high",
        generatedAt: new Date().toISOString(),
        estimatedAt: "Q4 2023",
        estimatedValue: loan.askingPrice,
        confidenceLevel: 96,
        documentsAnalyzed: [
          { name: "Senior Facility Agreement", type: "Legal", status: "verified" },
          { name: "FY23 Audited Accounts", type: "Financial", status: "verified" },
          { name: "Q3 Compliance Cert", type: "Financial", status: "verified" },
          { name: "Intercreditor Agreement", type: "Legal", status: "verified" },
          { name: "ESG Impact Report 2024", type: "ESG", status: "pending" },
        ],
        financials: [
          { metric: "Net Leverage", actual: "3.8x", covenant: "< 4.50x", headroom: "15.5%", status: "pass" },
          { metric: "Interest Cover", actual: "4.2x", covenant: "> 3.00x", headroom: "40.0%", status: "pass" },
          { metric: "Capex Spend", actual: "$12.5M", covenant: "< $15.0M", headroom: "16.6%", status: "warning" },
          { metric: "Fixed Charge", actual: "2.1x", covenant: "> 1.10x", headroom: "90.9%", status: "pass" },
        ],
        checks: [
          {
            id: "f1",
            category: "Financial",
            subCategory: "Covenant Compliance",
            check: "Net Leverage Headroom",
            status: loan.dueDiligenceScore > 80 ? "passed" : "warning",
            score: 88,
            automated: true,
            details: "Leverage remains within agreed parameters, though recent acquisition of Subsidiary B has increased debt load by 12%.",
            citation: {
              docName: "Compliance Cert Q3",
              page: 4,
              clause: "12.1 (Financial Condition)",
              textSnippet: "Consolidated Total Net Debt shall not exceed 4.50:1",
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
            details: "Standard LMA transfer provisions. No Borrower consent required for transfers to Approved Lenders or during an Event of Default.",
            citation: {
              docName: "Facility Agreement",
              page: 142,
              clause: "25.2 (Conditions of Assignment)",
              textSnippet: "The consent of the Borrower is not required for any assignment...",
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
            details: `Bid/Ask spread in secondary market for ${loan.industry} B+ credits has tightened to 50bps. Asset is priced inline.`,
            citation: {
              docName: "Bloomberg Pricing Feed",
              page: 1,
              textSnippet: "Sector Curve B+ 3Y: 98.50 / 99.00",
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
      toast.success(`Due diligence completed for ${loan.borrower}`);
    }, 500);
  };

  useEffect(() => {
    if (!selectedLoan) {
      toast.error("Loan position not found");
      router.push("/dashboard/secondary-market/due-diligence");
      return;
    }

    // Trigger instant generation (with minimal UX buffer)
    const timer = setTimeout(() => {
      finishGeneration(selectedLoan as typeof loansData[0]);
    }, MOCK_DELAY);

    return () => clearTimeout(timer);
  }, [loanId, selectedLoan, router]);

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-background h-screen overflow-hidden">
          {/* --- PAGE HEADER --- */}
          <div className="shrink-0 border-b bg-background z-20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()}
                  className="rounded-full h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-foreground">
                    Audit Report: {selectedLoan?.borrower}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Deep-dive automated analysis • ID: {loanId}
                  </p>
                </div>
              </div>
              
              {!isGenerating && activeReport && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-4"
                    onClick={() => handleExportPDF("download")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 px-3"
                    onClick={() => handleExportPDF("preview")}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button className="h-9 px-4 bg-blue-600 hover:bg-blue-700">
                    Express Interest
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* --- MAIN WORKSPACE --- */}
          <div className="flex-1 overflow-auto bg-muted/10 p-6 relative">
            {/* Step-by-Step Loader Overlay */}
            {/* Elegant Feedback Spinner */}
            {isGenerating && (
              <div className="absolute inset-0 z-50 bg-background/40 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
                <div className="flex flex-col items-center gap-6 p-12 rounded-3xl bg-background/80 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <div className="relative h-16 w-16 rounded-full bg-background flex items-center justify-center border-2 border-primary/10">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-center">
                    <h3 className="text-lg font-bold tracking-tight">Synchronizing Audit Data</h3>
                    <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">
                      AI Engine is mapping VDR sources and verifying compliance...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!activeReport && !isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <Landmark className="h-24 w-24 mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Waiting for Input</h2>
                <p>Retrieving loan position details...</p>
              </div>
            ) : activeReport ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-20">
                {/* --- LEFT COLUMN --- */}
                <div className="xl:col-span-4 space-y-6">
                  {/* Scorecard */}
                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-4xl font-bold tracking-tight">{activeReport.overallScore}</div>
                          <div className="text-[10px] font-bold uppercase text-muted-foreground mt-1 tracking-wider">
                            Weighted Risk Score
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant="outline" className={`font-bold ${
                            activeReport.riskLevel === "low" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                            activeReport.riskLevel === "medium" ? "text-amber-700 bg-amber-50 border-amber-200" :
                            "text-red-700 bg-red-50 border-red-200"
                          }`}>
                            {activeReport.riskLevel.toUpperCase()} RISK
                          </Badge>
                          <div className="text-[10px] text-muted-foreground">Confidence: {activeReport.confidenceLevel}%</div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Estimated Value
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

                  {/* Financial Metrics Table */}
                  <Card>
                    <CardHeader className="pb-2 bg-muted/20 border-b py-3">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Banknote className="h-3.5 w-3.5" /> Financial Covenants
                      </CardTitle>
                    </CardHeader>
                    <div className="p-0">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/10 text-[10px] uppercase text-muted-foreground">
                          <tr>
                            <th className="text-left px-4 py-2">Metric</th>
                            <th className="text-right px-4 py-2">Actual</th>
                            <th className="text-right px-4 py-2">Limit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {activeReport.financials.map((fin, i) => (
                            <tr key={i} className="hover:bg-muted/30">
                              <td className="px-4 py-2 font-medium">{fin.metric}</td>
                              <td className="px-4 py-2 text-right font-mono text-muted-foreground">{fin.actual}</td>
                              <td className="px-4 py-2 text-right font-mono text-muted-foreground">{fin.covenant}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* VDR Inventory */}
                  <Card>
                    <CardHeader className="pb-2 bg-muted/20 border-b py-3">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" /> VDR Inventory
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/50">
                        {activeReport.documentsAnalyzed.map((doc, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-2 text-[11px]">
                            <div className="flex items-center gap-2 truncate">
                              <div className={`h-1.5 w-1.5 rounded-full ${doc.status === "verified" ? "bg-emerald-500" : "bg-amber-500"}`} />
                              <span className="truncate text-foreground/80">{doc.name}</span>
                            </div>
                            <span className="text-[9px] text-muted-foreground font-mono uppercase">{doc.type}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="xl:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex bg-background border p-1 rounded-lg">
                      {["all", "Financial", "Legal", "Market", "ESG"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as "all" | "Financial" | "Legal" | "Market" | "ESG")}
                          className={`px-3 py-1 text-[11px] font-semibold rounded transition-all ${
                            activeTab === tab ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Card className="overflow-hidden border-border/60 shadow-sm">
                    <div className="grid grid-cols-12 gap-4 border-b bg-muted/20 px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <div className="col-span-2">Status</div>
                      <div className="col-span-9">Audit Analysis & Evidence</div>
                      <div className="col-span-1 text-right">Score</div>
                    </div>
                    <div className="divide-y divide-border/60">
                      {activeReport.checks
                        .filter(c => activeTab === "all" || c.category === activeTab)
                        .map((check) => (
                          <div key={check.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-start hover:bg-muted/5 transition-colors">
                            <div className="col-span-2 pt-1">
                              <Badge variant="outline" className={`w-fit text-[9px] uppercase gap-1 px-1.5 py-0.5 ${getStatusColor(check.status)}`}>
                                {getStatusIcon(check.status)} {check.status}
                              </Badge>
                              <div className="mt-2 flex items-center gap-1 text-[9px] text-muted-foreground opacity-60">
                                {check.category}
                              </div>
                            </div>
                            <div className="col-span-9 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold flex items-center gap-2">
                                  {check.check}
                                  {check.automated && <Badge variant="secondary" className="h-4 text-[8px] bg-blue-50 text-blue-600 border-blue-100">AI Verified</Badge>}
                                </h4>
                                <span className="text-[10px] text-muted-foreground">{check.subCategory}</span>
                              </div>
                              <p className="text-sm text-foreground/70 leading-relaxed">{check.details}</p>
                               {check.citation && (
                                <div 
                                  onClick={() => {
                                    setSelectedCitation(check.citation!);
                                    setIsModalOpen(true);
                                  }}
                                  className="mt-2 rounded-xl bg-muted/20 border border-muted-foreground/10 p-3.5 cursor-pointer hover:bg-muted/40 hover:border-primary/40 group transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                      <FileText className="h-3.5 w-3.5 opacity-70" />
                                      <span>Source: {check.citation.docName} • Page {check.citation.page}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary/70 group-hover:text-primary transition-all uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                                      <Eye className="h-3 w-3" />
                                      Verify Source
                                    </div>
                                  </div>
                                  <div className="pl-3.5 border-l-2 border-primary/20 italic text-[11px] text-foreground/80 font-serif leading-relaxed group-hover:border-primary/50 transition-colors">
                                    &ldquo;{check.citation.textSnippet}&rdquo;
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="col-span-1 text-right">
                              <div className={`font-mono font-bold text-sm ${check.score >= 80 ? "text-emerald-600" : check.score >= 60 ? "text-amber-600" : "text-red-600"}`}>
                                {check.score}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>

                  {/* Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {activeReport.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 p-4 rounded-xl border bg-card/50 shadow-sm text-xs items-start">
                        <AlertOctagon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-foreground/80 font-medium">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </SidebarInset>

      {/* --- SOURCE EVIDENCE MODAL (POLISHED) --- */}
      <WideModal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <WideModalContent className="max-w-6xl h-[90vh] bg-[#F1F3F5] dark:bg-[#0F1113] border-none overflow-hidden flex flex-col">
          {/* Modal Toolbar */}
          <div className="shrink-0 bg-background border-b dark:bg-[#1A1C1E] px-6 py-3 flex items-center justify-between z-30 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <FileSearch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  Source Evidence Verification
                  <Badge className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50 h-5 text-[10px]">
                    VDR SOURCE: ACTIVE
                  </Badge>
                </h3>
                <p className="text-[10px] text-muted-foreground font-mono">
                  REF ID: {loanId}-AUDIT-{selectedCitation?.clause?.replace(/\s+/g, '-') || "GENERIC"} • INTEGRITY HASH: SHA256-8a7c2...
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-[10px] text-muted-foreground border">
                <LockKeyhole className="h-3 w-3" />
                SECURE DOCUMENT VIEW
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setIsModalOpen(false)}>
                Close Audit
              </Button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Main Document Area */}
            <div className="flex-1 overflow-auto p-4 md:p-12 bg-[#D1D5DB] dark:bg-[#1A1C1E] flex flex-col items-center">
              {/* The "Real" Document Page */}
              <div className="w-full max-w-[850px] bg-[#FEFEFE] dark:bg-[#242629] shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-sm p-16 md:p-24 relative min-h-[1100px] transform rotate-[0.3deg] origin-center">
                {/* Legal Header */}
                <div className="flex justify-between items-start mb-16">
                  <div className="space-y-1 font-serif">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40">STRICTLY PRIVILEGED & CONFIDENTIAL</p>
                    <p className="text-[10px] font-bold tracking-[0.1em] uppercase opacity-30">EXECUTION VERSION</p>
                  </div>
                  <div className="text-right font-serif opacity-30">
                    <p className="text-[10px] font-bold uppercase">DATED AS OF</p>
                    <p className="text-[10px] font-bold uppercase">{selectedLoan?.maturityDate || "OCTOBER 2023"}</p>
                  </div>
                </div>

                <div className="text-center mb-16 font-serif underline decoration-1 underline-offset-4">
                  <h2 className="text-lg font-bold uppercase tracking-widest">{selectedCitation?.docName || "CREDIT AGREEMENT"}</h2>
                </div>

                {/* Sub-header */}
                <div className="mb-10 text-[14px] font-serif leading-relaxed space-y-4">
                  <p><strong>BETWEEN:</strong></p>
                  <div className="pl-8 opacity-60">
                    <p>(1) <strong>{selectedLoan?.borrower || "THE BORROWER"}</strong> as Original Borrower;</p>
                    <p>(2) <strong>{selectedLoan?.originalLender || "THE LENDER"}</strong> as Administrative Agent and Arranger;</p>
                  </div>
                </div>

                {/* Document Body Text */}
                <div className="space-y-3 text-[15px] leading-[1.7] text-foreground/80 font-serif">
                  <p className="opacity-30">
                    SECTION 1. DEFINITIONS AND INTERPRETATION. In this Agreement, any term defined in the LMA standard terms shall have 
                    the same meaning when used herein unless otherwise expressly provided.
                  </p>
                  <p className="opacity-30">
                    ... (Recitals omitted) ...
                  </p>
                  
                  <div className="relative mt-12 mb-12">
                     <p className="opacity-30 mb-6">
                      SECTION 12. FINANCIAL COVENANTS. The Borrower shall ensure that the following financial ratios are maintained 
                      at all times during the Term:
                    </p>
                    
                    {/* ENHANCED HIGHLIGHT CORE */}
                    <div className="relative isolate py-4">
                      {/* Highlight Background */}
                      <div className="absolute -inset-x-6 -inset-y-2 bg-blue-500/10 dark:bg-blue-400/10 border-l-4 border-blue-500 rounded-r-md z-0" />
                    
                      <div className="relative z-10 leading-relaxed pl-2 font-bold text-foreground">
                        <span className="bg-yellow-200/50 dark:bg-yellow-500/20 px-1 py-0.5 rounded">
                          Clause {selectedCitation?.clause || "12.1"} • {selectedCitation?.textSnippet}
                        </span>
                      </div>
                      
                      {/* AI Reasoning Tag */}
                      <div className="mt-4 ml-2 max-w-sm">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600">
                          <CheckCircle2 className="h-3 w-3" /> AI VERIFICATION COMPLETE
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-normal italic">
                          Document integrity verified against VDR hash. Text extraction confidence: 99.8% (OCR Tier 1).
                        </p>
                      </div>
                    </div>

                    <p className="opacity-30 mt-6">
                      (b) INTEREST COVER: The ratio of EBITDA to Interest Expense for any Measurement Period ending on a Quarter Date 
                      shall not be less than 3.00:1.
                    </p>
                  </div>
                  
                  <p className="opacity-30">
                    SECTION 13. NEGATIVE PLEDGE. Except as permitted under Section 13.2, the Borrower shall not, and shall procure 
                    that no other member of the Group will, create or permit to subsist any Security over any of its assets.
                  </p>
                </div>

                {/* Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.02] select-none text-[10rem] font-black text-foreground">
                  AEGIS AUDIT
                </div>

                {/* Footnote */}
                <div className="absolute bottom-12 left-24 right-24 flex justify-between items-center text-[9px] text-muted-foreground font-serif border-t pt-4 opacity-50">
                  <span>REF: {loanId}/EXEC/FINAL</span>
                  <span className="font-bold">PAGE {selectedCitation?.page} OF 248</span>
                  <span>VERSION 4.2.0</span>
                </div>
              </div>

              {/* Document "Stack" Effect */}
              <div className="w-full max-w-[850px] h-4 bg-[#FEFEFE] dark:bg-[#242629]/50 shadow-md transform rotate-[-0.2deg] -mt-2 opacity-50" />
              <div className="w-full max-w-[850px] h-4 bg-[#FEFEFE] dark:bg-[#242629]/30 shadow-md transform rotate-[0.1deg] -mt-3 opacity-30" />
            </div>

            {/* AI Review Sidebar */}
            <div className="w-80 shrink-0 bg-background border-l p-6 overflow-auto z-20 space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expert Review</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg border text-xs">
                    <p className="font-bold mb-1">AI Audit Logic</p>
                    <p className="text-muted-foreground leading-relaxed">
                      Matches covenant requirements in Section 12 against current financial datasets. Cross-referenced with intercreditor priorities.
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-800 text-xs">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">Pass Criterion</p>
                    <p className="text-emerald-600/80 dark:text-emerald-500/80 leading-relaxed">
                      Verification successful. No conflicting side letters or amendments found in the VDR index.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Audit Trace</h4>
                <div className="space-y-4">
                  {[
                    { label: "Document Ingested", time: "2m ago", status: "success" },
                    { label: "OCR Layer Applied", time: "2m ago", status: "success" },
                    { label: "Clause Mapping", time: "1m ago", status: "success" },
                    { label: "Final Risk Scoring", time: "Just now", status: "active" },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="shrink-0 mt-1">
                        {step.status === "success" ? (
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-medium leading-none">{step.label}</p>
                        <p className="text-[10px] text-muted-foreground">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 mt-auto">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-xs">
                  Request Human Review
                </Button>
              </div>
            </div>
          </div>
        </WideModalContent>
      </WideModal>

      {/* --- PDF PREVIEW MODAL --- */}
      <WideModal open={!!pdfPreviewUrl} onOpenChange={(open) => !open && setPdfPreviewUrl(null)}>
        <WideModalContent showCloseButton={false} className="max-w-7xl h-[90vh] bg-background border-none overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="shrink-0 bg-background border-b px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold">PDF Preview</h3>
                <p className="text-[10px] text-muted-foreground">
                  Audit Report • {activeReport?.borrower}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                className="h-8 px-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  handleExportPDF("download");
                  setPdfPreviewUrl(null);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8" 
                onClick={() => setPdfPreviewUrl(null)}
              >
                Close
              </Button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 bg-muted/30 p-4">
            {pdfPreviewUrl && (
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-full rounded-lg border shadow-sm bg-white"
                title="PDF Preview"
              />
            )}
          </div>
        </WideModalContent>
      </WideModal>
    </SidebarProvider>
  );
}
