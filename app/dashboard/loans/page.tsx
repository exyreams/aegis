"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";

import {
  UploadDocumentModal,
  LoanCard,
  CreateLoanModal,
  type LoanData,
} from "@/components/digital-loans";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Upload,
  Search,
  X,
  Clock,
  DollarSign,
  Building2,
  FileSearch,
  TrendingUp,
  BarChart3,
  Database,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function DigitalLoansPage() {
  const { auth } = useAuth();

  // Modal states
  const [createLoanModalOpen, setCreateLoanModalOpen] = useState(false);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Loan data state
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load mock loan data
  useEffect(() => {
    const loadMockData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate mock loans - realistic LMA-style syndicated loans
      const mockLoans: LoanData[] = [
        {
          id: "LOAN-001",
          borrower: "Meridian Holdings PLC",
          lender: "Barclays Bank PLC (Agent)",
          amount: 75000000,
          currency: "GBP",
          interestRate: 8.25, // SONIA + 325bps
          term: 60,
          maturityDate: "2028-06-15",
          facilityType: "Senior Secured Term Loan",
          status: "active",
          purpose:
            "Refinancing of existing facilities and general corporate purposes",
          riskRating: "BB+",
          covenants: [
            {
              type: "financial",
              description: "Net Leverage Ratio ≤ 3.50x",
              status: "compliant",
            },
            {
              type: "financial",
              description: "Interest Cover Ratio ≥ 4.00x",
              status: "warning",
            },
            {
              type: "operational",
              description: "Material Adverse Change clause",
              status: "compliant",
            },
          ],
          documents: [
            {
              id: "DOC-001",
              name: "Facility Agreement (LMA Standard)",
              type: "Legal Document",
              uploadedAt: "2023-06-15",
              processed: true,
            },
            {
              id: "DOC-002",
              name: "Security Agreement - Debenture",
              type: "Legal Document",
              uploadedAt: "2023-06-15",
              processed: true,
            },
            {
              id: "DOC-003",
              name: "Q4 2024 Compliance Certificate",
              type: "Compliance Document",
              uploadedAt: "2025-01-15",
              processed: true,
            },
          ],
          createdAt: "2023-06-15",
          updatedAt: "2025-01-15",
          esgScore: 72,
          sustainabilityLinked: false,
        },
        {
          id: "LOAN-002",
          borrower: "Nordic Energy AS",
          lender: "DNB Bank ASA (Agent)",
          amount: 120000000,
          currency: "EUR",
          interestRate: 7.5, // EURIBOR + 275bps
          term: 84,
          maturityDate: "2031-03-01",
          facilityType: "Green Term Loan",
          status: "active",
          purpose:
            "Financing of renewable energy projects including wind and solar installations",
          riskRating: "BBB-",
          covenants: [
            {
              type: "financial",
              description: "Senior Secured Leverage ≤ 2.50x",
              status: "compliant",
            },
            {
              type: "financial",
              description: "Debt Service Coverage Ratio ≥ 1.20x",
              status: "compliant",
            },
            {
              type: "operational",
              description:
                "Green Loan KPI - Carbon Intensity Reduction ≥ 5% YoY",
              status: "compliant",
            },
          ],
          documents: [
            {
              id: "DOC-004",
              name: "Green Loan Framework",
              type: "ESG Document",
              uploadedAt: "2024-03-01",
              processed: true,
            },
            {
              id: "DOC-005",
              name: "Facility Agreement",
              type: "Legal Document",
              uploadedAt: "2024-03-01",
              processed: true,
            },
            {
              id: "DOC-006",
              name: "Sustainability Performance Report 2024",
              type: "ESG Document",
              uploadedAt: "2025-01-02",
              processed: true,
            },
          ],
          createdAt: "2024-03-01",
          updatedAt: "2025-01-02",
          esgScore: 91,
          sustainabilityLinked: true,
        },
        {
          id: "LOAN-003",
          borrower: "Atlas Logistics Inc",
          lender: "Wells Fargo Bank NA (Agent)",
          amount: 200000000,
          currency: "USD",
          interestRate: 9.75, // SOFR + 425bps
          term: 60,
          maturityDate: "2027-09-01",
          facilityType: "Asset-Based Lending Facility",
          status: "active",
          purpose:
            "Working capital and fleet expansion financing secured against receivables and inventory",
          riskRating: "B+",
          covenants: [
            {
              type: "financial",
              description: "Minimum Liquidity ≥ $25M",
              status: "warning",
            },
            {
              type: "financial",
              description: "Fixed Charge Coverage Ratio ≥ 1.10x",
              status: "compliant",
            },
            {
              type: "operational",
              description: "Borrowing Base Certificate - Weekly",
              status: "warning",
            },
          ],
          documents: [
            {
              id: "DOC-007",
              name: "ABL Credit Agreement",
              type: "Legal Document",
              uploadedAt: "2022-09-01",
              processed: true,
            },
            {
              id: "DOC-008",
              name: "Borrowing Base Certificate - Jan W1",
              type: "Compliance Document",
              uploadedAt: "2025-01-06",
              processed: false,
            },
          ],
          createdAt: "2022-09-01",
          updatedAt: "2025-01-06",
          esgScore: 58,
          sustainabilityLinked: false,
        },
        {
          id: "LOAN-004",
          borrower: "Pinnacle Healthcare Group",
          lender: "JPMorgan Chase Bank NA (Agent)",
          amount: 150000000,
          currency: "USD",
          interestRate: 7.85, // SOFR + 335bps
          term: 72,
          maturityDate: "2029-12-15",
          facilityType: "Term Loan B",
          status: "active",
          purpose:
            "Acquisition of regional healthcare facilities and equipment financing",
          riskRating: "BB",
          covenants: [
            {
              type: "financial",
              description: "Total Leverage Ratio ≤ 4.00x",
              status: "compliant",
            },
            {
              type: "financial",
              description: "First Lien Leverage Ratio ≤ 3.00x",
              status: "compliant",
            },
          ],
          documents: [
            {
              id: "DOC-009",
              name: "Credit Agreement",
              type: "Legal Document",
              uploadedAt: "2023-12-15",
              processed: true,
            },
            {
              id: "DOC-010",
              name: "Intercreditor Agreement",
              type: "Legal Document",
              uploadedAt: "2023-12-15",
              processed: true,
            },
          ],
          createdAt: "2023-12-15",
          updatedAt: "2024-12-31",
          esgScore: 76,
          sustainabilityLinked: false,
        },
        {
          id: "LOAN-005",
          borrower: "Continental Manufacturing GmbH",
          lender: "Deutsche Bank AG (Agent)",
          amount: 85000000,
          currency: "EUR",
          interestRate: 8.5, // EURIBOR + 375bps
          term: 48,
          maturityDate: "2026-08-30",
          facilityType: "Revolving Credit Facility",
          status: "active",
          purpose: "Working capital and general corporate purposes",
          riskRating: "BB-",
          covenants: [
            {
              type: "financial",
              description: "Net Leverage Ratio ≤ 3.75x",
              status: "compliant",
            },
            {
              type: "financial",
              description: "Interest Cover Ratio ≥ 3.50x",
              status: "compliant",
            },
          ],
          documents: [
            {
              id: "DOC-011",
              name: "Facility Agreement (German Law)",
              type: "Legal Document",
              uploadedAt: "2022-08-30",
              processed: true,
            },
          ],
          createdAt: "2022-08-30",
          updatedAt: "2024-11-30",
          esgScore: 65,
          sustainabilityLinked: false,
        },
      ];

      setLoans(mockLoans);
      setIsLoading(false);
    };

    loadMockData();
  }, []);

  // Calculate stats
  const stats = {
    total: loans.length,
    active: loans.filter((loan) => loan.status === "active").length,
    totalValue: loans.reduce((sum, loan) => sum + loan.amount, 0),
    documentsProcessed: loans.reduce(
      (sum, loan) => sum + loan.documents.filter((doc) => doc.processed).length,
      0
    ),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    sortBy !== "newest";

  // Filter and sort loans
  const filteredLoans = loans
    .filter((loan) => {
      const matchesSearch =
        !searchQuery ||
        loan.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.facilityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.purpose.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || loan.status === statusFilter;
      const matchesType =
        typeFilter === "all" ||
        loan.facilityType.toLowerCase().includes(typeFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "amount-high":
          return b.amount - a.amount;
        case "amount-low":
          return a.amount - b.amount;
        default: // newest
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  const handleViewLoan = (loan: LoanData) => {
    // Navigation handled by Link in LoanCard
  };

  const handleCreateLoan = (loanData: {
    borrowerName: string;
    facilityType: string;
    purpose: string;
    amount: number;
    currency: string;
    interestRate: number;
    term: number;
    maturityDate: string;
    jurisdiction: string;
    sustainabilityLinked: boolean;
    lenderName?: string;
    riskRating?: string;
    covenantType?: string;
    specialConditions?: string;
  }) => {
    // In a real app, this would make an API call
    const newLoan: LoanData = {
      id: `LOAN-${Date.now()}`,
      borrower: loanData.borrowerName,
      lender: loanData.lenderName || "TBD",
      amount: loanData.amount,
      currency: loanData.currency,
      interestRate: loanData.interestRate,
      term: loanData.term,
      maturityDate: loanData.maturityDate,
      facilityType: loanData.facilityType,
      status: "draft",
      purpose: loanData.purpose,
      riskRating: (loanData.riskRating as LoanData["riskRating"]) || "BBB",
      covenants: [],
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      esgScore: loanData.sustainabilityLinked ? 70 : undefined,
      sustainabilityLinked: loanData.sustainabilityLinked,
    };

    setLoans((prev) => [newLoan, ...prev]);
    toast.success("Loan request created successfully!");
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
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Digital Loans
                  </h1>
                  <p className="text-muted-foreground">
                    Standardized loan data platform for interoperability and
                    comparison
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setUploadDocModalOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                  <Button onClick={() => setCreateLoanModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Loan Request
                  </Button>
                </div>
              </div>

              {/* Quick Navigation Buttons */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    Quick Access:
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/dashboard/loans/analytics">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                    </Link>
                    <Link href="/dashboard/loans/compare">
                      <Button variant="outline" size="sm">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Compare
                      </Button>
                    </Link>
                    <Link href="/dashboard/loans/standards">
                      <Button variant="outline" size="sm">
                        <Database className="h-4 w-4 mr-2" />
                        Standards
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadDocModalOpen(true)}
                    >
                      <FileSearch className="h-4 w-4 mr-2" />
                      AI Extract
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Total Loans</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.total}
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          All time
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Standardized loans <Database className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Digital loan records
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Active Loans</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.active}
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Live
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Currently active <TrendingUp className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Loans in progress
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Total Value</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatCurrency(stats.totalValue)}
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <DollarSign className="h-3 w-3 mr-1" />
                          USD
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Portfolio value <BarChart3 className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Combined loan volume
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Documents Processed</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.documentsProcessed}
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <FileSearch className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Digitized documents <Zap className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        AI extraction complete
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              {/* Main Content */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <CardTitle>Loan Portfolio</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {filteredLoans.length} loans
                          </Badge>
                          {isLoading && (
                            <Badge variant="outline" className="animate-pulse">
                              Loading...
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Search and Filter Controls */}
                      <div className="flex flex-col lg:flex-row gap-3 w-full">
                        <div className="flex-1 min-w-0">
                          <div className="relative w-full">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search by borrower, amount, or document type..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 w-full"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                          <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                          >
                            <SelectTrigger className="w-full lg:w-32">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="under_review">
                                Under Review
                              </SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={typeFilter}
                            onValueChange={setTypeFilter}
                          >
                            <SelectTrigger className="w-full lg:w-32">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="term">Term Loan</SelectItem>
                              <SelectItem value="revolving">
                                Revolving Credit
                              </SelectItem>
                              <SelectItem value="project">
                                Project Finance
                              </SelectItem>
                              <SelectItem value="bridge">
                                Bridge Loan
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full lg:w-36">
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="newest">
                                Newest First
                              </SelectItem>
                              <SelectItem value="oldest">
                                Oldest First
                              </SelectItem>
                              <SelectItem value="amount-high">
                                Amount: High to Low
                              </SelectItem>
                              <SelectItem value="amount-low">
                                Amount: Low to High
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          {hasActiveFilters && (
                            <Button
                              variant="outline"
                              onClick={clearFilters}
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Clear
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                          <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                              <div className="space-y-3">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                                <div className="h-8 bg-muted rounded w-full"></div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : filteredLoans.length === 0 ? (
                      <div className="text-center py-12">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {hasActiveFilters
                            ? "No Matching Loans"
                            : "No Loans Found"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {hasActiveFilters
                            ? "Try adjusting your search criteria or filters."
                            : "Create your first loan request to get started with digital lending."}
                        </p>
                        {!hasActiveFilters && (
                          <Button onClick={() => setCreateLoanModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Loan Request
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredLoans.map((loan) => (
                          <LoanCard
                            key={loan.id}
                            loan={loan}
                            onView={handleViewLoan}
                            onEdit={() =>
                              toast.info("Edit functionality coming soon")
                            }
                            onDownload={() =>
                              toast.info("Download functionality coming soon")
                            }
                            onShare={() =>
                              toast.info("Share functionality coming soon")
                            }
                            onArchive={() =>
                              toast.info("Archive functionality coming soon")
                            }
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Modals */}
      <UploadDocumentModal
        open={uploadDocModalOpen}
        onOpenChange={setUploadDocModalOpen}
        onSuccess={(extractedData) => {
          console.log("Extracted data:", extractedData);
          toast.success("Document processed and data standardized!");
          setUploadDocModalOpen(false);
        }}
      />

      <CreateLoanModal
        open={createLoanModalOpen}
        onOpenChange={setCreateLoanModalOpen}
        onSuccess={handleCreateLoan}
      />
    </SidebarProvider>
  );
}
