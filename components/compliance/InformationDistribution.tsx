"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Send,
  Upload,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Mail,
  Bell,
  Eye,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

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
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<string>("all");

  // Mock information requests
  const [requests] = useState<InformationRequest[]>([
    {
      id: "1",
      loanId: "loan-001",
      loanName: "TechCorp $50M Term Loan",
      borrower: "TechCorp Industries",
      requestType: "financial_statements",
      title: "Q4 2024 Financial Statements",
      description:
        "Please provide audited financial statements for Q4 2024 including balance sheet, income statement, and cash flow statement",
      dueDate: "2025-02-15",
      priority: "high",
      status: "pending",
      requestedBy: "Sarah Johnson (Lender)",
      requestDate: "2025-01-01",
      documents: [],
      comments: [
        {
          id: "1",
          author: "Sarah Johnson",
          message:
            "Please ensure the statements are audited and include all subsidiaries",
          timestamp: "2025-01-01 10:00",
        },
      ],
    },
    {
      id: "2",
      loanId: "loan-001",
      loanName: "TechCorp $50M Term Loan",
      borrower: "TechCorp Industries",
      requestType: "compliance_certificate",
      title: "Q4 2024 Compliance Certificate",
      description:
        "Compliance certificate confirming adherence to all financial covenants",
      dueDate: "2025-01-31",
      priority: "medium",
      status: "submitted",
      requestedBy: "Mike Chen (Lender)",
      requestDate: "2024-12-15",
      submittedDate: "2025-01-15",
      documents: [
        "compliance-certificate-q4-2024.pdf",
        "covenant-calculations.xlsx",
      ],
      comments: [],
    },
    {
      id: "3",
      loanId: "loan-002",
      loanName: "ManufacturingCo $25M Revolver",
      borrower: "ManufacturingCo Ltd",
      requestType: "material_event",
      title: "Acquisition Notification",
      description:
        "Details regarding the proposed acquisition of subsidiary company",
      dueDate: "2025-01-20",
      priority: "urgent",
      status: "under_review",
      requestedBy: "Legal Team",
      requestDate: "2025-01-05",
      submittedDate: "2025-01-10",
      documents: ["acquisition-agreement.pdf", "financial-projections.xlsx"],
      comments: [
        {
          id: "1",
          author: "Legal Team",
          message: "Please provide additional details on financing structure",
          timestamp: "2025-01-12 14:30",
        },
      ],
    },
  ]);

  // Mock notification templates
  const [templates] = useState<NotificationTemplate[]>([
    {
      id: "1",
      name: "Covenant Breach Alert",
      type: "covenant_breach",
      recipients: ["lender@bank.com", "borrower@company.com", "legal@bank.com"],
      subject: "URGENT: Covenant Breach Detected - {loan_name}",
      message:
        "A covenant breach has been detected for {borrower}. Immediate attention required.",
      frequency: "immediate",
      active: true,
    },
    {
      id: "2",
      name: "Monthly Reporting Reminder",
      type: "reporting_due",
      recipients: ["borrower@company.com", "cfo@company.com"],
      subject: "Monthly Financial Reporting Due - {loan_name}",
      message:
        "Your monthly financial reports are due in 5 days. Please submit via the portal.",
      frequency: "monthly",
      active: true,
    },
    {
      id: "3",
      name: "Material Event Notification",
      type: "material_event",
      recipients: ["lender@bank.com", "risk@bank.com"],
      subject: "Material Event Reported - {borrower}",
      message:
        "A material event has been reported by {borrower}. Please review immediately.",
      frequency: "immediate",
      active: true,
    },
  ]);

  // Mock material events
  const [events] = useState<MaterialEvent[]>([
    {
      id: "1",
      loanId: "loan-001",
      borrower: "TechCorp Industries",
      eventType: "acquisition",
      title: "Acquisition of AI Startup",
      description:
        "TechCorp is acquiring an AI startup for $15M to expand their machine learning capabilities",
      impact: "medium",
      reportedDate: "2025-01-05",
      eventDate: "2025-01-03",
      status: "under_review",
      notificationSent: true,
    },
    {
      id: "2",
      loanId: "loan-002",
      borrower: "ManufacturingCo Ltd",
      eventType: "litigation",
      title: "Product Liability Lawsuit",
      description:
        "Class action lawsuit filed regarding product defects, potential exposure $5M",
      impact: "high",
      reportedDate: "2024-12-20",
      eventDate: "2024-12-18",
      status: "ongoing",
      notificationSent: true,
    },
    {
      id: "3",
      loanId: "loan-003",
      borrower: "RetailChain Corp",
      eventType: "operational",
      title: "Store Closure Program",
      description: "Closing 15 underperforming stores to improve profitability",
      impact: "medium",
      reportedDate: "2024-12-15",
      eventDate: "2024-12-10",
      status: "resolved",
      notificationSent: true,
    },
  ]);

  const loans = [
    { id: "loan-001", name: "TechCorp $50M Term Loan" },
    { id: "loan-002", name: "ManufacturingCo $25M Revolver" },
    { id: "loan-003", name: "RetailChain $100M Credit Facility" },
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
                <div className="text-sm text-gray-600">Total Requests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {requestStats.pending}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {requestStats.overdue}
                </div>
                <div className="text-sm text-gray-600">Overdue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {requestStats.submitted}
                </div>
                <div className="text-sm text-gray-600">Submitted</div>
              </CardContent>
            </Card>
          </div>

          {/* Request List */}
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {request.requestType.replace("_", " ")}
                        </Badge>
                        <Badge
                          className={getPriorityColor(request.priority)}
                          variant="secondary"
                        >
                          {request.priority}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">
                        {request.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {request.borrower} • {request.loanName}
                      </p>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">
                        {request.status.replace("_", " ")}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">{request.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Requested by:</span>
                      <span className="ml-1 font-medium">
                        {request.requestedBy}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Due Date:</span>
                      <span
                        className={`ml-1 font-medium ${
                          new Date(request.dueDate) < new Date()
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {request.dueDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Documents:</span>
                      <span className="ml-1 font-medium">
                        {request.documents.length} files
                      </span>
                    </div>
                  </div>

                  {request.comments.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm font-medium mb-2">
                        Latest Comment
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">
                          {request.comments[request.comments.length - 1].author}
                          :
                        </span>
                        <span className="ml-1">
                          {
                            request.comments[request.comments.length - 1]
                              .message
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Requested: {request.requestDate}
                      {request.submittedDate &&
                        ` • Submitted: ${request.submittedDate}`}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {request.status === "pending" && (
                        <Button size="sm">
                          <Upload className="h-4 w-4 mr-1" />
                          Submit Response
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
                      <p className="text-sm text-gray-600">
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
                    <div className="text-sm text-gray-700">
                      {template.subject}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Message</div>
                    <div className="text-sm text-gray-700">
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
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
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
                      <p className="text-sm text-gray-600">{event.borrower}</p>
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
                  <p className="text-sm text-gray-700">{event.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Event Date:</span>
                      <span className="ml-1 font-medium">
                        {event.eventDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Reported:</span>
                      <span className="ml-1 font-medium">
                        {event.reportedDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Notification:</span>
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
                      <AlertTriangle className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
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
