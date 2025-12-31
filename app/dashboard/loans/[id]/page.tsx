"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Progress } from "@/components/ui/Progress";
import {
  ArrowLeft,
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
  AlertTriangle,
  CheckCircle2,
  Info,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { LoanData } from "@/components/digital-loans/types";

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState<LoanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading - replace with actual API call
    const loadLoan = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock loan data based on ID
      const mockLoan: LoanData = {
        id: params.id as string,
        borrower: "Global Manufacturing Corp",
        lender: "JPMorgan Chase Bank, N.A.",
        amount: 250000000,
        currency: "USD",
        interestRate: 4.75,
        term: 60,
        maturityDate: "2029-12-31",
        facilityType: "Revolving Credit Facility",
        status: "active",
        purpose: "General corporate purposes and working capital",
        riskRating: "BBB",
        covenants: [
          {
            type: "financial",
            description: "Leverage Ratio ≤ 3.50:1.00",
            status: "compliant",
          },
          {
            type: "financial",
            description: "Interest Coverage Ratio ≥ 4.00:1.00",
            status: "compliant",
          },
          {
            type: "operational",
            description: "Material Adverse Change",
            status: "compliant",
          },
        ],
        documents: [
          {
            id: "DOC-001",
            name: "Credit Agreement",
            type: "Legal Document",
            uploadedAt: "2024-01-15",
            processed: true,
          },
          {
            id: "DOC-002",
            name: "Financial Statements Q4 2023",
            type: "Financial Report",
            uploadedAt: "2024-01-20",
            processed: true,
          },
        ],
        createdAt: "2024-01-15",
        updatedAt: "2024-01-20",
        esgScore: 75,
        sustainabilityLinked: true,
      };

      setLoan(mockLoan);
      setIsLoading(false);
    };

    loadLoan();
  }, [params.id]);

  if (isLoading) {
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
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-64"></div>
              <div className="h-4 bg-muted rounded w-48"></div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!loan) {
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
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Loan Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The loan you're looking for doesn't exist.
              </p>
              <Link href="/dashboard/loans">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Loans
                </Button>
              </Link>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
                <div className="flex items-center gap-4">
                  <Link href="/dashboard/loans">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Loans
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      {loan.borrower}
                    </h1>
                    <p className="text-muted-foreground">
                      {loan.facilityType} • {formatCurrency(loan.amount)}
                    </p>
                  </div>
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
                    <Badge className="bg-green-500 text-white">
                      <Leaf className="h-4 w-4 mr-1" />
                      ESG
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => toast.info("Edit functionality coming soon")}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.info("Download functionality coming soon")
                    }
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.info("Share functionality coming soon")
                    }
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Loan Amount
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(loan.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {loan.currency}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Interest Rate
                        </span>
                      </div>
                      <p className="text-2xl font-bold">{loan.interestRate}%</p>
                      <p className="text-xs text-muted-foreground">
                        All-in rate
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Term
                        </span>
                      </div>
                      <p className="text-2xl font-bold">{loan.term} months</p>
                      <p className="text-xs text-muted-foreground">
                        Maturity: {formatDate(loan.maturityDate)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Risk Rating
                        </span>
                      </div>
                      <p className="text-2xl font-bold">{loan.riskRating}</p>
                      {loan.esgScore && (
                        <p className="text-xs text-muted-foreground">
                          ESG Score: {loan.esgScore}/100
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Main Content */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="terms">Terms</TabsTrigger>
                    <TabsTrigger value="covenants">Covenants</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
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
                            <Label className="text-muted-foreground">
                              Borrower
                            </Label>
                            <p className="font-semibold">{loan.borrower}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">
                              Lender
                            </Label>
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
                            <Label className="text-muted-foreground">
                              Type
                            </Label>
                            <p className="font-semibold">{loan.facilityType}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">
                              Purpose
                            </Label>
                            <p className="font-semibold">{loan.purpose}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">
                              Status
                            </Label>
                            <Badge variant="outline">{loan.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {loan.esgScore && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-green-600" />
                            ESG Performance
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">
                                  Overall ESG Score
                                </span>
                                <span className="font-bold">
                                  {loan.esgScore}/100
                                </span>
                              </div>
                              <Progress value={loan.esgScore} className="h-3" />
                            </div>
                            {loan.sustainabilityLinked && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm">
                                  Sustainability-Linked Loan
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
                              <Label className="text-muted-foreground">
                                Currency
                              </Label>
                              <p className="font-semibold">{loan.currency}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">
                                Interest Rate
                              </Label>
                              <p className="font-semibold">
                                {loan.interestRate}%
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-muted-foreground">
                                Term
                              </Label>
                              <p className="font-semibold">
                                {loan.term} months
                              </p>
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
                              <Label className="text-muted-foreground">
                                Risk Rating
                              </Label>
                              <Badge variant="outline">{loan.riskRating}</Badge>
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
                              <div className="flex-1">
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
                              <div className="flex items-center gap-2">
                                {covenant.status === "compliant" && (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                )}
                                {covenant.status === "warning" && (
                                  <Info className="h-5 w-5 text-yellow-500" />
                                )}
                                {covenant.status === "breach" && (
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                )}
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
                                    {doc.type} • Uploaded{" "}
                                    {formatDate(doc.uploadedAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    doc.processed ? "default" : "secondary"
                                  }
                                >
                                  {doc.processed ? "Processed" : "Processing"}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toast.info(
                                      "Download functionality coming soon"
                                    )
                                  }
                                >
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
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
