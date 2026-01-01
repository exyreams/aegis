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
  CheckCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  Upload,
  User,
  Calendar,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface VerificationRequest {
  id: string;
  metricId: string;
  metricName: string;
  requestedBy: string;
  requestDate: string;
  verifier?: string;
  status: "pending" | "in_progress" | "verified" | "rejected";
  documents: string[];
  notes?: string;
  verificationDate?: string;
  expiryDate?: string;
}

interface VerificationWorkflowProps {
  metricId?: string;
  metricName?: string;
  onVerificationComplete?: (verified: boolean) => void;
}

export function VerificationWorkflow({
  metricId,
  metricName,
  onVerificationComplete,
}: VerificationWorkflowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVerifier, setSelectedVerifier] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  // Mock verification requests
  const [verificationRequests] = useState<VerificationRequest[]>([
    {
      id: "1",
      metricId: "1",
      metricName: "Carbon Emissions",
      requestedBy: "John Smith",
      requestDate: "2024-12-15",
      verifier: "EcoVerify Ltd",
      status: "verified",
      documents: ["emissions-report-2024.pdf", "carbon-audit.pdf"],
      notes: "Verified against ISO 14064 standards",
      verificationDate: "2024-12-20",
      expiryDate: "2025-12-20",
    },
    {
      id: "2",
      metricId: "2",
      metricName: "Employee Diversity",
      requestedBy: "Sarah Johnson",
      requestDate: "2024-12-10",
      verifier: "HR Audit Partners",
      status: "in_progress",
      documents: ["diversity-report.pdf"],
      notes: "Awaiting additional documentation",
    },
    {
      id: "3",
      metricId: "3",
      metricName: "Board Independence",
      requestedBy: "Mike Chen",
      requestDate: "2024-12-05",
      status: "pending",
      documents: ["board-composition.pdf"],
    },
  ]);

  const verifiers = [
    "EcoVerify Ltd",
    "Sustainability Assurance Co",
    "Green Audit Partners",
    "ESG Verification Services",
    "Climate Data Validators",
  ];

  const handleRequestVerification = () => {
    if (!selectedVerifier) {
      toast.error("Please select a verifier");
      return;
    }

    toast.success("Verification request submitted successfully");
    setIsOpen(false);
    setSelectedVerifier("");
    setDocuments([]);
    setNotes("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Data Verification</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Request Verification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Data Verification</DialogTitle>
              <DialogDescription>
                Submit your ESG metric for third-party verification
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="metric">Metric</Label>
                <Input
                  id="metric"
                  value={metricName || "Carbon Emissions"}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="verifier">Select Verifier</Label>
                <Select
                  value={selectedVerifier}
                  onValueChange={setSelectedVerifier}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a verification partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {verifiers.map((verifier) => (
                      <SelectItem key={verifier} value={verifier}>
                        {verifier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="documents">Supporting Documents</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Drop files here or click to upload
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, Excel, or CSV files
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information for the verifier..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button onClick={handleRequestVerification} className="w-full">
                Submit Verification Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {verificationRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {request.metricName}
                </CardTitle>
                <Badge className={getStatusColor(request.status)}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1 capitalize">{request.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Requested by:</span>
                  <span className="ml-1 font-medium">
                    {request.requestedBy}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-1 font-medium">
                    {request.requestDate}
                  </span>
                </div>
              </div>

              {request.verifier && (
                <div className="flex items-center text-sm">
                  <Shield className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">Verifier:</span>
                  <span className="ml-1 font-medium">{request.verifier}</span>
                </div>
              )}

              <div className="flex items-center text-sm">
                <FileCheck className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-600">Documents:</span>
                <span className="ml-1 font-medium">
                  {request.documents.length} files
                </span>
              </div>

              {request.notes && (
                <div className="text-sm">
                  <span className="text-gray-600">Notes:</span>
                  <p className="mt-1 text-gray-800">{request.notes}</p>
                </div>
              )}

              {request.status === "verified" && request.expiryDate && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center text-sm text-green-800">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>Verified until {request.expiryDate}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
