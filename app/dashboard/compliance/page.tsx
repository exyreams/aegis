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
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

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

              {/* Overview Stats - Premium Cards Refined */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-zinc-900/50 border-zinc-800/50 hover:border-primary/30 transition-all backdrop-blur-sm shadow-sm">
                    <CardHeader className="pb-2">
                       <div className="flex items-center justify-between">
                        <CardDescription className="text-zinc-400 font-medium tracking-tight">Total Portfolio</CardDescription>
                        <Shield className="h-4 w-4 text-zinc-500" />
                      </div>
                      <CardTitle className="text-3xl font-bold tracking-tighter">
                        ${(overallStats.totalValue / 1000000).toFixed(0)}M
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center text-sm text-zinc-500">
                            <Target className="h-3.5 w-3.5 mr-1.5" />
                            <span>{overallStats.totalLoans} active loans</span>
                          </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900/50 border-zinc-800/50 hover:border-green-500/30 transition-all backdrop-blur-sm shadow-sm">
                    <CardHeader className="pb-2">
                       <div className="flex items-center justify-between">
                        <CardDescription className="text-zinc-400 font-medium tracking-tight">Compliance Rate</CardDescription>
                        <CheckCircle className="h-4 w-4 text-green-500/80" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <CardTitle className="text-3xl font-bold tracking-tighter text-green-500/90">
                            {Math.round(
                            (overallStats.compliantCovenants /
                                overallStats.totalCovenants) *
                                100
                            )}%
                        </CardTitle>
                        <span className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Overall</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full bg-zinc-800/50 h-1 rounded-full mt-1 mb-2 overflow-hidden">
                             <div className="bg-green-500/80 h-full rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)]" style={{ width: `${Math.round((overallStats.compliantCovenants / overallStats.totalCovenants) * 100)}%` }} />
                        </div>
                       <div className="flex items-center text-[11px] text-zinc-500 font-medium">
                        <span>{overallStats.compliantCovenants}/{overallStats.totalCovenants} covenants passing</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900/50 border-zinc-800/50 hover:border-yellow-500/30 transition-all backdrop-blur-sm relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/5 rounded-bl-full -mr-10 -mt-10" />
                    <CardHeader className="pb-2">
                       <div className="flex items-center justify-between">
                        <CardDescription className="text-zinc-400 font-medium tracking-tight">At Risk</CardDescription>
                         <AlertTriangle className="h-4 w-4 text-yellow-500/80" />
                      </div>
                      <CardTitle className="text-3xl font-bold tracking-tighter text-yellow-500/90">
                        {overallStats.atRisk}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="mt-2 text-[11px] font-bold text-yellow-500/90 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-md w-fit flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1.5" />
                          REQUIRES REVIEW
                       </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-950/20 border-red-900/30 hover:border-red-500/30 transition-all relative overflow-hidden shadow-sm">
                     <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600/50 via-red-500/20 to-transparent" />
                    <CardHeader className="pb-2 relative">
                       <div className="flex items-center justify-between">
                        <CardDescription className="text-red-400 font-medium tracking-tight">Major Breaches</CardDescription>
                        <ShieldAlert className="h-4 w-4 text-red-500/80" />
                      </div>
                      <CardTitle className="text-3xl font-bold tracking-tighter text-red-500">
                        {overallStats.breach}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <Button size="sm" variant="destructive" className="w-full mt-2 h-8 text-[11px] font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20">
                        Resolve Breaches
                      </Button>
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
                          <div className="rounded-md border bg-card">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Borrower</TableHead>
                                  <TableHead>Loan Amount</TableHead>
                                  <TableHead>Maturity</TableHead>
                                  <TableHead>Covenants</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {loanCompliance.map((loan) => (
                                  <TableRow key={loan.id} className="hover:bg-muted/50 cursor-pointer transition-colors">
                                    <TableCell className="font-medium">
                                      {loan.borrower}
                                      <div className="text-xs text-muted-foreground">ID: {loan.id}</div>
                                    </TableCell>
                                    <TableCell>${(loan.loanAmount / 1000000).toFixed(1)}M</TableCell>
                                    <TableCell>{new Date(loan.maturityDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2 text-xs">
                                         <span className="text-green-600 font-medium">{loan.compliantCovenants} Pass</span>
                                         <span className="text-muted-foreground">/</span>
                                         <span>{loan.totalCovenants} Total</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={`${getStatusColor(loan.overallStatus)} border-0`}
                                      >
                                        {getStatusIcon(loan.overallStatus)}
                                        <span className="ml-1 capitalize">
                                          {loan.overallStatus.replace("_", " ")}
                                        </span>
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button variant="ghost" size="sm">
                                        View
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
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
