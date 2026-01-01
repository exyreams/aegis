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
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";

interface ESGReport {
  id: string;
  title: string;
  type: "quarterly" | "annual" | "custom";
  period: string;
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  metrics: number;
  pages: number;
  downloadUrl?: string;
}

export default function ESGReportsPage() {
  const { auth } = useAuth();
  const user = auth.user;

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
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      default:
        return <FileBarChart className="h-4 w-4" />;
    }
  };

  const handleGenerateReport = () => {
    toast.success("Report generation started! You'll be notified when ready.");
  };

  const handleDownloadReport = (report: ESGReport) => {
    if (report.downloadUrl) {
      toast.success(`Downloading ${report.title}...`);
    } else {
      toast.error("Report not available for download");
    }
  };

  const handleViewReport = (report: ESGReport) => {
    toast.info("Opening report viewer...");
  };

  const handleShareReport = (report: ESGReport) => {
    toast.success("Report sharing link copied to clipboard!");
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
                <Button onClick={handleGenerateReport}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
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
    </SidebarProvider>
  );
}
