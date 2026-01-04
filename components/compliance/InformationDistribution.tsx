"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
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
  Send,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Bell,
  Eye,
  Plus,
} from "lucide-react";

interface InformationRequest {
  id: string;
  loanId: string;
  loanName: string;
  borrower: string;
  requestType:
    | "financial_statements"
    | "compliance_certificate"
    | "covenant_calculation"
    | "material_event"
    | "other";
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "submitted" | "under_review" | "approved" | "rejected";
  requestedBy: string;
  requestDate: string;
  submittedDate?: string;
  documents: string[];
  comments: Array<{
    id: string;
    author: string;
    message: string;
    timestamp: string;
  }>;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type:
    | "covenant_breach"
    | "reporting_due"
    | "material_event"
    | "payment_due"
    | "custom";
  recipients: string[];
  subject: string;
  message: string;
  frequency: "immediate" | "daily" | "weekly" | "monthly";
  active: boolean;
}

interface MaterialEvent {
  id: string;
  loanId: string;
  borrower: string;
  eventType:
    | "acquisition"
    | "disposal"
    | "litigation"
    | "regulatory"
    | "financial"
    | "operational"
    | "other";
  title: string;
  description: string;
  impact: "low" | "medium" | "high" | "critical";
  reportedDate: string;
  eventDate: string;
  status: "reported" | "under_review" | "resolved" | "ongoing";
  notificationSent: boolean;
}

