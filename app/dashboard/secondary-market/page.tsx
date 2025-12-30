"use client";

import { useState, useMemo } from "react";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Search,
  X,
  Building2,
  Users,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Calendar,
  FileText,
  Eye,
  Handshake,
} from "lucide-react";
import type { LoanListing, LoanOffer } from "@/types/api";

export default function SecondaryMarketPage() {
  const { auth } = useAuth();
  const user = auth.user;

  // Mock data - replace with actual API calls
  const [listings] = useState<LoanListing[]>([
    {
      listingId: "LST-001",
      seller: "AEGIS-INST-T1-ABC123",
      loanId: "LOAN-2024-001",
      askingPrice: "950000",
      status: "active",
      loanDetails: {
        originalAmount: "1000000",
        outstandingAmount: "850000",
        interestRate: "5.25",
        maturityDate: "2026-12-31",
        borrower: "TechCorp Industries",
      },
      listedAt: "2024-12-28T10:00:00Z",
      updatedAt: "2024-12-28T10:00:00Z",
    },
    {
      listingId: "LST-002",
      seller: "AEGIS-REGNL-DEF456",
      loanId: "LOAN-2024-002",
      askingPrice: "2400000",
      status: "active",
      loanDetails: {
        originalAmount: "2500000",
        outstandingAmount: "2200000",
        interestRate: "4.75",
        maturityDate: "2027-06-30",
        borrower: "GreenEnergy Solutions",
      },
      listedAt: "2024-12-27T14:30:00Z",
      updatedAt: "2024-12-27T14:30:00Z",
    },
  ]);

  const [offers] = useState<LoanOffer[]>([
    {
      offerId: "OFF-001",
      buyer: "AEGIS-INVST-FUND-GHI789",
      listingId: "LST-001",
      offerPrice: "920000",
      terms: "Standard terms with 30-day settlement",
      status: "pending",
      validUntil: "2025-01-15T23:59:59Z",
      createdAt: "2024-12-29T09:15:00Z",
      updatedAt: "2024-12-29T09:15:00Z",
    },
  ]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Current date for calculations
  const currentDate = useMemo(() => new Date(), []);

  // Stats calculations
  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter((l) => l.status === "active").length,
    totalVolume: listings.reduce(
      (sum, l) => sum + parseFloat(l.askingPrice),
      0
    ),
    avgYield: listings.length
      ? (
          listings.reduce((sum, l) => {
            const yield_ =
              (parseFloat(l.loanDetails.interestRate) *
                parseFloat(l.loanDetails.outstandingAmount)) /
              parseFloat(l.askingPrice);
            return sum + yield_;
          }, 0) / listings.length
        ).toFixed(2)
      : "0.00",
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateYield = (listing: LoanListing) => {
    const interestRate = parseFloat(listing.loanDetails.interestRate);
    const askingPrice = parseFloat(listing.askingPrice);
    const outstandingAmount = parseFloat(listing.loanDetails.outstandingAmount);

    if (askingPrice === 0) return "0.00";

    const effectiveYield = (interestRate * outstandingAmount) / askingPrice;
    return effectiveYield.toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "accepted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "expired":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      case "sold":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== "all" || sortBy !== "newest";

  return (
    <ProtectedRoute>
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
                      Secondary Market
                    </h1>
                    <p className="text-muted-foreground">
                      {user?.role === "borrower"
                        ? "Monitor your loan positions in the secondary market"
                        : user?.role === "lender"
                        ? "Trade loan positions and discover investment opportunities"
                        : "Oversee all secondary market trading activities"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => alert("Make offer modal coming soon!")}
                    >
                      <Handshake className="h-4 w-4 mr-2" />
                      Make Offer
                    </Button>
                    <Button
                      onClick={() => alert("Create listing modal coming soon!")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      List Position
                    </Button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="px-4 lg:px-6">
                  <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                    <Card className="@container/card">
                      <CardHeader>
                        <CardDescription>Active Listings</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          {stats.activeListings}
                        </CardTitle>
                        <CardAction>
                          <Badge variant="outline">
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Available
                          </Badge>
                        </CardAction>
                      </CardHeader>
                      <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                          Ready to trade <ArrowUpRight className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                          Out of {stats.totalListings} total
                        </div>
                      </CardFooter>
                    </Card>

                    <Card className="@container/card">
                      <CardHeader>
                        <CardDescription>Total Volume</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          {formatCurrency(stats.totalVolume)}
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
                          Market value <TrendingUp className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                          Available for trading
                        </div>
                      </CardFooter>
                    </Card>

                    <Card className="@container/card">
                      <CardHeader>
                        <CardDescription>Average Yield</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          {stats.avgYield}%
                        </CardTitle>
                        <CardAction>
                          <Badge variant="outline">
                            <Percent className="h-3 w-3 mr-1" />
                            Effective
                          </Badge>
                        </CardAction>
                      </CardHeader>
                      <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                          Expected return <Target className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                          Weighted average
                        </div>
                      </CardFooter>
                    </Card>

                    <Card className="@container/card">
                      <CardHeader>
                        <CardDescription>Active Offers</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          {offers.filter((o) => o.status === "pending").length}
                        </CardTitle>
                        <CardAction>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </CardAction>
                      </CardHeader>
                      <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                          Under review <ArrowDownRight className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                          Awaiting response
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                </div>

                {/* Main Content */}
                <div className="px-4 lg:px-6">
                  <Tabs defaultValue="listings" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="listings">Loan Listings</TabsTrigger>
                      <TabsTrigger value="offers">My Offers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="listings" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <div className="flex flex-col space-y-4">
                            <div className="flex items-center justify-between">
                              <CardTitle>Available Positions</CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {stats.activeListings} active listings
                                </Badge>
                              </div>
                            </div>

                            {/* Search and Filter Controls */}
                            <div className="flex flex-col lg:flex-row gap-3 w-full">
                              <div className="flex-1 min-w-0">
                                <div className="relative w-full">
                                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search by loan ID, borrower, or seller..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                      setSearchQuery(e.target.value)
                                    }
                                    className="pl-10 w-full"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                                <Select
                                  value={statusFilter}
                                  onValueChange={setStatusFilter}
                                >
                                  <SelectTrigger className="w-full lg:w-40">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All Status
                                    </SelectItem>
                                    <SelectItem value="active">
                                      Active
                                    </SelectItem>
                                    <SelectItem value="pending">
                                      Pending
                                    </SelectItem>
                                    <SelectItem value="sold">Sold</SelectItem>
                                    <SelectItem value="expired">
                                      Expired
                                    </SelectItem>
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={sortBy}
                                  onValueChange={setSortBy}
                                >
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
                                    <SelectItem value="price-high">
                                      Price: High to Low
                                    </SelectItem>
                                    <SelectItem value="price-low">
                                      Price: Low to High
                                    </SelectItem>
                                    <SelectItem value="yield-high">
                                      Yield: High to Low
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
                          <div className="space-y-4">
                            {listings.map((listing) => (
                              <Card
                                key={listing.listingId}
                                className="hover:border-primary/50 transition-colors"
                              >
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-primary/10 rounded-lg">
                                        <Building2 className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <CardTitle className="text-lg">
                                          {listing.loanDetails.borrower}
                                        </CardTitle>
                                        <CardDescription>
                                          Loan ID: {listing.loanId} • Listed by{" "}
                                          {listing.seller}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <Badge
                                      className={getStatusColor(listing.status)}
                                    >
                                      {listing.status}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Asking Price
                                      </p>
                                      <p className="text-2xl font-bold text-primary">
                                        {formatCurrency(listing.askingPrice)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Outstanding
                                      </p>
                                      <p className="text-lg font-semibold">
                                        {formatCurrency(
                                          listing.loanDetails.outstandingAmount
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Interest Rate
                                      </p>
                                      <p className="text-lg font-semibold">
                                        {listing.loanDetails.interestRate}%
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Effective Yield
                                      </p>
                                      <p className="text-lg font-bold text-green-600">
                                        {calculateYield(listing)}%
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                    <div>
                                      <p className="font-medium text-muted-foreground">
                                        Original Amount
                                      </p>
                                      <p>
                                        {formatCurrency(
                                          listing.loanDetails.originalAmount
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-muted-foreground">
                                        Maturity Date
                                      </p>
                                      <p>
                                        {formatDate(
                                          listing.loanDetails.maturityDate
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-muted-foreground">
                                        Listed Date
                                      </p>
                                      <p>{formatDate(listing.listedAt)}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-muted-foreground">
                                        Listing ID
                                      </p>
                                      <p className="font-mono text-xs">
                                        {listing.listingId}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button size="sm">
                                      <Handshake className="h-4 w-4 mr-2" />
                                      Make Offer
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <FileText className="h-4 w-4 mr-2" />
                                      Due Diligence
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}

                            {listings.length === 0 && (
                              <div className="text-center py-12">
                                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                  No listings found
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                  There are currently no loan positions
                                  available for trading.
                                </p>
                                <Button
                                  onClick={() =>
                                    alert("Create listing modal coming soon!")
                                  }
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create First Listing
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="offers" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>My Offers</CardTitle>
                          <CardDescription>
                            Track your offers and their status
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {offers.map((offer) => (
                              <Card
                                key={offer.offerId}
                                className="hover:border-primary/50 transition-colors"
                              >
                                <CardHeader>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div>
                                        <CardTitle className="text-lg">
                                          Offer {offer.offerId}
                                        </CardTitle>
                                        <CardDescription>
                                          For listing {offer.listingId} • Valid
                                          until {formatDate(offer.validUntil)}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <Badge
                                      className={getStatusColor(offer.status)}
                                    >
                                      {offer.status}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Offer Price
                                      </p>
                                      <p className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(offer.offerPrice)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Status
                                      </p>
                                      <p className="text-lg font-semibold capitalize">
                                        {offer.status}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Valid Until
                                      </p>
                                      <p className="text-lg">
                                        {formatDate(offer.validUntil)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Days Remaining
                                      </p>
                                      <p className="text-lg font-semibold">
                                        {Math.max(
                                          0,
                                          Math.ceil(
                                            (new Date(
                                              offer.validUntil
                                            ).getTime() -
                                              currentDate.getTime()) /
                                              (1000 * 60 * 60 * 24)
                                          )
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  {offer.terms && (
                                    <div className="mb-4">
                                      <p className="text-sm font-medium text-muted-foreground mb-2">
                                        Terms & Conditions
                                      </p>
                                      <p className="text-sm bg-muted/50 p-3 rounded-lg">
                                        {offer.terms}
                                      </p>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Listing
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={offer.status !== "pending"}
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Withdraw
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}

                            {offers.length === 0 && (
                              <div className="text-center py-12">
                                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                  No offers yet
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                  You haven&apos;t made any offers on loan
                                  positions.
                                </p>
                                <Button
                                  onClick={() =>
                                    alert("Make offer modal coming soon!")
                                  }
                                >
                                  <Handshake className="h-4 w-4 mr-2" />
                                  Make Your First Offer
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Market Insights */}
                <div className="px-4 lg:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="hover:border-primary transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          Market Analytics
                        </CardTitle>
                        <CardDescription>
                          View market trends and pricing insights
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="w-full">
                          View Analytics
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:border-primary transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Users className="h-5 w-5 text-blue-500" />
                          Due Diligence
                        </CardTitle>
                        <CardDescription>
                          Automated compliance and risk assessment
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="w-full">
                          Start Review
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:border-primary transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Calendar className="h-5 w-5 text-purple-500" />
                          Settlement
                        </CardTitle>
                        <CardDescription>
                          Streamlined trade settlement and documentation
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="w-full">
                          Manage Trades
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
