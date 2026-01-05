"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { toast } from "sonner";
import {
  FileBarChart,
  Download,
  Calendar,
  Plus,
  Eye,
  Share,
  BarChart3,
  TrendingUp,
  FileText,
  Clock,
  Shield,
  FileSearch,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  WideModal,
  WideModalContent,
  WideModalTitle,
  WideModalDescription,
} from "@/components/ui/WideModal";

interface ESGReport {
  id: string;
  title: string;
  type: "quarterly" | "annual" | "custom" | "regulatory";
  period: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  metrics: number;
  pages: number;
  downloadUrl?: string;
}

export default function ESGReportsPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock reports data
  const [reports] = useState<ESGReport[]>([
    {
      id: "1",
      title: "Q4 2024 ESG Performance Report",
      type: "quarterly",
      period: "Q4 2024",
      status: "published",
      createdAt: "2024-12-01",
      updatedAt: "2024-12-15",
      metrics: 25,
      pages: 42,
      downloadUrl: "/reports/q4-2024-esg.pdf",
    },
    {
      id: "2",
      title: "Annual Sustainability Report 2024",
      type: "annual",
      period: "2024",
      status: "draft",
      createdAt: "2024-11-15",
      updatedAt: "2024-12-20",
      metrics: 45,
      pages: 78,
    },
    {
      id: "3",
      title: "Carbon Footprint Assessment",
      type: "custom",
      period: "Jan-Nov 2024",
      status: "published",
      createdAt: "2024-10-01",
      updatedAt: "2024-11-30",
      metrics: 12,
      pages: 28,
      downloadUrl: "/reports/carbon-footprint-2024.pdf",
    },
    {
      id: "4",
      title: "Q3 2024 ESG Performance Report",
      type: "quarterly",
      period: "Q3 2024",
      status: "archived",
      createdAt: "2024-09-01",
      updatedAt: "2024-09-30",
      metrics: 23,
      pages: 38,
      downloadUrl: "/reports/q3-2024-esg.pdf",
    },
    {
      id: "5",
      title: "EU Taxonomy & SFDR Alignment Pack",
      type: "regulatory",
      period: "FY 2024",
      status: "published",
      createdAt: "2024-12-15",
      updatedAt: "2024-12-18",
      metrics: 154,
      pages: 120,
      downloadUrl: "/reports/regulatory-alignment-2024.pdf",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800 font-bold";
      case "draft":
        return "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-400 dark:border-amber-800 font-bold";
      case "archived":
        return "bg-zinc-500/10 text-zinc-700 border-zinc-200 dark:text-zinc-400 dark:border-zinc-800";
      default:
        return "bg-zinc-500/10 text-zinc-700 border-zinc-200 dark:text-zinc-400 dark:border-zinc-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "quarterly":
        return <Calendar className="h-4 w-4" />;
      case "annual":
        return <BarChart3 className="h-4 w-4" />;
      case "custom":
        return <FileText className="h-4 w-4" />;
      case "regulatory":
        return <Shield className="h-4 w-4 text-emerald-600" />;
      default:
        return <FileBarChart className="h-4 w-4" />;
    }
};

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<ESGReport | null>(null);

  const handleGenerateReport = () => {
    toast.success("Regulatory Alignment Pack generated!");
  };

  const handleExportPDF = async (report: ESGReport) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // --- Header ---
    doc.setFillColor(15, 23, 42); // Navy / Navy
    doc.rect(0, 0, pageWidth, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("AEGIS ESG", 14, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(report.title, 14, 33);
    doc.text(`Period: ${report.period}`, pageWidth - 14, 33, { align: "right" });

    y = 55;

    // --- Summary Section ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Regulatory Summary", 14, y);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["Framework", "Status", "Alignment Score", "Data Trust"]],
      body: [
        ["SFDR Article 8", "ALIGNED", "92%", "HIGH"],
        ["EU Taxonomy", "PARTIAL", "74%", "MEDIUM"],
        ["TCFD Disclosures", "ALIGNED", "88%", "HIGH"],
      ],
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
    });

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

    // --- Detail Table ---
    doc.text("Metric Breakdown", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Metric Category", "Score", "vs Industry", "Verification"]],
      body: [
        ["Carbon Intensity", "85/100", "+12%", "SATELLITE"],
        ["Supply Chain Risk", "72/100", "-5%", "IOT/AUDIT"],
        ["Board Diversity", "90/100", "+15%", "LEGAL"],
      ],
      theme: "striped",
    });

    doc.save(`${report.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    toast.success("PDF exported successfully!");
  };

  const handleDownloadReport = (report: ESGReport) => {
    handleExportPDF(report);
  };

  const handleViewReport = (report: ESGReport) => {
    setActiveReport(report);
    setIsPreviewOpen(true);
  };

  const handleShareReport = (_report: ESGReport) => {
    toast.success("Immutable report hash shared to facility explorer!");
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesStatus =
      filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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
              {/* Header */}
              <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    ESG Reports
                  </h1>
                  <p className="text-muted-foreground">
                    Generate and manage comprehensive ESG performance reports
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/10" onClick={() => toast.success("Scanning portfolio for regulatory gaps...")}>
                    <Shield className="h-4 w-4 mr-2" />
                    Regulatory Alignment Pack
                  </Button>
                  <Button onClick={handleGenerateReport}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>

              {/* Regulatory Banner */}
              <div className="px-4 lg:px-6">
                <div className="bg-linear-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-full">
                      <Shield className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">Institutional ESG Reporting</h3>
                      <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">Your portfolio is currently **84% aligned** with SFDR Article 8 requirements. Generate a gap analysis report.</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => toast.info("Generating Gap Analysis...")}>
                    Gap Analysis
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <FileBarChart className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {reports.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Reports
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {
                              reports.filter((r) => r.status === "published")
                                .length
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Published
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                          <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {reports.filter((r) => r.status === "draft").length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            In Progress
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {reports.reduce((sum, r) => sum + r.metrics, 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Metrics
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Filters */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports Library</CardTitle>
                    <CardDescription>
                      Browse and manage your ESG reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <Input
                          placeholder="Search reports..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={filterType}
                          onValueChange={setFilterType}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                             <SelectItem value="annual">Annual</SelectItem>
                             <SelectItem value="custom">Custom</SelectItem>
                             <SelectItem value="regulatory">Regulatory</SelectItem>
                           </SelectContent>
                        </Select>

                        <Select
                          value={filterStatus}
                          onValueChange={setFilterStatus}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Reports List */}
                    <div className="space-y-4">
                      {filteredReports.map((report) => (
                        <Card
                          key={report.id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="p-3 bg-gray-100 rounded-lg">
                                  {getTypeIcon(report.type)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold">
                                      {report.title}
                                    </h3>
                                    <Badge
                                      className={getStatusColor(report.status)}
                                      variant="secondary"
                                    >
                                      {report.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                    <span>Period: {report.period}</span>
                                    <span>•</span>
                                    <span>{report.metrics} metrics</span>
                                    <span>•</span>
                                    <span>{report.pages} pages</span>
                                    <span>•</span>
                                    <span>
                                      Updated:{" "}
                                      {new Date(
                                        report.updatedAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewReport(report)}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View
                                    </Button>
                                    {report.downloadUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleDownloadReport(report)
                                        }
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleShareReport(report)}
                                    >
                                      <Share className="h-4 w-4 mr-2" />
                                      Share
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {filteredReports.length === 0 && (
                      <div className="text-center py-12">
                        <FileBarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No Reports Found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery ||
                          filterType !== "all" ||
                          filterStatus !== "all"
                            ? "Try adjusting your filters"
                            : "Generate your first ESG report to get started"}
                        </p>
                        <Button onClick={handleGenerateReport}>
                          <Plus className="h-4 w-4 mr-2" />
                          Generate Report
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* --- REPORT PREVIEW MODAL --- */}
      <WideModal open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <WideModalContent className="max-w-5xl bg-[#F8FAFC] dark:bg-[#0F172A] p-0 flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="p-6 bg-white dark:bg-slate-900 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <WideModalTitle className="text-xl font-bold">
                  Report Preview: {activeReport?.title}
                </WideModalTitle>
                <WideModalDescription className="text-xs font-mono uppercase tracking-widest text-emerald-600/70">
                  Regulatory Alignment Pack • Immutable Audit Trail
                </WideModalDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => activeReport && handleExportPDF(activeReport)}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Modal Content - PDF-like view */}
          <div className="flex-1 overflow-auto p-8 flex flex-col items-center">
            <div className="w-full max-w-[800px] bg-white dark:bg-slate-900 shadow-2xl border border-border/50 p-12 min-h-[1000px] flex flex-col">
              {/* Report Title Page Simulation */}
              <div className="flex justify-between items-start mb-12">
                <h2 className="text-3xl font-black tracking-tighter">AEGIS <span className="text-emerald-600">ESG</span></h2>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Generated On</p>
                  <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-12">
                <h1 className="text-4xl font-bold mb-4">{activeReport?.title}</h1>
                <p className="text-muted-foreground leading-relaxed">
                  This report provides a comprehensive analysis of ESG performance metrics aligned with SFDR and EU Taxonomy frameworks for the period {activeReport?.period}.
                </p>
              </div>

              {/* Mock Analysis Section */}
              <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1">Alignment Score</p>
                  <p className="text-3xl font-black">92%</p>
                </div>
                <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-[10px] font-bold uppercase text-blue-600 mb-1">Data Quality</p>
                  <p className="text-3xl font-black">High</p>
                </div>
                <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-[10px] font-bold uppercase text-purple-600 mb-1">Review Status</p>
                  <p className="text-3xl font-black">Verified</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2">
                    <FileSearch className="h-5 w-5 text-emerald-600" />
                    Regulatory Mapping
                  </h3>
                  <div className="space-y-3">
                    {[
                      { f: "SFDR Article 8", s: "Aligned", d: "8/8 indicators disclosed" },
                      { f: "EU Taxonomy", s: "Partial", d: "Climate mitigation criteria met" },
                      { f: "TCFD Disclosures", s: "Aligned", d: "Scenario analysis completed" },
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-muted/30">
                        <div>
                          <p className="font-bold text-sm">{row.f}</p>
                          <p className="text-[10px] text-muted-foreground">{row.d}</p>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200 uppercase text-[9px]">
                          {row.s}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-linear-to-br from-slate-900 to-slate-800 text-white flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-bold mb-1">Immutable Verification Hash</h4>
                    <p className="text-xs text-white/50 font-mono">SHA-256: 8a7c2c9d...e1f8a2b3</p>
                  </div>
                  <Shield className="h-12 w-12 text-emerald-500/50" />
                </div>
              </div>

              <div className="mt-auto pt-12 text-[10px] text-muted-foreground flex justify-between border-t uppercase tracking-widest font-bold">
                <span>Aegis Institutional Asset Management</span>
                <span>Page 1 of 42</span>
              </div>
            </div>
          </div>
        </WideModalContent>
      </WideModal>
    </SidebarProvider>
  );
}
