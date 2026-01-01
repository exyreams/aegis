"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Shield,
  Bell,
  TrendingUp,
  Users,
  Building,
  Eye,
  Upload,
  Plus,
  Settings,
  Zap,
  BarChart3,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface BorrowerObligation {
  id: string;
  loanId: string;
  loanName: string;
  borrower: string;
  category:
    | "financial"
    | "reporting"
    | "operational"
    | "legal"
    | "insurance"
    | "environmental";
  type: "recurring" | "one_time" | "event_driven";
  title: string;
  description: string;
  frequency?: "monthly" | "quarterly" | "annually" | "semi_annually";
  dueDate: string;
  nextDueDate?: string;
  status: "compliant" | "pending" | "overdue" | "waived" | "not_applicable";
  priority: "low" | "medium" | "high" | "critical";
  completionRate: number;
  lastCompleted?: string;
  responsibleParty: string;
  consequences: string;
  documents: string[];
  automationLevel: "manual" | "semi_automated" | "fully_automated";
  reminderSent: boolean;
}

interface ComplianceCalendar {
  date: string;
  obligations: BorrowerObligation[];
  status: "clear" | "due" | "overdue";
}

interface AutomationRule {
  id: string;
  name: string;
  category: string;
  trigger: "due_date" | "status_change" | "document_upload" | "manual";
  condition: string;
  action: "send_reminder" | "generate_report" | "escalate" | "auto_submit";
  recipients: string[];
  active: boolean;
  lastTriggered?: string;
}

interface ComplianceReport {
  id: string;
  title: string;
  type: "summary" | "detailed" | "exception" | "trend";
  period: string;
  generatedDate: string;
  obligations: number;
  complianceRate: number;
  downloadUrl: string;
}

