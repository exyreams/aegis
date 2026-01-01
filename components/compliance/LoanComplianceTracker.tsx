"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
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
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  Plus,
  Eye,
  Edit,
  Bell,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

interface ComplianceItem {
  id: string;
  loanId: string;
  type:
    | "financial_covenant"
    | "information_covenant"
    | "event_notification"
    | "reporting_requirement";
  title: string;
  description: string;
  frequency: "monthly" | "quarterly" | "annually" | "event_driven" | "one_time";
  status: "compliant" | "at_risk" | "overdue" | "upcoming";
  dueDate: string;
  lastCompleted?: string;
  nextDue: string;
  responsible: string;
  priority: "low" | "medium" | "high" | "critical";
  documents: string[];
  notes?: string;
}

interface LoanComplianceTrackerProps {
  loanId?: string;
  onComplianceUpdate?: (item: ComplianceItem) => void;
}

export function LoanComplianceTracker({
  loanId = "all",
  onComplianceUpdate,
}: LoanComplianceTrackerProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Mock compliance items - realistic LMA loan compliance scenarios
  const [complianceItems] = useState<ComplianceItem[]>([
    {
      id: "1",
      loanId: "1",
      type: "financial_covenant",
      title: "Net Leverage Ratio",
      description:
        "Consolidated Total Net Debt to Consolidated EBITDA shall not exceed 3.5x",
      frequency: "quarterly",
      status: "compliant",
      dueDate: "2025-03-31",
      lastCompleted: "2024-12-31",
      nextDue: "2025-03-31",
      responsible: "Group CFO",
      priority: "high",
      documents: ["financial-statements-q4.pdf", "leverage-calculation.xlsx"],
      notes:
        "Current ratio: 3.2x - headroom of 0.3x against covenant threshold",
    },
    {
      id: "2",
      loanId: "1",
      type: "information_covenant",
      title: "Monthly Management Accounts",
      description:
        "Provide monthly management accounts within 30 days of month end",
      frequency: "monthly",
      status: "upcoming",
      dueDate: "2025-01-30",
      lastCompleted: "2024-12-30",
      nextDue: "2025-01-30",
      responsible: "Finance Team",
      priority: "medium",
      documents: ["dec-2024-management-accounts.pdf"],
    },
    {
      id: "3",
      loanId: "1",
      type: "event_notification",
      title: "Material Adverse Change",
      description:
        "Notify Agent promptly upon becoming aware of any Material Adverse Change",
      frequency: "event_driven",
      status: "compliant",
      dueDate: "N/A",
      nextDue: "Event-driven",
      responsible: "General Counsel",
      priority: "critical",
      documents: [],
      notes: "No Material Adverse Change events to report in current period",
    },
    {
      id: "4",
      loanId: "2",
      type: "reporting_requirement",
      title: "Annual Audited Financial Statements",
      description:
        "Deliver audited consolidated financial statements within 120 days of fiscal year end",
      frequency: "annually",
      status: "at_risk",
      dueDate: "2025-04-30",
      nextDue: "2025-04-30",
      responsible: "External Auditors (KPMG)",
      priority: "high",
      documents: ["audit-engagement-letter.pdf"],
      notes:
        "Audit fieldwork in progress - auditors flagged potential delay due to subsidiary consolidation issues",
    },
    {
      id: "5",
      loanId: "3",
      type: "financial_covenant",
      title: "Minimum Liquidity",
      description: "Maintain minimum aggregate liquidity of $25M at all times",
      frequency: "monthly",
      status: "overdue",
      dueDate: "2024-12-31",
      lastCompleted: "2024-11-30",
      nextDue: "2024-12-31",
      responsible: "Treasury Manager",
      priority: "critical",
      documents: [],
      notes:
        "Current liquidity: $18.5M - covenant breach. Cash Dominion Event triggered. Cure period expires 2025-02-15",
    },
    {
      id: "6",
      loanId: "2",
      type: "reporting_requirement",
      title: "Green Loan KPI Report",
      description:
        "Annual sustainability performance report with third-party verification",
      frequency: "annually",
      status: "upcoming",
      dueDate: "2025-01-31",
      lastCompleted: "2024-01-31",
      nextDue: "2025-01-31",
      responsible: "Head of Sustainability",
      priority: "high",
      documents: ["sustainability-framework.pdf", "kpi-tracker-2024.xlsx"],
      notes:
        "Third-party verification scheduled with Sustainalytics for week of Jan 20",
    },
  ]);

  const filteredItems = complianceItems.filter((item) => {
    if (loanId !== "all" && item.loanId !== loanId) return false;
    if (selectedType !== "all" && item.type !== selectedType) return false;
    if (selectedStatus !== "all" && item.status !== selectedStatus)
      return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "upcoming":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "at_risk":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "at_risk":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
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
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "financial_covenant":
        return "bg-blue-100 text-blue-800";
      case "information_covenant":
        return "bg-green-100 text-green-800";
      case "event_notification":
        return "bg-purple-100 text-purple-800";
      case "reporting_requirement":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleMarkCompliant = (itemId: string) => {
    toast.success("Compliance item marked as completed");
  };

  const handleRequestExtension = (itemId: string) => {
    toast.info("Extension request submitted to lender");
  };

  const stats = {
    total: filteredItems.length,
    compliant: filteredItems.filter((i) => i.status === "compliant").length,
    upcoming: filteredItems.filter((i) => i.status === "upcoming").length,
    atRisk: filteredItems.filter((i) => i.status === "at_risk").length,
    overdue: filteredItems.filter((i) => i.status === "overdue").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Compliance Tracking</h3>
        <div className="flex items-center gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="financial_covenant">
                Financial Covenants
              </SelectItem>
              <SelectItem value="information_covenant">
                Information Covenants
              </SelectItem>
              <SelectItem value="event_notification">
                Event Notifications
              </SelectItem>
              <SelectItem value="reporting_requirement">
                Reporting Requirements
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="compliant">Compliant</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="at_risk">At Risk</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Compliance Item</DialogTitle>
                <DialogDescription>
                  Add a new compliance requirement or covenant
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial_covenant">
                        Financial Covenant
                      </SelectItem>
                      <SelectItem value="information_covenant">
                        Information Covenant
                      </SelectItem>
                      <SelectItem value="event_notification">
                        Event Notification
                      </SelectItem>
                      <SelectItem value="reporting_requirement">
                        Reporting Requirement
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input placeholder="e.g., Debt Service Coverage Ratio" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input placeholder="e.g., Maintain DSCR of at least 1.25x" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Frequency</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                        <SelectItem value="event_driven">
                          Event Driven
                        </SelectItem>
                        <SelectItem value="one_time">One Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => setIsAddItemOpen(false)}
                >
                  Add Compliance Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.compliant}
            </div>
            <div className="text-sm text-gray-600">Compliant</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.upcoming}
            </div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.atRisk}
            </div>
            <div className="text-sm text-gray-600">At Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue}
            </div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    className={getTypeColor(item.type)}
                    variant="secondary"
                  >
                    {item.type.replace("_", " ")}
                  </Badge>
                  <Badge
                    className={getPriorityColor(item.priority)}
                    variant="secondary"
                  >
                    {item.priority}
                  </Badge>
                  <h4 className="font-medium">{item.title}</h4>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {getStatusIcon(item.status)}
                  <span className="ml-1 capitalize">
                    {item.status.replace("_", " ")}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">{item.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Frequency:</span>
                  <span className="ml-1 font-medium capitalize">
                    {item.frequency.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Responsible:</span>
                  <span className="ml-1 font-medium">{item.responsible}</span>
                </div>
                <div>
                  <span className="text-gray-600">Next Due:</span>
                  <span className="ml-1 font-medium">{item.nextDue}</span>
                </div>
                <div>
                  <span className="text-gray-600">Documents:</span>
                  <span className="ml-1 font-medium">
                    {item.documents.length} files
                  </span>
                </div>
              </div>

              {item.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm">
                    <span className="text-gray-600">Notes:</span>
                    <p className="mt-1 text-gray-800">{item.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <div className="flex space-x-2">
                  {item.status === "upcoming" || item.status === "at_risk" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestExtension(item.id)}
                      >
                        Request Extension
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleMarkCompliant(item.id)}
                      >
                        Mark Complete
                      </Button>
                    </>
                  ) : item.status === "overdue" ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRequestExtension(item.id)}
                    >
                      <Bell className="h-4 w-4 mr-1" />
                      Urgent Action
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
