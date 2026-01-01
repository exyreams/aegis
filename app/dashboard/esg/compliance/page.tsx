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
import { Progress } from "@/components/ui/Progress";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Calendar,
  Shield,
  Target,
  TrendingUp,
  Building,
  Globe,
  Leaf,
  Users,
} from "lucide-react";

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  requirements: number;
  completed: number;
  status: "compliant" | "partial" | "non_compliant";
  lastAssessment: string;
  nextReview: string;
}

interface ComplianceRequirement {
  id: string;
  framework: string;
  category: string;
  requirement: string;
  status: "met" | "partial" | "not_met" | "not_applicable";
  evidence: string[];
  dueDate: string;
  responsible: string;
}

export default function ESGCompliancePage() {
  const { auth } = useAuth();
  const user = auth.user;

  const [selectedFramework, setSelectedFramework] = useState<string>("all");

  // Mock compliance frameworks
  const frameworks: ComplianceFramework[] = [
    {
      id: "tcfd",
      name: "TCFD",
      description: "Task Force on Climate-related Financial Disclosures",
      requirements: 11,
      completed: 8,
      status: "partial",
      lastAssessment: "2024-12-01",
      nextReview: "2025-06-01",
    },
    {
      id: "sasb",
      name: "SASB",
      description: "Sustainability Accounting Standards Board",
      requirements: 15,
      completed: 12,
      status: "partial",
      lastAssessment: "2024-11-15",
      nextReview: "2025-05-15",
    },
    {
      id: "gri",
      name: "GRI Standards",
      description: "Global Reporting Initiative",
      requirements: 20,
      completed: 18,
      status: "compliant",
      lastAssessment: "2024-12-10",
      nextReview: "2025-12-10",
    },
    {
      id: "eu_taxonomy",
      name: "EU Taxonomy",
      description: "EU Sustainable Finance Taxonomy",
      requirements: 8,
      completed: 3,
      status: "non_compliant",
      lastAssessment: "2024-10-01",
      nextReview: "2025-04-01",
    },
    {
      id: "sfdr",
      name: "SFDR",
      description: "Sustainable Finance Disclosure Regulation",
      requirements: 12,
      completed: 9,
      status: "partial",
      lastAssessment: "2024-11-20",
      nextReview: "2025-05-20",
    },
  ];

  // Mock compliance requirements
  const requirements: ComplianceRequirement[] = [
    {
      id: "1",
      framework: "TCFD",
      category: "Governance",
      requirement: "Board oversight of climate-related risks and opportunities",
      status: "met",
      evidence: ["board-minutes-climate.pdf", "climate-governance-policy.pdf"],
      dueDate: "2025-03-31",
      responsible: "Board of Directors",
    },
    {
      id: "2",
      framework: "TCFD",
      category: "Strategy",
      requirement: "Climate-related risks and opportunities impact on business",
      status: "partial",
      evidence: ["climate-risk-assessment.pdf"],
      dueDate: "2025-02-28",
      responsible: "Strategy Team",
    },
    {
      id: "3",
      framework: "SASB",
      category: "Environmental",
      requirement: "GHG emissions disclosure (Scope 1, 2, 3)",
      status: "met",
      evidence: ["ghg-emissions-report.pdf", "carbon-footprint-audit.pdf"],
      dueDate: "2025-04-30",
      responsible: "Sustainability Team",
    },
    {
      id: "4",
      framework: "EU Taxonomy",
      category: "Environmental",
      requirement: "Taxonomy-aligned revenue reporting",
      status: "not_met",
      evidence: [],
      dueDate: "2025-01-31",
      responsible: "Finance Team",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
      case "met":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "partial":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "non_compliant":
      case "not_met":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
      case "met":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "non_compliant":
      case "not_met":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const overallStats = {
    totalFrameworks: frameworks.length,
    compliant: frameworks.filter((f) => f.status === "compliant").length,
    partial: frameworks.filter((f) => f.status === "partial").length,
    nonCompliant: frameworks.filter((f) => f.status === "non_compliant").length,
    totalRequirements: frameworks.reduce((sum, f) => sum + f.requirements, 0),
    completedRequirements: frameworks.reduce((sum, f) => sum + f.completed, 0),
  };

  const complianceData = frameworks.map((f) => ({
    name: f.name,
    completed: f.completed,
    total: f.requirements,
    percentage: Math.round((f.completed / f.requirements) * 100),
  }));

  const statusDistribution = [
    { name: "Compliant", value: overallStats.compliant, color: "#10b981" },
    { name: "Partial", value: overallStats.partial, color: "#f59e0b" },
    {
      name: "Non-Compliant",
      value: overallStats.nonCompliant,
      color: "#ef4444",
    },
  ];

  const filteredRequirements =
    selectedFramework === "all"
      ? requirements
      : requirements.filter((r) => r.framework === selectedFramework);

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
                    ESG Compliance
                  </h1>
                  <p className="text-muted-foreground">
                    Track compliance with ESG frameworks and regulations
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedFramework}
                    onValueChange={setSelectedFramework}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frameworks</SelectItem>
                      {frameworks.map((framework) => (
                        <SelectItem key={framework.id} value={framework.name}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>

              {/* Overview Stats */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Frameworks</CardDescription>
                      <CardTitle className="text-3xl font-bold">
                        {overallStats.totalFrameworks}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Globe className="h-4 w-4 mr-1" />
                        Regulatory standards
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Compliance Rate</CardDescription>
                      <CardTitle className="text-3xl font-bold text-green-600">
                        {Math.round(
                          (overallStats.completedRequirements /
                            overallStats.totalRequirements) *
                            100
                        )}
                        %
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {overallStats.completedRequirements} of{" "}
                        {overallStats.totalRequirements} requirements
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Fully Compliant</CardDescription>
                      <CardTitle className="text-3xl font-bold text-green-600">
                        {overallStats.compliant}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 mr-1" />
                        Frameworks completed
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Needs Attention</CardDescription>
                      <CardTitle className="text-3xl font-bold text-red-600">
                        {overallStats.nonCompliant}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Non-compliant frameworks
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Charts */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Framework Compliance Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={complianceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "completed"
                                ? `${value} completed`
                                : `${value} total`,
                              name === "completed" ? "Completed" : "Total",
                            ]}
                          />
                          <Bar dataKey="total" fill="#e5e7eb" name="total" />
                          <Bar
                            dataKey="completed"
                            fill="#3b82f6"
                            name="completed"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center space-x-4 mt-4">
                        {statusDistribution.map((entry, index) => (
                          <div key={index} className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm">
                              {entry.name}: {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Framework Details */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Frameworks</CardTitle>
                    <CardDescription>
                      Overview of ESG regulatory frameworks and standards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {frameworks.map((framework) => (
                        <div
                          key={framework.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">
                                {framework.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {framework.description}
                              </p>
                            </div>
                            <Badge className={getStatusColor(framework.status)}>
                              {getStatusIcon(framework.status)}
                              <span className="ml-1 capitalize">
                                {framework.status.replace("_", " ")}
                              </span>
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <div className="text-sm text-gray-600">
                                Progress
                              </div>
                              <div className="flex items-center space-x-2">
                                <Progress
                                  value={
                                    (framework.completed /
                                      framework.requirements) *
                                    100
                                  }
                                  className="flex-1"
                                />
                                <span className="text-sm font-medium">
                                  {framework.completed}/{framework.requirements}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">
                                Last Assessment
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                <span className="text-sm">
                                  {framework.lastAssessment}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">
                                Next Review
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                <span className="text-sm">
                                  {framework.nextReview}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Requirements Details */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Requirements</CardTitle>
                    <CardDescription>
                      Detailed view of individual compliance requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredRequirements.map((req) => (
                        <div key={req.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline">{req.framework}</Badge>
                                <Badge variant="outline">{req.category}</Badge>
                              </div>
                              <h4 className="font-medium">{req.requirement}</h4>
                            </div>
                            <Badge className={getStatusColor(req.status)}>
                              {getStatusIcon(req.status)}
                              <span className="ml-1 capitalize">
                                {req.status.replace("_", " ")}
                              </span>
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">
                                Responsible:
                              </span>
                              <span className="ml-1 font-medium">
                                {req.responsible}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Due Date:</span>
                              <span className="ml-1 font-medium">
                                {req.dueDate}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Evidence:</span>
                              <span className="ml-1 font-medium">
                                {req.evidence.length} files
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
