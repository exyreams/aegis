"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Progress } from "@/components/ui/Progress";
import {
  BarChart3,
  Leaf,
  ArrowLeft,
  Plus,
  X,
  CheckCircle2,
  Download,
  Share,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface LoanComparisonData {
  id: string;
  borrower: string;
  lender: string;
  amount: number;
  currency: string;
  interestRate: number;
  margin: number;
  baseRate: string;
  term: number;
  maturityDate: string;
  facilityType: string;
  riskRating: string;
  esgScore?: number;
  sustainabilityLinked: boolean;
  covenants: {
    leverage?: number;
    coverage?: number;
    count: number;
  };
  fees: {
    arrangement: number;
    commitment: number;
    total: number;
  };
}

export default function LoanComparisonPage() {
  const [selectedLoans, setSelectedLoans] = useState<LoanComparisonData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock loan data for comparison
  const availableLoans: LoanComparisonData[] = [
    {
      id: "LOAN-001",
      borrower: "Global Manufacturing Corp",
      lender: "JPMorgan Chase Bank",
      amount: 250000000,
      currency: "USD",
      interestRate: 4.75,
      margin: 275,
      baseRate: "SOFR",
      term: 60,
      maturityDate: "2029-12-31",
      facilityType: "Revolving Credit",
      riskRating: "BBB",
      esgScore: 75,
      sustainabilityLinked: true,
      covenants: {
        leverage: 3.5,
        coverage: 4.0,
        count: 3,
      },
      fees: {
        arrangement: 1250000,
        commitment: 875000,
        total: 2125000,
      },
    },
    {
      id: "LOAN-002",
      borrower: "Tech Innovations Ltd",
      lender: "Goldman Sachs Bank",
      amount: 150000000,
      currency: "USD",
      interestRate: 5.25,
      margin: 325,
      baseRate: "SOFR",
      term: 36,
      maturityDate: "2027-06-30",
      facilityType: "Term Loan",
      riskRating: "BB",
      esgScore: 68,
      sustainabilityLinked: false,
      covenants: {
        leverage: 4.0,
        coverage: 3.5,
        count: 2,
      },
      fees: {
        arrangement: 750000,
        commitment: 0,
        total: 750000,
      },
    },
    {
      id: "LOAN-003",
      borrower: "Green Energy Solutions",
      lender: "Bank of America",
      amount: 500000000,
      currency: "USD",
      interestRate: 4.25,
      margin: 225,
      baseRate: "SOFR",
      term: 84,
      maturityDate: "2031-03-31",
      facilityType: "Project Finance",
      riskRating: "A",
      esgScore: 92,
      sustainabilityLinked: true,
      covenants: {
        leverage: 3.0,
        coverage: 4.5,
        count: 4,
      },
      fees: {
        arrangement: 2500000,
        commitment: 1750000,
        total: 4250000,
      },
    },
  ];

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const addLoanToComparison = (loan: LoanComparisonData) => {
    if (selectedLoans.length >= 4) {
      toast.error("Maximum 4 loans can be compared at once");
      return;
    }
    if (selectedLoans.find((l) => l.id === loan.id)) {
      toast.error("Loan already added to comparison");
      return;
    }
    setSelectedLoans([...selectedLoans, loan]);
    toast.success(`${loan.borrower} added to comparison`);
  };

  const removeLoanFromComparison = (loanId: string) => {
    setSelectedLoans(selectedLoans.filter((l) => l.id !== loanId));
  };

  const clearComparison = () => {
    setSelectedLoans([]);
    toast.info("Comparison cleared");
  };

  const exportComparison = () => {
    toast.info("Export functionality coming soon");
  };

  const shareComparison = () => {
    toast.info("Share functionality coming soon");
  };

  const filteredLoans = availableLoans.filter(
    (loan) =>
      loan.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.facilityType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getComparisonInsights = () => {
    if (selectedLoans.length < 2) return null;

    const rates = selectedLoans.map((l) => l.interestRate);
    const margins = selectedLoans.map((l) => l.margin);
    const amounts = selectedLoans.map((l) => l.amount);

    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
    const totalAmount = amounts.reduce((a, b) => a + b, 0);

    const bestRate = Math.min(...rates);
    const bestRateLoan = selectedLoans.find((l) => l.interestRate === bestRate);

    return {
      avgRate: avgRate.toFixed(2),
      avgMargin: avgMargin.toFixed(0),
      totalAmount: formatCurrency(totalAmount),
      bestRate: bestRate.toFixed(2),
      bestRateLoan: bestRateLoan?.borrower,
    };
  };

  const insights = getComparisonInsights();

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
                      Loan Comparison
                    </h1>
                    <p className="text-muted-foreground">
                      Compare loan terms and conditions across different
                      facilities
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLoans.length > 0 && (
                    <>
                      <Button variant="outline" onClick={shareComparison}>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" onClick={exportComparison}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" onClick={clearComparison}>
                        <X className="h-4 w-4 mr-2" />
                        Clear All
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Comparison Summary */}
              {selectedLoans.length > 0 && (
                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Comparison Summary
                        <Badge variant="outline">
                          {selectedLoans.length} loans
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {insights && (
                          <>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Average Rate
                              </p>
                              <p className="text-2xl font-bold">
                                {insights.avgRate}%
                              </p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Average Margin
                              </p>
                              <p className="text-2xl font-bold">
                                {insights.avgMargin} bps
                              </p>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                Total Amount
                              </p>
                              <p className="text-2xl font-bold">
                                {insights.totalAmount}
                              </p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm text-green-600">
                                Best Rate
                              </p>
                              <p className="text-2xl font-bold text-green-700">
                                {insights.bestRate}%
                              </p>
                              <p className="text-xs text-green-600">
                                {insights.bestRateLoan}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Main Content */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Loan Selection */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Available Loans</CardTitle>
                        <CardDescription>
                          Select loans to compare (max 4)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="relative">
                          <Input
                            placeholder="Search loans..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {filteredLoans.map((loan) => (
                            <div
                              key={loan.id}
                              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate">
                                    {loan.borrower}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {loan.facilityType} •{" "}
                                    {formatCurrency(loan.amount)}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {loan.interestRate}%
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {loan.riskRating}
                                    </Badge>
                                    {loan.sustainabilityLinked && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs text-green-600"
                                      >
                                        ESG
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addLoanToComparison(loan)}
                                  disabled={
                                    selectedLoans.find(
                                      (l) => l.id === loan.id
                                    ) !== undefined
                                  }
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Comparison Table */}
                  <div className="lg:col-span-2">
                    {selectedLoans.length === 0 ? (
                      <Card>
                        <CardContent className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                              No Loans Selected
                            </h3>
                            <p className="text-muted-foreground">
                              Select loans from the left panel to start
                              comparing
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle>Detailed Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="overview">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="overview">
                                Overview
                              </TabsTrigger>
                              <TabsTrigger value="pricing">Pricing</TabsTrigger>
                              <TabsTrigger value="covenants">
                                Covenants
                              </TabsTrigger>
                              <TabsTrigger value="esg">ESG</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left p-2 font-medium">
                                        Metric
                                      </th>
                                      {selectedLoans.map((loan) => (
                                        <th
                                          key={loan.id}
                                          className="text-left p-2 font-medium min-w-32"
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="truncate">
                                              {loan.borrower}
                                            </span>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() =>
                                                removeLoanFromComparison(
                                                  loan.id
                                                )
                                              }
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        Lender
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {loan.lender}
                                        </td>
                                      ))}
                                    </tr>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        Amount
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {formatCurrency(
                                            loan.amount,
                                            loan.currency
                                          )}
                                        </td>
                                      ))}
                                    </tr>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        Facility Type
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {loan.facilityType}
                                        </td>
                                      ))}
                                    </tr>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">Term</td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {loan.term} months
                                        </td>
                                      ))}
                                    </tr>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        Maturity
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {formatDate(loan.maturityDate)}
                                        </td>
                                      ))}
                                    </tr>
                                    <tr>
                                      <td className="p-2 font-medium">
                                        Risk Rating
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          <Badge variant="outline">
                                            {loan.riskRating}
                                          </Badge>
                                        </td>
                                      ))}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </TabsContent>

                            <TabsContent value="pricing" className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left p-2 font-medium">
                                        Pricing Component
                                      </th>
                                      {selectedLoans.map((loan) => (
                                        <th
                                          key={loan.id}
                                          className="text-left p-2 font-medium min-w-32"
                                        >
                                          {loan.borrower}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        All-in Rate
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td
                                          key={loan.id}
                                          className="p-2 font-bold text-lg"
                                        >
                                          {loan.interestRate}%
                                        </td>
                                      ))}
                                    </tr>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        Base Rate
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {loan.baseRate}
                                        </td>
                                      ))}
                                    </tr>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        Margin
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {loan.margin} bps
                                        </td>
                                      ))}
                                    </tr>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        Arrangement Fee
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {formatCurrency(
                                            loan.fees.arrangement
                                          )}
                                        </td>
                                      ))}
                                    </tr>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        Commitment Fee
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {loan.fees.commitment > 0
                                            ? formatCurrency(
                                                loan.fees.commitment
                                              )
                                            : "N/A"}
                                        </td>
                                      ))}
                                    </tr>
                                    <tr>
                                      <td className="p-2 font-medium">
                                        Total Fees
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td
                                          key={loan.id}
                                          className="p-2 font-semibold"
                                        >
                                          {formatCurrency(loan.fees.total)}
                                        </td>
                                      ))}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </TabsContent>

                            <TabsContent
                              value="covenants"
                              className="space-y-4"
                            >
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left p-2 font-medium">
                                        Covenant
                                      </th>
                                      {selectedLoans.map((loan) => (
                                        <th
                                          key={loan.id}
                                          className="text-left p-2 font-medium min-w-32"
                                        >
                                          {loan.borrower}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        Leverage Ratio
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {loan.covenants.leverage
                                            ? `≤ ${loan.covenants.leverage}x`
                                            : "N/A"}
                                        </td>
                                      ))}
                                    </tr>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        Coverage Ratio
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {loan.covenants.coverage
                                            ? `≥ ${loan.covenants.coverage}x`
                                            : "N/A"}
                                        </td>
                                      ))}
                                    </tr>
                                    <tr>
                                      <td className="p-2 font-medium">
                                        Total Covenants
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          <Badge variant="outline">
                                            {loan.covenants.count}
                                          </Badge>
                                        </td>
                                      ))}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </TabsContent>

                            <TabsContent value="esg" className="space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left p-2 font-medium">
                                        ESG Metric
                                      </th>
                                      {selectedLoans.map((loan) => (
                                        <th
                                          key={loan.id}
                                          className="text-left p-2 font-medium min-w-32"
                                        >
                                          {loan.borrower}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        Sustainability-Linked
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {loan.sustainabilityLinked ? (
                                            <Badge className="bg-green-500 text-white">
                                              <CheckCircle2 className="h-3 w-3 mr-1" />
                                              Yes
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline">No</Badge>
                                          )}
                                        </td>
                                      ))}
                                    </tr>
                                    <tr className="border-b">
                                      <td className="p-2 font-medium">
                                        ESG Score
                                      </td>
                                      {selectedLoans.map((loan) => (
                                        <td key={loan.id} className="p-2">
                                          {loan.esgScore ? (
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-2">
                                                <span className="font-semibold">
                                                  {loan.esgScore}/100
                                                </span>
                                                <Leaf className="h-4 w-4 text-green-600" />
                                              </div>
                                              <Progress
                                                value={loan.esgScore}
                                                className="h-2"
                                              />
                                            </div>
                                          ) : (
                                            "N/A"
                                          )}
                                        </td>
                                      ))}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
