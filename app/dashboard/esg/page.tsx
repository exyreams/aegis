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
  Leaf,
  Users,
  Shield,
  TrendingUp,
  Target,
  BarChart3,
  FileBarChart,
  Award,
  Globe,
} from "lucide-react";

export default function ESGReportingPage() {
  const { auth } = useAuth();
  const user = auth.user;

  // Modal states
  const [addMetricModalOpen, setAddMetricModalOpen] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock data - replace with real API calls later
  const metrics: any[] = [];
  const stats = {
    totalMetrics: 0,
    environmental: 0,
    social: 0,
    governance: 0,
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    searchQuery || categoryFilter !== "all" || statusFilter !== "all";

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
                    ESG Reporting
                  </h1>
                  <p className="text-muted-foreground">
                    {user?.role === "borrower"
                      ? "Track and report your sustainability performance"
                      : user?.role === "lender"
                      ? "Factor ESG metrics into lending decisions"
                      : "Oversee ESG reporting and sustainable lending platform-wide"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAddMetricModalOpen(true)}
                  >
                    <FileBarChart className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button onClick={() => setAddMetricModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Metric
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Total Metrics</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {stats.totalMetrics}
                      </CardTitle>
                      <CardAction>
                        <Badge variant="outline">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Tracked
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        ESG indicators <BarChart3 className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Across all categories
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Environmental</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600">
                        {stats.environmental}
                      </CardTitle>
                      <CardAction>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200"
                        >
                          <Leaf className="h-3 w-3 mr-1" />
                          Green
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Climate & environment <Leaf className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Carbon, energy, waste
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Social</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-blue-600">
                        {stats.social}
                      </CardTitle>
                      <CardAction>
                        <Badge
                          variant="outline"
                          className="text-blue-600 border-blue-200"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          People
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Social impact <Users className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Diversity, community, labor
                      </div>
                    </CardFooter>
                  </Card>

                  <Card className="@container/card">
                    <CardHeader>
                      <CardDescription>Governance</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-purple-600">
                        {stats.governance}
                      </CardTitle>
                      <CardAction>
                        <Badge
                          variant="outline"
                          className="text-purple-600 border-purple-200"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Ethics
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Corporate governance <Shield className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                        Ethics, transparency, risk
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
                        <CardTitle>ESG Dashboard</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {metrics.length} metrics
                          </Badge>
                        </div>
                      </div>

                      {/* Search and Filter Controls */}
                      <div className="flex flex-col lg:flex-row gap-3 w-full">
                        <div className="flex-1 min-w-0">
                          <div className="relative w-full">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search by metric name, target, or description..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 w-full"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                          <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                          >
                            <SelectTrigger className="w-full lg:w-40">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                All Categories
                              </SelectItem>
                              <SelectItem value="environmental">
                                Environmental
                              </SelectItem>
                              <SelectItem value="social">Social</SelectItem>
                              <SelectItem value="governance">
                                Governance
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                          >
                            <SelectTrigger className="w-full lg:w-32">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="on_track">On Track</SelectItem>
                              <SelectItem value="at_risk">At Risk</SelectItem>
                              <SelectItem value="behind">
                                Behind Target
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
                    {metrics.length === 0 ? (
                      <div className="text-center py-12">
                        <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No ESG Metrics Found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Start tracking your sustainability performance by
                          adding ESG metrics.
                        </p>
                        <Button onClick={() => setAddMetricModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Metric
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* ESG metrics dashboard will go here */}
                        <p className="text-muted-foreground">
                          ESG metrics dashboard will be implemented here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* ESG Features */}
              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="h-5 w-5 text-green-500" />
                        Goal Tracking
                      </CardTitle>
                      <CardDescription>
                        Set and monitor sustainability targets
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setAddMetricModalOpen(true)}
                      >
                        Set Goals
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileBarChart className="h-5 w-5 text-blue-500" />
                        Impact Reports
                      </CardTitle>
                      <CardDescription>
                        Generate comprehensive ESG reports
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        Create Report
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Award className="h-5 w-5 text-purple-500" />
                        Certifications
                      </CardTitle>
                      <CardDescription>
                        Track ESG certifications and ratings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        View Ratings
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        Benchmarking
                      </CardTitle>
                      <CardDescription>
                        Compare performance against industry standards
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        View Benchmarks
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Add Metric Modal */}
      {addMetricModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Add ESG Metric</h2>
            <p className="text-muted-foreground mb-4">
              ESG metric setup modal will be implemented here
            </p>
            <Button onClick={() => setAddMetricModalOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
