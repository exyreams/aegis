"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import {
  DollarSign,
  Calendar,
  Building2,
  Users,
  FileText,
  TrendingUp,
  Shield,
  Edit,
  Download,
  Share,
  X,
} from "lucide-react";
import { LoanData } from "./types";

interface LoanDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: LoanData | null;
  onEdit?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function LoanDetailsModal({
  open,
  onOpenChange,
  loan,
  onEdit,
  onDownload,
  onShare,
}: LoanDetailsModalProps) {
  if (!loan) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: loan.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{loan.borrower}</DialogTitle>
              <p className="text-muted-foreground mt-1">
                {loan.facilityType} • {formatCurrency(loan.amount)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  loan.status === "active"
                    ? "default"
                    : loan.status === "approved"
                    ? "secondary"
                    : "outline"
                }
              >
                {loan.status}
              </Badge>
              <Badge variant="outline">{loan.riskRating}</Badge>
              {loan.sustainabilityLinked && (
                <Badge className="bg-green-500 text-white">ESG</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="covenants">Covenants</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">
                      Amount
                    </span>
                  </div>
                  <p className="text-xl font-bold">
                    {formatCurrency(loan.amount)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Rate</span>
                  </div>
                  <p className="text-xl font-bold">{loan.interestRate}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Term</span>
                  </div>
                  <p className="text-xl font-bold">{loan.term} months</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-muted-foreground">
                      Rating
                    </span>
                  </div>
                  <p className="text-xl font-bold">{loan.riskRating}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Parties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Borrower</Label>
                    <p className="font-semibold">{loan.borrower}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Lender</Label>
                    <p className="font-semibold">{loan.lender}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Facility Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <p className="font-semibold">{loan.facilityType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Purpose</Label>
                    <p className="font-semibold">{loan.purpose}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Maturity</Label>
                    <p className="font-semibold">
                      {formatDate(loan.maturityDate)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="terms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">
                        Principal Amount
                      </Label>
                      <p className="text-lg font-semibold">
                        {formatCurrency(loan.amount)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Currency</Label>
                      <p className="font-semibold">{loan.currency}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Interest Rate
                      </Label>
                      <p className="font-semibold">{loan.interestRate}%</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Term</Label>
                      <p className="font-semibold">{loan.term} months</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Maturity Date
                      </Label>
                      <p className="font-semibold">
                        {formatDate(loan.maturityDate)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge variant="outline">{loan.status}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="covenants" className="space-y-6">
            <div className="space-y-4">
              {loan.covenants.map((covenant, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold mb-1">
                          {covenant.description}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Type: {covenant.type}
                        </p>
                        <Badge
                          variant={
                            covenant.status === "compliant"
                              ? "default"
                              : covenant.status === "warning"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {covenant.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="space-y-4">
              {loan.documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {doc.type} • Uploaded {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={doc.processed ? "default" : "secondary"}
                        >
                          {doc.processed ? "Processed" : "Processing"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={onShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
