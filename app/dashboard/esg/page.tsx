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
import { ESGDashboard, type ESGMetric } from "@/components/esg/ESGDashboard";
import { AddMetricModal } from "@/components/esg/AddMetricModal";
import { VerificationWorkflow } from "@/components/esg/VerificationWorkflow";
import { DataSharingHub } from "@/components/esg/DataSharingHub";
import { LenderDecisionDashboard } from "@/components/esg/LenderDecisionDashboard";
import { ESGCovenantTracker } from "@/components/esg/ESGCovenantTracker";
import esgData from "@/data/esg.json";
import {
  Leaf,
  Users,
  Shield,
  TrendingUp,
  Clock,
  Plus,
  Search,
  X,
  Target,
  BarChart3,
  FileBarChart,
  Globe,
  Zap,
  Sparkles,
} from "lucide-react";

export default function ESGReportingPage() {
  const { auth } = useAuth();
  const user = auth.user;

  // Modal states
  const [addMetricModalOpen, setAddMetricModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "verification" | "sharing" | "lending" | "covenants"
  >("dashboard");

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ESG metrics data from JSON
  const [metrics, setMetrics] = useState<ESGMetric[]>(esgData.metrics as ESGMetric[]);

  const stats = {
    totalMetrics: metrics.length,
    environmental: metrics.filter((m) => m.category === "environmental").length,
    social: metrics.filter((m) => m.category === "social").length,
    governance: metrics.filter((m) => m.category === "governance").length,
  };

  const handleAddMetric = (newMetric: ESGMetric) => {
    setMetrics((prev) => [...prev, newMetric]);
  };

  // handleMetricAdded used in AddMetricModal

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
              {/* HERO SECTION */}
              <div className="px-4 lg:px-6">
                <div className="relative overflow-hidden rounded-4xl bg-slate-950 text-white shadow-2xl border border-white/5">
                  {/* Abstract Background Elements */}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

                  <div className="relative z-10 p-4 md:p-6 lg:p-8">
                    <div className="grid lg:grid-cols-12 gap-6 items-center">
                      {/* Hero Content */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest text-emerald-300">
                          <Shield className="h-2.5 w-2.5" />
                          <span>LMA Framework v3.1</span>
                        </div>

                        <div className="space-y-2">
                          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                            Greener Lending <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-teal-100 to-blue-400">Hub</span>
                          </h1>
                          <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
                            {user?.role === "borrower"
                                ? "Scale your sustainability data, automate regulatory verification, and access preferred capital rates."
                                : "Advanced ESG decision support. Analyze 'Greensium' spreads and monitor transition risk."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-1">
                          <Button
                            size="sm"
                            onClick={() => setAddMetricModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 h-9 px-5 rounded-xl font-bold transition-all"
                          >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Add Metric
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/5 border-white/10 backdrop-blur-xl h-9 px-5 rounded-xl font-bold text-white hover:bg-white/10 transition-all"
                            onClick={() => (window.location.href = "/dashboard/esg/reports")}
                          >
                            <FileBarChart className="h-4 w-4 mr-1.5" />
                            Reports
                          </Button>
                        </div>
                      </div>

                      {/* Hero Visual / Sustainability Pulse */}
                      <div className="lg:col-span-5 relative">
                        <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-2xl overflow-hidden group">
                          <div className="absolute top-0 right-0 p-3 opacity-5">
                            <Sparkles className="h-16 w-16 text-emerald-400" />
                          </div>
                          
                          <div className="absolute top-2.5 right-2.5 bg-emerald-500/90 text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm shadow-lg z-20 backdrop-blur-md border border-emerald-400/50">
                            LIVE
                          </div>

                          <div className="flex items-center justify-between mb-4 relative z-10">
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-tight">
                                Sustainability Pulse
                                </h3>
                            </div>
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </div>
                          </div>

                          <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                  Portfolio Score
                                </p>
                                <p className="text-2xl font-black text-white">
                                  92.4
                                </p>
                              </div>
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[8px] font-bold px-2 py-0">
                                PLATINUM
                              </Badge>
                            </div>

                            {/* High-Density Full-Width Bar Chart */}
                            <div className="h-12 flex items-end gap-[1.5px] px-1 ring-1 ring-white/5 rounded-lg bg-black/30 p-1.5 overflow-hidden">
                              {Array.from({ length: 80 }).map((_, i) => {
                                // Deterministic pattern to avoid lint error and ensure stability
                                const h = 40 + Math.sin(i / 5) * 20 + (i % 3 === 0 ? 15 : 0) + (i % 7 === 0 ? 25 : 0);
                                return (
                                  <div
                                    key={i}
                                    className="flex-1 min-w-[2px] bg-linear-to-t from-emerald-600/20 via-emerald-500 to-teal-400 rounded-t-[0.5px] opacity-70 hover:opacity-100 transition-all"
                                    style={{ height: `${(h / 140) * 100}%` }}
                                  />
                                );
                              })}
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                              <div className="flex items-center gap-2">
                                <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                <div>
                                    <p className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider">Reduction</p>
                                    <p className="text-xs font-bold text-white">-18.5%</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                <div>
                                    <p className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider">GAR Align</p>
                                    <p className="text-xs font-bold text-white">84.2%</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Smaller Floating Badge - Fixed bold text */}
                        <div className="absolute -bottom-3 -left-3 bg-white dark:bg-slate-900 text-slate-950 dark:text-white rounded-xl py-1.5 px-3 shadow-xl flex items-center gap-2 border border-border/50">
                          <Clock className="h-3 w-3 text-emerald-500" />
                          <p className="text-[9px] font-semibold uppercase tracking-tight">Verified 14m ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
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
                          variant="secondary"
                          className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 font-bold"
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
                          variant="secondary"
                          className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-0 font-bold"
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
                          variant="secondary"
                          className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-0 font-bold"
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
                        <CardTitle>ESG Management</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {metrics.length} metrics
                          </Badge>
                        </div>
                      </div>

                      {/* Tab Navigation */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={
                            activeTab === "dashboard" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveTab("dashboard")}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                        <Button
                          variant={
                            activeTab === "verification" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveTab("verification")}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Verification
                        </Button>
                        <Button
                          variant={
                            activeTab === "sharing" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveTab("sharing")}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Data Sharing
                        </Button>
                        {user?.role === "lender" && (
                          <>
                            <Button
                              variant={
                                activeTab === "lending" ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setActiveTab("lending")}
                            >
                              <Target className="h-4 w-4 mr-2" />
                              Lending Decisions
                            </Button>
                            <Button
                              variant={
                                activeTab === "covenants"
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setActiveTab("covenants")}
                            >
                              <FileBarChart className="h-4 w-4 mr-2" />
                              Covenants
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Search and Filter Controls - Only show for dashboard tab */}
                      {activeTab === "dashboard" && (
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
                                <SelectItem value="on_track">
                                  On Track
                                </SelectItem>
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
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activeTab === "dashboard" && (
                      <ESGDashboard
                        metrics={metrics}
                        onUpdateMetric={(updated) => {
                          setMetrics(prev => prev.map(m => m.id === updated.id ? updated : m));
                        }}
                        onDeleteMetric={(id) => {
                          setMetrics(prev => prev.filter(m => m.id !== id));
                        }}
                      />
                    )}
                    {activeTab === "verification" && <VerificationWorkflow />}
                    {activeTab === "sharing" && <DataSharingHub />}
                    {activeTab === "lending" && user?.role === "lender" && (
                      <LenderDecisionDashboard />
                    )}
                    {activeTab === "covenants" && user?.role === "lender" && (
                      <ESGCovenantTracker />
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Add Metric Modal */}
      <AddMetricModal
        open={addMetricModalOpen}
        onOpenChange={setAddMetricModalOpen}
        onMetricAdded={handleAddMetric}
      />
    </SidebarProvider>
  );
}