export function InformationDistribution() {
  const [activeTab, setActiveTab] = useState<
    "requests" | "notifications" | "events"
  >("requests");

  const [selectedLoan, setSelectedLoan] = useState<string>("all");

  // Mock information requests - realistic loan market scenarios
  const [requests] = useState<InformationRequest[]>([
    {
      id: "1",
      loanId: "loan-001",
      loanName: "Meridian Holdings £75M Senior Secured",
      borrower: "Meridian Holdings PLC",
      requestType: "financial_statements",
      title: "FY2024 Audited Financial Statements",
      description:
        "Please provide audited consolidated financial statements for FY2024 prepared in accordance with IFRS, including auditor's report, notes to accounts, and management discussion & analysis",
      dueDate: "2025-04-30",
      priority: "high",
      status: "pending",
      requestedBy: "Agent Bank - Facility Administration",
      requestDate: "2025-01-02",
      documents: [],
      comments: [
        {
          id: "1",
          author: "Agent Bank",
          message:
            "Please ensure statements include segment reporting and related party disclosures as required under the Facility Agreement",
          timestamp: "2025-01-02 09:30",
        },
      ],
    },
    {
      id: "2",
      loanId: "loan-001",
      loanName: "Meridian Holdings £75M Senior Secured",
      borrower: "Meridian Holdings PLC",
      requestType: "compliance_certificate",
      title: "Q4 2024 Compliance Certificate",
      description:
        "Quarterly compliance certificate signed by two directors confirming covenant compliance with detailed calculations",
      dueDate: "2025-01-31",
      priority: "high",
      status: "submitted",
      requestedBy: "Agent Bank - Credit Team",
      requestDate: "2024-12-15",
      submittedDate: "2025-01-15",
      documents: [
        "compliance-certificate-q4-2024.pdf",
        "covenant-calculations-q4-2024.xlsx",
      ],
      comments: [],
    },
    {
      id: "3",
      loanId: "loan-003",
      loanName: "Atlas Logistics $200M ABL Facility",
      borrower: "Atlas Logistics Inc",
      requestType: "covenant_calculation",
      title: "Borrowing Base Certificate - Week 1 Jan 2025",
      description:
        "Weekly borrowing base certificate with eligible receivables aging, inventory valuation, and concentration limit calculations",
      dueDate: "2025-01-07",
      priority: "urgent",
      status: "under_review",
      requestedBy: "ABL Agent - Collateral Team",
      requestDate: "2025-01-02",
      submittedDate: "2025-01-06",
      documents: [
        "borrowing-base-cert-wk1-jan25.xlsx",
        "ar-aging-report.pdf",
        "inventory-valuation.pdf",
      ],
      comments: [
        {
          id: "1",
          author: "Collateral Team",
          message:
            "Please clarify the treatment of the $2.3M receivable from Customer ABC - appears to be over 90 days",
          timestamp: "2025-01-07 11:45",
        },
      ],
    },
    {
      id: "4",
      loanId: "loan-002",
      loanName: "Nordic Energy €120M Green Loan",
      borrower: "Nordic Energy AS",
      requestType: "other",
      title: "Green Loan Annual Review Documentation",
      description:
        "Annual sustainability performance report, third-party verification of KPIs, and updated Use of Proceeds report for Green Loan compliance",
      dueDate: "2025-01-31",
      priority: "high",
      status: "pending",
      requestedBy: "Sustainability-Linked Loan Coordinator",
      requestDate: "2024-12-20",
      documents: ["green-loan-framework.pdf"],
      comments: [
        {
          id: "1",
          author: "SLL Coordinator",
          message:
            "Third-party verification must be from an approved ESG rating agency per Schedule 12",
          timestamp: "2024-12-20 14:00",
        },
      ],
    },
  ]);

  // Mock notification templates - LMA-style notifications
  const [templates] = useState<NotificationTemplate[]>([
    {
      id: "1",
      name: "Covenant Breach Alert",
      type: "covenant_breach",
      recipients: [
        "agent@facilitybank.com",
        "credit.risk@facilitybank.com",
        "borrower.treasury@company.com",
      ],
      subject: "URGENT: Covenant Breach Notification - {loan_name}",
      message:
        "A financial covenant breach has been identified for {borrower} under the {loan_name}. The {covenant_name} covenant has been breached with current value of {current_value} against threshold of {threshold}. Immediate remediation action is required within the cure period specified in the Facility Agreement.",
      frequency: "immediate",
      active: true,
    },
    {
      id: "2",
      name: "Quarterly Reporting Reminder",
      type: "reporting_due",
      recipients: ["borrower.cfo@company.com", "borrower.treasury@company.com"],
      subject: "Reminder: Quarterly Compliance Certificate Due - {loan_name}",
      message:
        "This is a reminder that your quarterly compliance certificate and financial statements are due within 45 days of quarter end as per Schedule 5 of the Facility Agreement. Please submit via the secure portal.",
      frequency: "monthly",
      active: true,
    },
    {
      id: "3",
      name: "Material Event Notification",
      type: "material_event",
      recipients: ["agent@facilitybank.com", "syndicate.desk@facilitybank.com"],
      subject: "Material Event Notification - {borrower}",
      message:
        "A material event has been reported by {borrower} which may constitute a Notifiable Event under Clause 19 of the Facility Agreement. Please review the attached documentation and assess any required lender actions.",
      frequency: "immediate",
      active: true,
    },
    {
      id: "4",
      name: "Interest Payment Reminder",
      type: "payment_due",
      recipients: [
        "borrower.treasury@company.com",
        "agent.operations@facilitybank.com",
      ],
      subject: "Interest Payment Due - {loan_name}",
      message:
        "Interest payment of {amount} is due on {due_date} for the current Interest Period. Please ensure funds are available in the designated account by 11:00am London time on the due date.",
      frequency: "immediate",
      active: true,
    },
  ]);

  // Mock material events - realistic loan market scenarios
  const [events] = useState<MaterialEvent[]>([
    {
      id: "1",
      loanId: "loan-001",
      borrower: "Meridian Holdings PLC",
      eventType: "acquisition",
      title: "Proposed Acquisition of TechSub Ltd",
      description:
        "Meridian Holdings proposes to acquire 100% of TechSub Ltd for £8.5M consideration. Transaction requires Majority Lender consent under Clause 22.3 (Permitted Acquisitions) as consideration exceeds £5M threshold.",
      impact: "medium",
      reportedDate: "2025-01-03",
      eventDate: "2025-01-02",
      status: "under_review",
      notificationSent: true,
    },
    {
      id: "2",
      loanId: "loan-003",
      borrower: "Atlas Logistics Inc",
      eventType: "litigation",
      title: "Employment Class Action Filed",
      description:
        "Class action lawsuit filed in California Superior Court alleging wage and hour violations. Potential exposure estimated at $4.2M. May constitute Material Adverse Effect under Facility Agreement.",
      impact: "high",
      reportedDate: "2024-12-28",
      eventDate: "2024-12-20",
      status: "ongoing",
      notificationSent: true,
    },
    {
      id: "3",
      loanId: "loan-002",
      borrower: "Nordic Energy AS",
      eventType: "regulatory",
      title: "Environmental Permit Renewal Approved",
      description:
        "Key environmental operating permit for wind farm operations renewed for 10-year term. Removes regulatory uncertainty previously flagged in credit assessment.",
      impact: "low",
      reportedDate: "2024-12-15",
      eventDate: "2024-12-12",
      status: "resolved",
      notificationSent: true,
    },
    {
      id: "4",
      loanId: "loan-001",
      borrower: "Meridian Holdings PLC",
      eventType: "financial",
      title: "Change in Accounting Policy",
      description:
        "Adoption of IFRS 16 lease accounting standard resulting in £12M increase in reported debt. Impact on covenant calculations to be assessed at next test date.",
      impact: "medium",
      reportedDate: "2025-01-02",
      eventDate: "2025-01-01",
      status: "under_review",
      notificationSent: true,
    },
  ]);

  const loans = [
    { id: "loan-001", name: "Meridian Holdings £75M Senior Secured" },
    { id: "loan-002", name: "Nordic Energy €120M Green Loan" },
    { id: "loan-003", name: "Atlas Logistics $200M ABL Facility" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
      case "under_review":
      case "ongoing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "submitted":
      case "reported":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "resolved":
        return "bg-green-100 text-green-800";
      case "pending":
      case "under_review":
      case "ongoing":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "submitted":
      case "reported":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
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

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  const filteredRequests =
    selectedLoan === "all"
      ? requests
      : requests.filter((r) => r.loanId === selectedLoan);

  const filteredEvents =
    selectedLoan === "all"
      ? events
      : events.filter((e) => e.loanId === selectedLoan);

  const requestStats = {
    total: filteredRequests.length,
    pending: filteredRequests.filter((r) => r.status === "pending").length,
    overdue: filteredRequests.filter(
      (r) => new Date(r.dueDate) < new Date() && r.status === "pending"
    ).length,
    submitted: filteredRequests.filter((r) => r.status === "submitted").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Information Distribution</h3>
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b">
        <Button
          variant={activeTab === "requests" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("requests")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Information Requests
        </Button>
        <Button
          variant={activeTab === "notifications" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("notifications")}
        >
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
        <Button
          variant={activeTab === "events" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("events")}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Material Events
        </Button>
      </div>

      {/* Information Requests Tab */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {/* Request Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{requestStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {requestStats.pending}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {requestStats.overdue}
                </div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {requestStats.submitted}
                </div>
                <div className="text-sm text-muted-foreground">Submitted</div>
              </CardContent>
            </Card>
          </div>

          {/* Request List - Table Refactor */}
          <div className="rounded-md border bg-card/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[220px]">Request / Source</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id} className="cursor-pointer hover:bg-muted/40 transition-colors group">
                <TableCell>
                  <div className="font-semibold text-sm group-hover:text-primary transition-colors">{request.title}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                     <Users className="h-3 w-3" /> {request.requestedBy}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] px-1.5 h-5 capitalize">
                    {request.requestType.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{request.dueDate}</span>
                    <span className="text-[10px] text-muted-foreground">Req: {request.requestDate}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <Badge className={`${getPriorityColor(request.priority)} border-0 px-2 h-6 text-xs`}>
                    {request.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                   <Badge className={`${getStatusColor(request.status)} border-0 shadow-none px-2 h-6`}>
                    <div className="flex items-center gap-1.5 text-xs">
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status.replace("_", " ")}</span>
                    </div>
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-xs">
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-xs">
                        <Upload className="h-3.5 w-3.5" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-7 w-7 text-xs">
                        <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold">Notification Templates</h4>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {template.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {template.type.replace("_", " ")} • {template.frequency}
                      </p>
                    </div>
                    <Badge variant={template.active ? "default" : "secondary"}>
                      {template.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Subject</div>
                    <div className="text-sm text-foreground/80">
                      {template.subject}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Message</div>
                    <div className="text-sm text-foreground/80">
                      {template.message}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Recipients</div>
                    <div className="flex flex-wrap gap-1">
                      {template.recipients.map((recipient, index) => (
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
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {template.recipients.length} recipients
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Test Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Material Events Tab */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold">Material Events</h4>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Report Event
            </Button>
          </div>

          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {event.eventType}
                        </Badge>
                        <Badge
                          className={getImpactColor(event.impact)}
                          variant="secondary"
                        >
                          {event.impact} impact
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{event.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{event.borrower}</p>
                    </div>
                    <Badge className={getStatusColor(event.status)}>
                      {getStatusIcon(event.status)}
                      <span className="ml-1 capitalize">
                        {event.status.replace("_", " ")}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground/80">{event.description}</p>
 
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Event Date:</span>
                      <span className="ml-1 font-medium">
                        {event.eventDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reported:</span>
                      <span className="ml-1 font-medium">
                        {event.reportedDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Notification:</span>
                      <span
                        className={`ml-1 font-medium ${
                          event.notificationSent
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {event.notificationSent ? "Sent" : "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {event.impact.charAt(0).toUpperCase() +
                          event.impact.slice(1)}{" "}
                        impact event
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {!event.notificationSent && (
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-1" />
                          Send Notification
                        </Button>
                      )}
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
