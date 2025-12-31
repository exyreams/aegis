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
import { UploadDocumentModal } from "@/components/digital-loans";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Upload,
  Search,
  X,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
  Building2,
  FileSearch,
  ClipboardCheck,
  Leaf,
} from "lucide-react";

export default function DigitalLoansPage() {
  const { auth } = useAuth();
  const user = auth.user;

  // Modal states
  const [createLoanModalOpen, setCreateLoanModalOpen] = useState(false);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Mock data - replace with real API calls later
  const loans: any[] = [];
  const stats = {
    total: 0,
    active: 0,
    totalValue: 0,
    documentsProcessed: 0,
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
                    {user?.role === "borrower"
                      ? "Create loan requests and manage your documents"
                      : user?.role === "lender"
                      ? "Browse loan opportunities and analyze documents"
                      : "Monitor all platform loan activities"}
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
                  {user?.role === "borrower" && (
                    <Button onClick={() => setCreateLoanModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Loan Request
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
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
                        All loan requests <FileText className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Total loans created
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
                        Currently active <Clock className="size-4" />
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
                        Across all loans <DollarSign className="size-4" />
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
                        Digitized documents <FileSearch className="size-4" />
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
                        <CardTitle>All Loans</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{loans.length} loans</Badge>
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
                              <SelectItem value="term_loan">
                                Term Loan
                              </SelectItem>
                              <SelectItem value="credit_line">
                                Credit Line
                              </SelectItem>
                              <SelectItem value="mortgage">Mortgage</SelectItem>
                              <SelectItem value="bridge_loan">
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
                    {loans.length === 0 ? (
                      <div className="text-center py-12">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No Loans Found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {user?.role === "borrower"
                            ? "Create your first loan request to get started with digital lending."
                            : "No loan opportunities available at the moment."}
                        </p>
                        {user?.role === "borrower" && (
                          <Button onClick={() => setCreateLoanModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Loan Request
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Loan list will go here */}
                        <p className="text-muted-foreground">
                          Loan list component will be implemented here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Feature Categories */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileSearch className="h-5 w-5 text-blue-500" />
                        Document AI
                      </CardTitle>
                      <CardDescription>
                        Extract structured data from loan documents
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setUploadDocModalOpen(true)}
                      >
                        Upload & Extract
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-5 w-5 text-purple-500" />
                        Document Creation
                      </CardTitle>
                      <CardDescription>
                        Speed up document creation and negotiation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          (window.location.href = "/dashboard/documents")
                        }
                      >
                        Create Document
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ClipboardCheck className="h-5 w-5 text-orange-500" />
                        Compliance
                      </CardTitle>
                      <CardDescription>
                        Track covenants and obligations automatically
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          (window.location.href = "/dashboard/compliance")
                        }
                      >
                        View Compliance
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Leaf className="h-5 w-5 text-emerald-500" />
                        ESG Tracking
                      </CardTitle>
                      <CardDescription>
                        Monitor sustainability and governance metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          (window.location.href = "/dashboard/esg")
                        }
                      >
                        ESG Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                </div>
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
          toast.success("Document processed successfully!");
          setUploadDocModalOpen(false);
        }}
      />

      {createLoanModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Create Loan Request</h2>
            <p className="text-muted-foreground mb-4">
              Modal content will be implemented here
            </p>
            <Button onClick={() => setCreateLoanModalOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
