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

  // Mock borrower obligations data
  const [obligations] = useState<BorrowerObligation[]>([
    {
      id: "1",
      loanId: "loan-001",
      loanName: "TechCorp $50M Term Loan",
      borrower: "TechCorp Industries",
      category: "financial",
      type: "recurring",
      title: "Monthly Financial Statements",
      description:
        "Submit unaudited monthly financial statements including P&L, balance sheet, and cash flow",
      frequency: "monthly",
      dueDate: "2025-01-31",
      nextDueDate: "2025-02-28",
      status: "pending",
      priority: "high",
      completionRate: 85,
      lastCompleted: "2024-12-31",
      responsibleParty: "CFO",
      consequences: "Default interest rate increase of 2%",
      documents: ["monthly-financials-template.xlsx"],
      automationLevel: "semi_automated",
      reminderSent: true,
    },
    {
      id: "2",
      loanId: "loan-001",
      loanName: "TechCorp $50M Term Loan",
      borrower: "TechCorp Industries",
      category: "reporting",
      type: "recurring",
      title: "Compliance Certificate",
      description:
        "Officer's certificate confirming compliance with all loan covenants",
      frequency: "quarterly",
      dueDate: "2025-01-31",
      nextDueDate: "2025-04-30",
      status: "compliant",
      priority: "high",
      completionRate: 100,
      lastCompleted: "2025-01-15",
      responsibleParty: "CEO",
      consequences: "Event of default",
      documents: ["compliance-certificate-q4-2024.pdf"],
      automationLevel: "manual",
      reminderSent: false,
    },
    {
      id: "3",
      loanId: "loan-002",
      loanName: "ManufacturingCo $25M Revolver",
      borrower: "ManufacturingCo Ltd",
      category: "insurance",
      type: "recurring",
      title: "Insurance Policy Renewal",
      description:
        "Maintain comprehensive general liability and property insurance",
      frequency: "annually",
      dueDate: "2025-03-15",
      status: "pending",
      priority: "medium",
      completionRate: 90,
      lastCompleted: "2024-03-15",
      responsibleParty: "Risk Manager",
      consequences: "Cure period of 30 days, then event of default",
      documents: ["insurance-policy-2024.pdf"],
      automationLevel: "semi_automated",
      reminderSent: true,
    },
    {
      id: "4",
      loanId: "loan-001",
      loanName: "TechCorp $50M Term Loan",
      borrower: "TechCorp Industries",
      category: "legal",
      type: "event_driven",
      title: "Material Contract Notification",
      description: "Notify lender of any material contracts exceeding $5M",
      dueDate: "2025-02-01",
      status: "overdue",
      priority: "critical",
      completionRate: 60,
      responsibleParty: "Legal Counsel",
      consequences: "Potential acceleration of loan",
      documents: [],
      automationLevel: "manual",
      reminderSent: true,
    },
    {
      id: "5",
      loanId: "loan-003",
      loanName: "RetailChain $100M Credit Facility",
      borrower: "RetailChain Corp",
      category: "operational",
      type: "recurring",
      title: "Inventory Reporting",
      description: "Monthly inventory reports with aging analysis",
      frequency: "monthly",
      dueDate: "2025-01-15",
      nextDueDate: "2025-02-15",
      status: "overdue",
      priority: "high",
      completionRate: 75,
      lastCompleted: "2024-11-15",
      responsibleParty: "Operations Manager",
      consequences: "Borrowing base reduction",
      documents: [],
      automationLevel: "fully_automated",
      reminderSent: true,
    },
    {
      id: "6",
      loanId: "loan-002",
      loanName: "ManufacturingCo $25M Revolver",
      borrower: "ManufacturingCo Ltd",
      category: "environmental",
      type: "recurring",
      title: "Environmental Compliance Report",
      description: "Annual environmental compliance and sustainability report",
      frequency: "annually",
      dueDate: "2025-04-30",
      status: "pending",
      priority: "medium",
      completionRate: 95,
      lastCompleted: "2024-04-30",
      responsibleParty: "Sustainability Officer",
      consequences: "Regulatory penalties and potential loan acceleration",
      documents: ["environmental-report-2024.pdf"],
      automationLevel: "semi_automated",
      reminderSent: false,
    },
  ]);

  const loans = [
    { id: "loan-001", name: "TechCorp $50M Term Loan" },
    { id: "loan-002", name: "ManufacturingCo $25M Revolver" },
    { id: "loan-003", name: "RetailChain $100M Credit Facility" },
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Obligation Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4" />
              <p>Calendar view coming soon</p>
              <p className="text-sm">
                Interactive calendar showing all upcoming obligations and
                deadlines
              </p>
            </div>
          </CardContent>
        </Card>
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
