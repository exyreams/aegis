"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
  Share2,
  Users,
  Lock,
  Eye,
  Download,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface DataShareRequest {
  id: string;
  fromOrganization: string;
  toOrganization: string;
  dataType: string;
  metrics: string[];
  status: "pending" | "approved" | "rejected" | "expired";
  requestDate: string;
  expiryDate?: string;
  accessLevel: "view" | "download" | "full";
  purpose: string;
}

interface SharedDataset {
  id: string;
  name: string;
  organization: string;
  sharedWith: string[];
  metrics: number;
  lastUpdated: string;
  accessLevel: "view" | "download" | "full";
  downloads: number;
}

export function DataSharingHub() {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [accessLevel, setAccessLevel] = useState<"view" | "download" | "full">(
    "view"
  );
  const [purpose, setPurpose] = useState("");

  // Mock data sharing requests
  const [shareRequests] = useState<DataShareRequest[]>([
    {
      id: "1",
      fromOrganization: "GreenTech Industries",
      toOrganization: "Sustainable Bank",
      dataType: "ESG Metrics",
      metrics: ["Carbon Emissions", "Energy Consumption", "Waste Management"],
      status: "approved",
      requestDate: "2024-12-10",
      expiryDate: "2025-06-10",
      accessLevel: "download",
      purpose: "Loan application assessment",
    },
    {
      id: "2",
      fromOrganization: "EcoSolutions Ltd",
      toOrganization: "Green Finance Corp",
      dataType: "Sustainability Report",
      metrics: ["Water Usage", "Employee Diversity", "Board Independence"],
      status: "pending",
      requestDate: "2024-12-15",
      accessLevel: "view",
      purpose: "Due diligence for green bond issuance",
    },
    {
      id: "3",
      fromOrganization: "CleanEnergy Co",
      toOrganization: "Impact Investors",
      dataType: "Environmental Data",
      metrics: ["Renewable Energy %", "Carbon Footprint"],
      status: "approved",
      requestDate: "2024-12-05",
      expiryDate: "2025-03-05",
      accessLevel: "full",
      purpose: "Investment decision analysis",
    },
  ]);

  // Mock shared datasets
  const [sharedDatasets] = useState<SharedDataset[]>([
    {
      id: "1",
      name: "Q4 2024 ESG Performance",
      organization: "GreenTech Industries",
      sharedWith: ["Sustainable Bank", "Green Finance Corp"],
      metrics: 15,
      lastUpdated: "2024-12-20",
      accessLevel: "download",
      downloads: 3,
    },
    {
      id: "2",
      name: "Annual Sustainability Report 2024",
      organization: "EcoSolutions Ltd",
      sharedWith: ["Impact Investors"],
      metrics: 25,
      lastUpdated: "2024-12-18",
      accessLevel: "view",
      downloads: 1,
    },
  ]);

  const organizations = [
    "Sustainable Bank",
    "Green Finance Corp",
    "Impact Investors",
    "ESG Rating Agency",
    "Climate Risk Assessors",
  ];

  const availableMetrics = [
    "Carbon Emissions",
    "Energy Consumption",
    "Water Usage",
    "Waste Management",
    "Employee Diversity",
    "Board Independence",
    "Renewable Energy %",
    "Carbon Footprint",
  ];

  const handleShareData = () => {
    if (!selectedOrganization || selectedMetrics.length === 0) {
      toast.error("Please select organization and metrics");
      return;
    }

    toast.success("Data sharing request sent successfully");
    setIsShareDialogOpen(false);
    setSelectedOrganization("");
    setSelectedMetrics([]);
    setPurpose("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "full":
        return "bg-blue-100 text-blue-800";
      case "download":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Data Sharing Hub</h3>
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Share2 className="h-4 w-4 mr-2" />
              Share Data
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share ESG Data</DialogTitle>
              <DialogDescription>
                Securely share your ESG metrics with lenders or partners
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="organization">Share With</Label>
                <Select
                  value={selectedOrganization}
                  onValueChange={setSelectedOrganization}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org} value={org}>
                        {org}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Select Metrics</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableMetrics.map((metric) => (
                    <label key={metric} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMetrics([...selectedMetrics, metric]);
                          } else {
                            setSelectedMetrics(
                              selectedMetrics.filter((m) => m !== metric)
                            );
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{metric}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="access">Access Level</Label>
                <Select
                  value={accessLevel}
                  onValueChange={(value: "view" | "download" | "full") =>
                    setAccessLevel(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="download">View & Download</SelectItem>
                    <SelectItem value="full">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  placeholder="e.g., Loan application assessment"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <Button onClick={handleShareData} className="w-full">
                Send Sharing Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Sharing Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Sharing Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shareRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {request.fromOrganization}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="font-medium">
                      {request.toOrganization}
                    </span>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1 capitalize">{request.status}</span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Data Type:</span>
                    <span className="ml-1 font-medium">{request.dataType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Access Level:</span>
                    <Badge
                      className={getAccessLevelColor(request.accessLevel)}
                      variant="secondary"
                    >
                      {request.accessLevel}
                    </Badge>
                  </div>
                </div>

                <div className="text-sm mb-3">
                  <span className="text-gray-600">Metrics:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {request.metrics.map((metric) => (
                      <Badge key={metric} variant="outline" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">Purpose:</span>
                  <span className="ml-1">{request.purpose}</span>
                </div>

                {request.status === "approved" && request.expiryDate && (
                  <div className="mt-3 text-sm text-green-600">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Access expires: {request.expiryDate}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shared Datasets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Shared Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sharedDatasets.map((dataset) => (
              <div key={dataset.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{dataset.name}</h4>
                  <Badge
                    className={getAccessLevelColor(dataset.accessLevel)}
                    variant="secondary"
                  >
                    {dataset.accessLevel}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Metrics:</span>
                    <span className="ml-1 font-medium">{dataset.metrics}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Downloads:</span>
                    <span className="ml-1 font-medium">
                      {dataset.downloads}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Updated:</span>
                    <span className="ml-1 font-medium">
                      {dataset.lastUpdated}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Shared with {dataset.sharedWith.length} organizations
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
