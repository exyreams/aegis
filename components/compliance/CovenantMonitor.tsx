"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
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
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  Bell,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface FinancialCovenant {
  id: string;
  loanId: string;
  loanName: string;
  borrower: string;
  type: "financial" | "operational" | "reporting";
  category: "leverage" | "coverage" | "liquidity" | "profitability" | "other";
  name: string;
  description: string;
  metric: string;
  operator: ">=" | "<=" | "=" | ">" | "<";
  threshold: number;
  currentValue: number;
  unit: string;
  testFrequency: "monthly" | "quarterly" | "annually";
  nextTestDate: string;
  lastTestDate: string;
  status: "compliant" | "at_risk" | "breach" | "waived";
  trend: "improving" | "stable" | "declining";
  breachConsequence: string;
  cureDate?: string;
  waiverExpiry?: string;
  historicalValues: Array<{
    date: string;
    value: number;
    status: string;
  }>;
}

interface CovenantAlert {
  id: string;
  covenantId: string;
  type: "breach" | "warning" | "cure_required" | "test_due";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  dueDate: string;
  acknowledged: boolean;
  createdAt: string;
}

export function CovenantMonitor() {
  const [selectedLoan, setSelectedLoan] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Mock financial covenants data - realistic LMA-style covenants
  const [covenants] = useState<FinancialCovenant[]>([
    {
      id: "1",
      loanId: "loan-001",
      loanName: "Meridian Holdings £75M Senior Secured",
      borrower: "Meridian Holdings PLC",
      type: "financial",
      category: "leverage",
      name: "Net Leverage Ratio",
      description:
        "Consolidated Total Net Debt to Consolidated EBITDA shall not exceed the ratio set out below",
      metric: "Net Debt/EBITDA",
      operator: "<=",
      threshold: 3.5,
      currentValue: 3.2,
      unit: "x",
      testFrequency: "quarterly",
      nextTestDate: "2025-03-31",
      lastTestDate: "2024-12-31",
      status: "compliant",
      trend: "improving",
      breachConsequence:
        "Event of Default; Majority Lenders may accelerate or cancel commitments",
      historicalValues: [
        { date: "2024-06-30", value: 3.6, status: "at_risk" },
        { date: "2024-09-30", value: 3.4, status: "compliant" },
        { date: "2024-12-31", value: 3.2, status: "compliant" },
      ],
    },
    {
      id: "2",
      loanId: "loan-001",
      loanName: "Meridian Holdings £75M Senior Secured",
      borrower: "Meridian Holdings PLC",
      type: "financial",
      category: "coverage",
      name: "Interest Cover Ratio",
      description:
        "Consolidated EBITDA to Consolidated Net Finance Charges shall not be less than the ratio set out below",
      metric: "EBITDA/Interest",
      operator: ">=",
      threshold: 4.0,
      currentValue: 3.6,
      unit: "x",
      testFrequency: "quarterly",
      nextTestDate: "2025-03-31",
      lastTestDate: "2024-12-31",
      status: "at_risk",
      trend: "declining",
      breachConsequence:
        "Event of Default; potential margin ratchet increase of 0.50%",
      historicalValues: [
        { date: "2024-06-30", value: 4.5, status: "compliant" },
        { date: "2024-09-30", value: 4.1, status: "compliant" },
        { date: "2024-12-31", value: 3.6, status: "at_risk" },
      ],
    },
    {
      id: "3",
      loanId: "loan-003",
      loanName: "Atlas Logistics $200M ABL Facility",
      borrower: "Atlas Logistics Inc",
      type: "financial",
      category: "liquidity",
      name: "Minimum Liquidity",
      description:
        "Maintain minimum aggregate of unrestricted cash and available commitments under the Revolving Facility",
      metric: "Liquidity",
      operator: ">=",
      threshold: 25000000,
      currentValue: 18500000,
      unit: "$",
      testFrequency: "monthly",
      nextTestDate: "2025-01-31",
      lastTestDate: "2024-12-31",
      status: "breach",
      trend: "declining",
      breachConsequence:
        "Cash Dominion Event triggered; daily sweep of collections to Agent",
      cureDate: "2025-02-15",
      historicalValues: [
        { date: "2024-10-31", value: 32000000, status: "compliant" },
        { date: "2024-11-30", value: 24000000, status: "at_risk" },
        { date: "2024-12-31", value: 18500000, status: "breach" },
      ],
    },
    {
      id: "4",
      loanId: "loan-002",
      loanName: "Nordic Energy €120M Green Loan",
      borrower: "Nordic Energy AS",
      type: "financial",
      category: "leverage",
      name: "Senior Secured Leverage",
      description:
        "Senior Secured Net Debt to Consolidated EBITDA shall not exceed the ratio set out below",
      metric: "Senior Debt/EBITDA",
      operator: "<=",
      threshold: 2.5,
      currentValue: 2.1,
      unit: "x",
      testFrequency: "quarterly",
      nextTestDate: "2025-03-31",
      lastTestDate: "2024-12-31",
      status: "compliant",
      trend: "stable",
      breachConsequence: "Event of Default; Green Loan status may be revoked",
      historicalValues: [
        { date: "2024-06-30", value: 2.2, status: "compliant" },
        { date: "2024-09-30", value: 2.1, status: "compliant" },
        { date: "2024-12-31", value: 2.1, status: "compliant" },
      ],
    },
    {
      id: "5",
      loanId: "loan-001",
      loanName: "Meridian Holdings £75M Senior Secured",
      borrower: "Meridian Holdings PLC",
      type: "financial",
      category: "other",
      name: "Capital Expenditure Limit",
      description:
        "Consolidated Capital Expenditure in any financial year shall not exceed the amount set out below",
      metric: "CapEx",
      operator: "<=",
      threshold: 15000000,
      currentValue: 12800000,
      unit: "£",
      testFrequency: "annually",
      nextTestDate: "2025-12-31",
      lastTestDate: "2024-12-31",
      status: "compliant",
      trend: "stable",
      breachConsequence:
        "Excess CapEx requires Majority Lender consent; potential mandatory prepayment",
      historicalValues: [
        { date: "2023-12-31", value: 11500000, status: "compliant" },
        { date: "2024-12-31", value: 12800000, status: "compliant" },
      ],
    },
    {
      id: "6",
      loanId: "loan-002",
      loanName: "Nordic Energy €120M Green Loan",
      borrower: "Nordic Energy AS",
      type: "operational",
      category: "other",
      name: "Carbon Intensity Reduction",
      description:
        "Annual reduction in carbon intensity (tCO2e per €M revenue) of at least 5% year-on-year",
      metric: "Carbon Intensity",
      operator: "<=",
      threshold: 45,
      currentValue: 42,
      unit: "tCO2e/€M",
      testFrequency: "annually",
      nextTestDate: "2025-12-31",
      lastTestDate: "2024-12-31",
      status: "compliant",
      trend: "improving",
      breachConsequence:
        "Margin adjustment of +0.10%; potential loss of Green Loan classification",
      historicalValues: [
        { date: "2023-12-31", value: 52, status: "compliant" },
        { date: "2024-12-31", value: 42, status: "compliant" },
      ],
    },
  ]);

  // Mock covenant alerts
  const [alerts] = useState<CovenantAlert[]>([
    {
      id: "1",
      covenantId: "3",
      type: "breach",
      severity: "critical",
      message:
        "Minimum Liquidity covenant breached - Cash Dominion Event triggered. Immediate remediation required within cure period.",
      dueDate: "2025-02-15",
      acknowledged: false,
      createdAt: "2025-01-02",
    },
    {
      id: "2",
      covenantId: "2",
      type: "warning",
      severity: "high",
      message:
        "Interest Cover Ratio at 3.6x approaching 4.0x threshold. Consider debt reduction or EBITDA improvement measures.",
      dueDate: "2025-03-31",
      acknowledged: false,
      createdAt: "2025-01-02",
    },
    {
      id: "3",
      covenantId: "1",
      type: "test_due",
      severity: "medium",
      message:
        "Q1 2025 covenant testing due in 89 days. Ensure financial statements and compliance certificate are prepared.",
      dueDate: "2025-03-31",
      acknowledged: true,
      createdAt: "2025-01-01",
    },
  ]);

  const loans = [
    { id: "loan-001", name: "Meridian Holdings £75M Senior Secured" },
    { id: "loan-002", name: "Nordic Energy €120M Green Loan" },
    { id: "loan-003", name: "Atlas Logistics $200M ABL Facility" },
  ];

  const filteredCovenants = covenants.filter((covenant) => {
    if (selectedLoan !== "all" && covenant.loanId !== selectedLoan)
      return false;
    if (selectedCategory !== "all" && covenant.category !== selectedCategory)
      return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "at_risk":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "breach":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "waived":
        return <Clock className="h-4 w-4 text-blue-500" />;
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
        return "bg-red-100 text-red-800";
      case "waived":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculateCompliancePercentage = (
    current: number,
    threshold: number,
    operator: string
  ) => {
    switch (operator) {
      case ">=":
        return Math.min(100, (current / threshold) * 100);
      case "<=":
        return Math.min(100, (threshold / current) * 100);
      case ">":
        return current > threshold ? 100 : (current / threshold) * 100;
      case "<":
        return current < threshold ? 100 : (threshold / current) * 100;
      case "=":
        return current === threshold
          ? 100
          : Math.max(
              0,
              100 - Math.abs((current - threshold) / threshold) * 100
            );
      default:
        return 0;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === "$") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    } else if (unit === "%") {
      return `${value}%`;
    } else if (unit === "x") {
      return `${value.toFixed(1)}x`;
    }
    return `${value} ${unit}`;
  };

  const covenantStats = {
    total: filteredCovenants.length,
    compliant: filteredCovenants.filter((c) => c.status === "compliant").length,
    atRisk: filteredCovenants.filter((c) => c.status === "at_risk").length,
    breach: filteredCovenants.filter((c) => c.status === "breach").length,
    waived: filteredCovenants.filter((c) => c.status === "waived").length,
  };

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Covenant Monitor</h3>
        <div className="flex items-center space-x-2">
          <Select value={selectedLoan} onValueChange={setSelectedLoan}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select loan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Loans</SelectItem>
              {loans.map((loan) => (
                <SelectItem key={loan.id} value={loan.id}>
                  {loan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="leverage">Leverage</SelectItem>
              <SelectItem value="coverage">Coverage</SelectItem>
              <SelectItem value="liquidity">Liquidity</SelectItem>
              <SelectItem value="profitability">Profitability</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Covenant
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {unacknowledgedAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-red-800 flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Active Alerts ({unacknowledgedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unacknowledgedAlerts.map((alert) => {
                const covenant = covenants.find(
                  (c) => c.id === alert.covenantId
                );
                return (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-3 ${getSeverityColor(
                      alert.severity
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.type.replace("_", " ").toUpperCase()}
                        </Badge>
                        <span className="font-medium text-sm">
                          {covenant?.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Due: {alert.dueDate}
                      </div>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-600">
                        Borrower: {covenant?.borrower}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success("Alert acknowledged")}
                      >
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Covenant Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{covenantStats.total}</div>
            <div className="text-sm text-gray-600">Total Covenants</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {covenantStats.compliant}
            </div>
            <div className="text-sm text-gray-600">Compliant</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {covenantStats.atRisk}
            </div>
            <div className="text-sm text-gray-600">At Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {covenantStats.breach}
            </div>
            <div className="text-sm text-gray-600">In Breach</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {covenantStats.waived}
            </div>
            <div className="text-sm text-gray-600">Waived</div>
          </CardContent>
        </Card>
      </div>

      {/* Covenant Details - Table View */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Borrower / Loan</TableHead>
              <TableHead>Covenant</TableHead>
              <TableHead>Current vs Threshold</TableHead>
              <TableHead>Compliance</TableHead>
              <TableHead>Next Test</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCovenants.map((covenant) => (
              <TableRow key={covenant.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="max-w-[200px]">
                  <div className="font-medium truncate">{covenant.borrower}</div>
                  <div className="text-xs text-muted-foreground truncate">{covenant.loanName}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{covenant.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                     <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                       {covenant.category}
                     </Badge>
                     <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                       {covenant.testFrequency}
                     </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">
                        {formatValue(covenant.currentValue, covenant.unit)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Target: {covenant.operator} {formatValue(covenant.threshold, covenant.unit)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="w-[180px]">
                    <div className="flex items-center gap-2 mb-1">
                        <Progress
                            value={calculateCompliancePercentage(
                            covenant.currentValue,
                            covenant.threshold,
                            covenant.operator
                            )}
                            className="h-1.5 w-24"
                        />
                        <span className="text-xs font-medium">
                            {Math.round(
                            calculateCompliancePercentage(
                                covenant.currentValue,
                                covenant.threshold,
                                covenant.operator
                            )
                            )}%
                        </span>
                    </div>
                     <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        Trend: {getTrendIcon(covenant.trend)} 
                        <span className="capitalize">{covenant.trend}</span>
                     </div>
                </TableCell>
                <TableCell>
                    <div className="text-sm">{covenant.nextTestDate}</div>
                    {covenant.cureDate && (
                        <div className="text-xs text-red-600 font-medium">Cure: {covenant.cureDate}</div>
                    )}
                </TableCell>
                <TableCell>
                   <Badge className={`${getStatusColor(covenant.status)} border-0`}>
                    {getStatusIcon(covenant.status)}
                    <span className="ml-1 capitalize">{covenant.status.replace("_", " ")}</span>
                  </Badge>
                </TableCell>
                 <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