export function BorrowerObligations() {
  const [selectedLoan, setSelectedLoan] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<
    "list" | "calendar" | "dashboard" | "automation" | "reports"
  >("dashboard");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Mock borrower obligations data - realistic loan market scenarios
  const [obligations] = useState<BorrowerObligation[]>([
    {
      id: "1",
      loanId: "loan-001",
      loanName: "Meridian Holdings £75M Senior Secured",
      borrower: "Meridian Holdings PLC",
      category: "financial",
      type: "recurring",
      title: "Monthly Management Accounts",
      description:
        "Submit unaudited monthly management accounts including P&L, balance sheet, cash flow statement, and borrowing base certificate within 30 days of month end",
      frequency: "monthly",
      dueDate: "2025-01-30",
      nextDueDate: "2025-02-28",
      status: "pending",
      priority: "high",
      completionRate: 92,
      lastCompleted: "2024-12-30",
      responsibleParty: "Group CFO",
      consequences:
        "Information Event of Default; 0.25% margin step-up after 5 business days",
      documents: [
        "management-accounts-template.xlsx",
        "borrowing-base-cert.pdf",
      ],
      automationLevel: "semi_automated",
      reminderSent: true,
    },
    {
      id: "2",
      loanId: "loan-001",
      loanName: "Meridian Holdings £75M Senior Secured",
      borrower: "Meridian Holdings PLC",
      category: "reporting",
      type: "recurring",
      title: "Quarterly Compliance Certificate",
      description:
        "Officer's certificate confirming compliance with all financial covenants including Leverage Ratio, Interest Cover, and Cashflow Cover calculations",
      frequency: "quarterly",
      dueDate: "2025-01-31",
      nextDueDate: "2025-04-30",
      status: "compliant",
      priority: "high",
      completionRate: 100,
      lastCompleted: "2025-01-15",
      responsibleParty: "CEO & CFO",
      consequences:
        "Event of Default if not delivered within 5 business days of due date",
      documents: [
        "compliance-certificate-q4-2024.pdf",
        "covenant-calculations.xlsx",
      ],
      automationLevel: "manual",
      reminderSent: false,
    },
    {
      id: "3",
      loanId: "loan-002",
      loanName: "Nordic Energy €120M Green Loan",
      borrower: "Nordic Energy AS",
      category: "insurance",
      type: "recurring",
      title: "Insurance Certificate Renewal",
      description:
        "Provide evidence of comprehensive insurance coverage including property, business interruption, and public liability with Agent named as loss payee",
      frequency: "annually",
      dueDate: "2025-01-20",
      status: "pending",
      priority: "high",
      completionRate: 85,
      lastCompleted: "2024-01-20",
      responsibleParty: "Group Risk Manager",
      consequences:
        "Agent may procure insurance at Borrower's cost; potential Event of Default",
      documents: ["insurance-schedule-2024.pdf"],
      automationLevel: "semi_automated",
      reminderSent: true,
    },
    {
      id: "4",
      loanId: "loan-001",
      loanName: "Meridian Holdings £75M Senior Secured",
      borrower: "Meridian Holdings PLC",
      category: "legal",
      type: "event_driven",
      title: "Material Litigation Notification",
      description:
        "Notify Agent promptly of any litigation, arbitration or administrative proceedings with potential liability exceeding £2M or which may have Material Adverse Effect",
      dueDate: "2025-01-05",
      status: "overdue",
      priority: "critical",
      completionRate: 0,
      responsibleParty: "General Counsel",
      consequences:
        "Breach of Information Undertaking; potential Event of Default",
      documents: [],
      automationLevel: "manual",
      reminderSent: true,
    },
    {
      id: "5",
      loanId: "loan-003",
      loanName: "Atlas Logistics $200M ABL Facility",
      borrower: "Atlas Logistics Inc",
      category: "operational",
      type: "recurring",
      title: "Borrowing Base Certificate",
      description:
        "Weekly borrowing base certificate detailing eligible receivables, inventory values, and concentration limits",
      frequency: "monthly",
      dueDate: "2025-01-07",
      nextDueDate: "2025-01-14",
      status: "overdue",
      priority: "critical",
      completionRate: 70,
      lastCompleted: "2024-12-31",
      responsibleParty: "Treasury Manager",
      consequences:
        "Immediate reduction in availability; potential cash dominion trigger",
      documents: [],
      automationLevel: "fully_automated",
      reminderSent: true,
    },
    {
      id: "6",
      loanId: "loan-002",
      loanName: "Nordic Energy €120M Green Loan",
      borrower: "Nordic Energy AS",
      category: "environmental",
      type: "recurring",
      title: "Sustainability Performance Report",
      description:
        "Annual sustainability report demonstrating progress against Green Loan KPIs including carbon intensity reduction, renewable capacity additions, and ESG ratings",
      frequency: "annually",
      dueDate: "2025-01-31",
      status: "pending",
      priority: "high",
      completionRate: 65,
      lastCompleted: "2024-01-31",
      responsibleParty: "Head of Sustainability",
      consequences:
        "Margin adjustment of +0.10% if KPIs not met; reputational risk",
      documents: ["sustainability-framework.pdf", "kpi-tracker-2024.xlsx"],
      automationLevel: "semi_automated",
      reminderSent: true,
    },
    {
      id: "7",
      loanId: "loan-003",
      loanName: "Atlas Logistics $200M ABL Facility",
      borrower: "Atlas Logistics Inc",
      category: "financial",
      type: "recurring",
      title: "Annual Audited Financial Statements",
      description:
        "Deliver audited consolidated financial statements prepared in accordance with GAAP within 120 days of fiscal year end",
      frequency: "annually",
      dueDate: "2025-04-30",
      status: "pending",
      priority: "medium",
      completionRate: 25,
      lastCompleted: "2024-04-28",
      responsibleParty: "CFO & External Auditors",
      consequences: "Event of Default if not delivered within 150 days",
      documents: ["audit-engagement-letter.pdf"],
      automationLevel: "manual",
      reminderSent: false,
    },
    {
      id: "8",
      loanId: "loan-001",
      loanName: "Meridian Holdings £75M Senior Secured",
      borrower: "Meridian Holdings PLC",
      category: "reporting",
      type: "event_driven",
      title: "Acquisition/Disposal Notification",
      description:
        "Provide 10 business days advance notice of any proposed acquisition or disposal with aggregate consideration exceeding £5M",
      dueDate: "2025-01-25",
      status: "pending",
      priority: "medium",
      completionRate: 50,
      responsibleParty: "M&A Director",
      consequences:
        "Transaction may be blocked; potential breach of Permitted Acquisition basket",
      documents: ["acquisition-summary.pdf"],
      automationLevel: "manual",
      reminderSent: true,
    },
  ]);

  const loans = [
    { id: "loan-001", name: "Meridian Holdings £75M Senior Secured" },
    { id: "loan-002", name: "Nordic Energy €120M Green Loan" },
    { id: "loan-003", name: "Atlas Logistics $200M ABL Facility" },
  ];

  // Mock automation rules
  const [automationRules] = useState<AutomationRule[]>([
    {
      id: "1",
      name: "Monthly Financial Statement Reminder",
      category: "financial",
      trigger: "due_date",
      condition: "3 days before due date",
      action: "send_reminder",
      recipients: ["cfo@techcorp.com", "lender@bank.com"],
      active: true,
      lastTriggered: "2025-01-28",
    },
    {
      id: "2",
      name: "Overdue Obligation Escalation",
      category: "all",
      trigger: "status_change",
      condition: "Status changes to overdue",
      action: "escalate",
      recipients: ["risk@bank.com", "legal@bank.com"],
      active: true,
      lastTriggered: "2025-01-15",
    },
    {
      id: "3",
      name: "Compliance Certificate Auto-Generation",
      category: "reporting",
      trigger: "document_upload",
      condition: "Financial statements uploaded",
      action: "auto_submit",
      recipients: ["compliance@bank.com"],
      active: false,
    },
  ]);

  // Mock compliance reports
  const [reports] = useState<ComplianceReport[]>([
    {
      id: "1",
      title: "Q4 2024 Compliance Summary",
      type: "summary",
      period: "Q4 2024",
      generatedDate: "2025-01-01",
      obligations: 25,
      complianceRate: 92,
      downloadUrl: "/reports/q4-2024-compliance-summary.pdf",
    },
    {
      id: "2",
      title: "December 2024 Exception Report",
      type: "exception",
      period: "December 2024",
      generatedDate: "2025-01-01",
      obligations: 3,
      complianceRate: 75,
      downloadUrl: "/reports/dec-2024-exceptions.pdf",
    },
    {
      id: "3",
      title: "2024 Annual Compliance Trends",
      type: "trend",
      period: "2024",
      generatedDate: "2025-01-01",
      obligations: 156,
      complianceRate: 89,
      downloadUrl: "/reports/2024-compliance-trends.pdf",
    },
  ]);

  const filteredObligations = obligations.filter((obligation) => {
    if (selectedLoan !== "all" && obligation.loanId !== selectedLoan)
      return false;
    if (selectedCategory !== "all" && obligation.category !== selectedCategory)
      return false;
    if (selectedStatus !== "all" && obligation.status !== selectedStatus)
      return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "waived":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "not_applicable":
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "waived":
        return "bg-blue-100 text-blue-800";
      case "not_applicable":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "financial":
        return <DollarSign className="h-4 w-4" />;
      case "reporting":
        return <FileText className="h-4 w-4" />;
      case "operational":
        return <Building className="h-4 w-4" />;
      case "legal":
        return <Shield className="h-4 w-4" />;
      case "insurance":
        return <Shield className="h-4 w-4" />;
      case "environmental":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getAutomationColor = (level: string) => {
    switch (level) {
      case "fully_automated":
        return "bg-green-100 text-green-800";
      case "semi_automated":
        return "bg-yellow-100 text-yellow-800";
      case "manual":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const obligationStats = {
    total: filteredObligations.length,
    compliant: filteredObligations.filter((o) => o.status === "compliant")
      .length,
    pending: filteredObligations.filter((o) => o.status === "pending").length,
    overdue: filteredObligations.filter((o) => o.status === "overdue").length,
    avgCompletionRate: Math.round(
      filteredObligations.reduce((sum, o) => sum + o.completionRate, 0) /
        filteredObligations.length
    ),
  };

  const upcomingObligations = filteredObligations
    .filter((o) => o.status === "pending" || o.status === "overdue")
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Borrower Obligations</h3>
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
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="reporting">Reporting</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="environmental">Environmental</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="compliant">Compliant</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="waived">Waived</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={viewMode}
            onValueChange={(
              value:
                | "list"
                | "calendar"
                | "dashboard"
                | "automation"
                | "reports"
            ) => setViewMode(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dashboard">Dashboard</SelectItem>
              <SelectItem value="list">List View</SelectItem>
              <SelectItem value="automation">Automation</SelectItem>
              <SelectItem value="reports">Reports</SelectItem>
              <SelectItem value="calendar">Calendar</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Obligation
          </Button>
        </div>
      </div>

      {/* Dashboard View */}
      {viewMode === "dashboard" && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {obligationStats.total}
                </div>
                <div className="text-sm text-gray-600">Total Obligations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {obligationStats.compliant}
                </div>
                <div className="text-sm text-gray-600">Compliant</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {obligationStats.pending}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {obligationStats.overdue}
                </div>
                <div className="text-sm text-gray-600">Overdue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {obligationStats.avgCompletionRate}%
                </div>
                <div className="text-sm text-gray-600">Avg Completion</div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Obligations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Obligations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingObligations.map((obligation) => (
                  <div
                    key={obligation.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(obligation.category)}
                      <div>
                        <div className="font-medium text-sm">
                          {obligation.title}
                        </div>
                        <div className="text-xs text-gray-600">
                          {obligation.borrower}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={getPriorityColor(obligation.priority)}
                        variant="secondary"
                      >
                        {obligation.priority}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        {obligation.dueDate}
                      </div>
                      <Badge className={getStatusColor(obligation.status)}>
                        {getStatusIcon(obligation.status)}
                        <span className="ml-1 capitalize">
                          {obligation.status}
                        </span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredObligations.map((obligation) => (
            <Card key={obligation.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {obligation.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {obligation.type.replace("_", " ")}
                      </Badge>
                      {obligation.frequency && (
                        <Badge variant="outline" className="text-xs">
                          {obligation.frequency}
                        </Badge>
                      )}
                      <Badge
                        className={getPriorityColor(obligation.priority)}
                        variant="secondary"
                      >
                        {obligation.priority}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">
                      {obligation.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {obligation.borrower} • {obligation.loanName}
                    </p>
                  </div>
                  <Badge className={getStatusColor(obligation.status)}>
                    {getStatusIcon(obligation.status)}
                    <span className="ml-1 capitalize">{obligation.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">
                  {obligation.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Completion Rate</span>
                      <span>{obligation.completionRate}%</span>
                    </div>
                    <Progress
                      value={obligation.completionRate}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span
                        className={`font-medium ${
                          new Date(obligation.dueDate) < new Date() &&
                          obligation.status !== "compliant"
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {obligation.dueDate}
                      </span>
                    </div>
                    {obligation.nextDueDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Next Due:</span>
                        <span>{obligation.nextDueDate}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Responsible:</span>
                      <span>{obligation.responsibleParty}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={getAutomationColor(obligation.automationLevel)}
                      variant="secondary"
                    >
                      {obligation.automationLevel.replace("_", " ")}
                    </Badge>
                    {obligation.reminderSent && (
                      <Badge variant="outline" className="text-xs">
                        <Bell className="h-3 w-3 mr-1" />
                        Reminder Sent
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {obligation.status === "pending" && (
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        Submit
                      </Button>
                    )}
                  </div>
                </div>

                {obligation.consequences && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-red-800 mb-1">
                      Consequences of Non-Compliance
                    </div>
                    <div className="text-sm text-red-700">
                      {obligation.consequences}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                January 2025 - Obligation Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-gray-500 py-2"
                    >
                      {day}
                    </div>
                  )
                )}
                {/* Empty cells for days before the 1st */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="h-24 bg-gray-50 rounded-lg"
                  />
                ))}
                {/* Calendar days */}
                {[...Array(31)].map((_, i) => {
                  const day = i + 1;
                  const dayObligations = filteredObligations.filter((o) => {
                    const dueDay = new Date(o.dueDate).getDate();
                    const dueMonth = new Date(o.dueDate).getMonth();
                    return dueDay === day && dueMonth === 0; // January
                  });
                  const hasOverdue = dayObligations.some(
                    (o) => o.status === "overdue"
                  );
                  const hasPending = dayObligations.some(
                    (o) => o.status === "pending"
                  );

                  return (
                    <div
                      key={day}
                      className={`h-24 border rounded-lg p-1 ${
                        dayObligations.length > 0
                          ? hasOverdue
                            ? "bg-red-50 border-red-200"
                            : hasPending
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-green-50 border-green-200"
                          : "bg-white border-gray-100"
                      }`}
                    >
                      <div className="text-xs font-medium text-gray-700">
                        {day}
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {dayObligations.slice(0, 2).map((o) => (
                          <div
                            key={o.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${
                              o.status === "overdue"
                                ? "bg-red-100 text-red-700"
                                : o.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {o.title.substring(0, 15)}...
                          </div>
                        ))}
                        {dayObligations.length > 2 && (
                          <div className="text-xs text-gray-500 px-1">
                            +{dayObligations.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
                  <span className="text-sm text-gray-600">Overdue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200" />
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
                  <span className="text-sm text-gray-600">Compliant</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredObligations
                  .filter(
                    (o) => o.status === "pending" || o.status === "overdue"
                  )
                  .sort(
                    (a, b) =>
                      new Date(a.dueDate).getTime() -
                      new Date(b.dueDate).getTime()
                  )
                  .map((obligation) => {
                    const daysUntilDue = Math.ceil(
                      (new Date(obligation.dueDate).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div
                        key={obligation.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(obligation.category)}
                          <div>
                            <div className="font-medium text-sm">
                              {obligation.title}
                            </div>
                            <div className="text-xs text-gray-600">
                              {obligation.borrower}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`text-sm font-medium ${
                              daysUntilDue < 0
                                ? "text-red-600"
                                : daysUntilDue <= 7
                                ? "text-yellow-600"
                                : "text-gray-600"
                            }`}
                          >
                            {daysUntilDue < 0
                              ? `${Math.abs(daysUntilDue)} days overdue`
                              : daysUntilDue === 0
                              ? "Due today"
                              : `${daysUntilDue} days left`}
                          </div>
                          <Badge className={getStatusColor(obligation.status)}>
                            {obligation.dueDate}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Automation View */}
      {viewMode === "automation" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold">Automation Rules</h4>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </div>

          <div className="space-y-4">
            {automationRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{rule.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {rule.category} • {rule.trigger.replace("_", " ")} •{" "}
                        {rule.action.replace("_", " ")}
                      </p>
                    </div>
                    <Badge variant={rule.active ? "default" : "secondary"}>
                      {rule.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Trigger:</span>
                      <span className="ml-1 font-medium">{rule.condition}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Action:</span>
                      <span className="ml-1 font-medium">
                        {rule.action.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Recipients</div>
                    <div className="flex flex-wrap gap-1">
                      {rule.recipients.map((recipient, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {recipient}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      {rule.lastTriggered
                        ? `Last triggered: ${rule.lastTriggered}`
                        : "Never triggered"}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <Zap className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reports View */}
      {viewMode === "reports" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold">Compliance Reports</h4>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {report.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {report.type} • {report.period}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {report.complianceRate}% Compliance
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Generated:</span>
                      <span className="ml-1 font-medium">
                        {report.generatedDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Obligations:</span>
                      <span className="ml-1 font-medium">
                        {report.obligations}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-1 font-medium capitalize">
                        {report.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        PDF Report Available
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
