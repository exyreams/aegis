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
import { toast } from "sonner";
import {
  Plus,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  FileCheck,
  Bell,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function CompliancePage() {
  const { auth } = useAuth();
  const user = auth.user;

  // Modal states
  const [addCovenantModalOpen, setAddCovenantModalOpen] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Mock data - replace with real API calls later
  const covenants: any[] = [];
  const stats = {
    totalCovenants: 0,
    compliant: 0,
    atRisk: 0,
    breached: 0,
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== "all" || typeFilter !== "all";

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
                    Compliance
                  </h1>
                  <p className="text-muted-foreground">
                    {user?.role === "borrower"
                      ? "Monitor your loan obligations and ensure compliance"
                      : user?.role === "lender"
                      ? "Track borrower compliance and covenant performance"
                      : "Oversee loan compliance monitoring across the platform"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAddCovenantModalOpen(true)}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Set Alert
                  </Button>
                  {user?.role !== "borrower" && (
                    <Button onClick={() => setAddCovenantModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Covenant
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Total Covenants</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.totalCovenants}
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <FileCheck className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Monitored obligations <FileCheck className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Across all loans
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Compliant</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600">
                        {stats.compliant}
                      </CardTitle>
                      <CardAction>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Good
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Meeting requirements <CheckCircle2 className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        No action needed
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>At Risk</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-orange-600">
                        {stats.atRisk}
                      </CardTitle>
                      <CardAction>
                        <Badge
                          variant="outline"
                          className="text-orange-600 border-orange-200"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Warning
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Approaching limits <Clock className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Requires attention
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Breached</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-red-600">
                        {stats.breached}
                      </CardTitle>
                      <CardAction>
                        <Badge
                          variant="outline"
                          className="text-red-600 border-red-200"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Critical
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Covenant violations <AlertTriangle className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Immediate action required
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
                        <CardTitle>Covenant Monitoring</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {covenants.length} covenants
                          </Badge>
                        </div>
                      </div>

                      {/* Search and Filter Controls */}
                      <div className="flex flex-col lg:flex-row gap-3 w-full">
                        <div className="flex-1 min-w-0">
                          <div className="relative w-full">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search by covenant description, loan, or borrower..."
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
                              <SelectItem value="compliant">
                                Compliant
                              </SelectItem>
                              <SelectItem value="at_risk">At Risk</SelectItem>
                              <SelectItem value="breached">Breached</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={typeFilter}
                            onValueChange={setTypeFilter}
                          >
                            <SelectTrigger className="w-full lg:w-36">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="financial">
                                Financial
                              </SelectItem>
                              <SelectItem value="operational">
                                Operational
                              </SelectItem>
                              <SelectItem value="reporting">
                                Reporting
                              </SelectItem>
                              <SelectItem value="maintenance">
                                Maintenance
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
                    {covenants.length === 0 ? (
                      <div className="text-center py-12">
                        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No Covenants Found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {user?.role === "borrower"
                            ? "Your loan covenants will appear here once they're set up."
                            : "Add loan covenants to start monitoring compliance."}
                        </p>
                        {user?.role !== "borrower" && (
                          <Button onClick={() => setAddCovenantModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Covenant
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Covenant list will go here */}
                        <p className="text-muted-foreground">
                          Covenant monitoring dashboard will be implemented here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Compliance Features */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Bell className="h-5 w-5 text-blue-500" />
                        Smart Alerts
                      </CardTitle>
                      <CardDescription>
                        Automated notifications for covenant breaches
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setAddCovenantModalOpen(true)}
                      >
                        Configure Alerts
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        Trend Analysis
                      </CardTitle>
                      <CardDescription>
                        Track compliance trends over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        View Trends
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="h-5 w-5 text-purple-500" />
                        Reporting Schedule
                      </CardTitle>
                      <CardDescription>
                        Automated compliance reporting calendar
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        View Schedule
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Add Covenant Modal */}
      {addCovenantModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Add Covenant</h2>
            <p className="text-muted-foreground mb-4">
              Covenant setup modal will be implemented here
            </p>
            <Button onClick={() => setAddCovenantModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
