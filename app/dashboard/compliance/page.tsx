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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { CovenantMonitor } from "@/components/compliance/CovenantMonitor";
import { InformationDistribution } from "@/components/compliance/InformationDistribution";
import { BorrowerObligations } from "@/components/compliance/BorrowerObligations";
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
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  Target,
  BarChart3,
  Share2,
} from "lucide-react";

interface LoanCompliance {
  id: string;
  borrower: string;
  loanAmount: number;
  startDate: string;
  maturityDate: string;
  totalCovenants: number;
  compliantCovenants: number;
  atRiskCovenants: number;
  breachedCovenants: number;
  overallStatus: "compliant" | "at_risk" | "breach" | "critical";
  lastReported: string;
  nextReporting: string;
}

export default function CompliancePage() {
  const { auth } = useAuth();
  const user = auth.user;

  const [selectedLoan, setSelectedLoan] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<
    "overview" | "covenants" | "obligations" | "distribution"
  >("overview");

  // Mock loan compliance data - realistic LMA loan portfolio
  const loanCompliance: LoanCompliance[] = [
    {
      id: "1",
      borrower: "Meridian Holdings PLC",
      loanAmount: 75000000,
      startDate: "2023-06-15",
      maturityDate: "2028-06-15",
      totalCovenants: 8,
      compliantCovenants: 6,
      atRiskCovenants: 1,
      breachedCovenants: 1,
      overallStatus: "at_risk",
      lastReported: "2025-01-15",
      nextReporting: "2025-03-31",
    },
    {
      id: "2",
      borrower: "Nordic Energy AS",
      loanAmount: 120000000,
      startDate: "2024-03-01",
      maturityDate: "2031-03-01",
      totalCovenants: 6,
      compliantCovenants: 6,
      atRiskCovenants: 0,
      breachedCovenants: 0,
      overallStatus: "compliant",
      lastReported: "2024-12-31",
      nextReporting: "2025-03-31",
    },
    {
      id: "3",
      borrower: "Atlas Logistics Inc",
      loanAmount: 200000000,
      startDate: "2022-09-01",
      maturityDate: "2027-09-01",
      totalCovenants: 5,
      compliantCovenants: 3,
      atRiskCovenants: 1,
      breachedCovenants: 1,
      overallStatus: "breach",
      lastReported: "2024-12-31",
      nextReporting: "2025-01-31",
    },
  ];

  const overallStats = {
    totalLoans: loanCompliance.length,
    totalValue: loanCompliance.reduce((sum, loan) => sum + loan.loanAmount, 0),
    compliant: loanCompliance.filter((l) => l.overallStatus === "compliant")
      .length,
    atRisk: loanCompliance.filter((l) => l.overallStatus === "at_risk").length,
    breach: loanCompliance.filter((l) => l.overallStatus === "breach").length,
    totalCovenants: loanCompliance.reduce(
      (sum, loan) => sum + loan.totalCovenants,
      0
    ),
    compliantCovenants: loanCompliance.reduce(
      (sum, loan) => sum + loan.compliantCovenants,
      0
    ),
  };

  const complianceData = loanCompliance.map((loan) => ({
    name: loan.borrower.split(" ")[0],
    compliant: loan.compliantCovenants,
    atRisk: loan.atRiskCovenants,
    breach: loan.breachedCovenants,
    total: loan.totalCovenants,
  }));

  const statusDistribution = [
    { name: "Compliant", value: overallStats.compliant, color: "#10b981" },
    { name: "At Risk", value: overallStats.atRisk, color: "#f59e0b" },
    { name: "Breach", value: overallStats.breach, color: "#ef4444" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "at_risk":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "breach":
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "at_risk":
        return "bg-yellow-100 text-yellow-800";
      case "breach":
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Loan Compliance
                  </h1>
                  <p className="text-muted-foreground">
                    {user?.role === "borrower"
                      ? "Monitor your loan obligations and compliance requirements"
                      : user?.role === "lender"
                      ? "Track borrower compliance across your loan portfolio"
                      : "Oversee loan compliance and covenant monitoring platform-wide"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedLoan} onValueChange={setSelectedLoan}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select loan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Loans</SelectItem>
                      {loanCompliance.map((loan) => (
                        <SelectItem key={loan.id} value={loan.id}>
                          {loan.borrower}
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
                      <CardDescription>Total Portfolio</CardDescription>
                      <CardTitle className="text-3xl font-bold">
                        ${(overallStats.totalValue / 1000000).toFixed(0)}M
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Target className="h-4 w-4 mr-1" />
                        {overallStats.totalLoans} active loans
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Compliance Rate</CardDescription>
                      <CardTitle className="text-3xl font-bold text-green-600">
                        {Math.round(
                          (overallStats.compliantCovenants /
                            overallStats.totalCovenants) *
                            100
                        )}
                        %
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {overallStats.compliantCovenants} of{" "}
                        {overallStats.totalCovenants} covenants
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Compliant Loans</CardDescription>
                      <CardTitle className="text-3xl font-bold text-green-600">
                        {overallStats.compliant}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 mr-1" />
                        Fully compliant
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Needs Attention</CardDescription>
                      <CardTitle className="text-3xl font-bold text-red-600">
                        {overallStats.breach}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Covenant breaches
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Content */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <CardTitle>Compliance Management</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {overallStats.totalCovenants} covenants
                          </Badge>
                        </div>
                      </div>

                      {/* Tab Navigation */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={
                            activeTab === "overview" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveTab("overview")}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Overview
                        </Button>
                        <Button
                          variant={
                            activeTab === "covenants" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveTab("covenants")}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Covenants
                        </Button>
                        <Button
                          variant={
                            activeTab === "obligations" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveTab("obligations")}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Obligations
                        </Button>
                        <Button
                          variant={
                            activeTab === "distribution" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveTab("distribution")}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Distribution
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">
                                Covenant Compliance by Loan
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={complianceData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar
                                    dataKey="compliant"
                                    stackId="a"
                                    fill="#10b981"
                                    name="Compliant"
                                  />
                                  <Bar
                                    dataKey="atRisk"
                                    stackId="a"
                                    fill="#f59e0b"
                                    name="At Risk"
                                  />
                                  <Bar
                                    dataKey="breach"
                                    stackId="a"
                                    fill="#ef4444"
                                    name="Breach"
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">
                                Portfolio Status Distribution
                              </CardTitle>
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
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                      />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="flex justify-center space-x-4 mt-4">
                                {statusDistribution.map((entry, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center"
                                  >
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

                        {/* Loan Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">
                            Loan Portfolio
                          </h3>
                          {loanCompliance.map((loan) => (
                            <Card key={loan.id}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-lg">
                                      {loan.borrower}
                                    </CardTitle>
                                    <p className="text-sm text-gray-600">
                                      ${(loan.loanAmount / 1000000).toFixed(0)}M
                                      • {loan.startDate} to {loan.maturityDate}
                                    </p>
                                  </div>
                                  <Badge
                                    className={getStatusColor(
                                      loan.overallStatus
                                    )}
                                  >
                                    {getStatusIcon(loan.overallStatus)}
                                    <span className="ml-1 capitalize">
                                      {loan.overallStatus.replace("_", " ")}
                                    </span>
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                      {loan.compliantCovenants}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Compliant
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                      {loan.atRiskCovenants}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      At Risk
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                      {loan.breachedCovenants}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Breached
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">
                                      {loan.totalCovenants}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Total
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                    <span>
                                      Last reported: {loan.lastReported}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                                    <span>Next due: {loan.nextReporting}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeTab === "covenants" && <CovenantMonitor />}
                    {activeTab === "obligations" && <BorrowerObligations />}
                    {activeTab === "distribution" && (
                      <InformationDistribution />
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
