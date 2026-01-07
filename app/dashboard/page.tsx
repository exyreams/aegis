"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  FileText,
  Wallet,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Scale,
} from "lucide-react";
import { useMarketStore } from "@/components/secondary-market/data/store";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { auth } = useAuth();
  const user = auth.user;
  const { portfolio, privateAudits, listings, cashBalance } = useMarketStore();

  const totalAudits = (listings?.length || 0) + (privateAudits?.length || 0);
  const activePositions = portfolio?.length || 0;
  
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${(value / 1e3).toFixed(0)}K`;
  };

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
        <SidebarInset className="bg-zinc-50/50 dark:bg-zinc-950/50">
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            {/* Sophisticated Institutional Header */}
            <div className="relative overflow-hidden bg-slate-950 text-white border-b border-white/5">
                {/* Background Decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[150%] bg-blue-600/10 blur-[120px] rounded-full rotate-12" />
                    <div className="absolute bottom-[-20%] left-[-5%] w-[30%] h-full bg-emerald-500/5 blur-[100px] rounded-full -rotate-12" />
                </div>
                
                <div className="relative p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">System Live</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Command Center
                        </h1>
                        <p className="text-slate-400 text-sm max-w-md">
                            Welcome, {user?.name}. Your institutional loan portfolio and compliance workspace is synchronized.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/secondary-market/due-diligence">
                            <Button className="bg-white text-slate-950 hover:bg-slate-200 border-0 h-11 px-6 shadow-xl shadow-white/10 font-semibold gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Run New Audit
                            </Button>
                        </Link>
                        <Link href="/dashboard/secondary-market">
                            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-11 px-6 backdrop-blur-sm gap-2">
                                <Activity className="h-4 w-4" />
                                Market View
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8 max-w-[1600px] mx-auto w-full">
              {/* Refined Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cash Balance */}
                <Card className="relative overflow-hidden border-none shadow-lg bg-linear-to-br from-indigo-900 to-slate-900 text-white ring-1 ring-white/10">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Wallet className="w-16 h-16 text-white" />
                  </div>
                  <CardHeader className="pb-2">
                    <CardDescription className="text-slate-400 font-medium">Available Capital</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-mono">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cashBalance)}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="flex items-center text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <TrendingUp className="h-3 w-3 mr-1" /> Ready
                        </span>
                        <span className="text-slate-500 text-[10px] font-medium tracking-wide">Live Settlement Balance</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Positions */}
                <Card className="relative overflow-hidden border shadow-sm dark:bg-zinc-900/50 backdrop-blur-sm">
                  <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10">
                    <Activity className="w-16 h-16 text-blue-500" />
                  </div>
                  <CardHeader className="pb-2">
                    <CardDescription className="font-medium">Market Exposure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold flex items-baseline gap-2">
                        {activePositions}
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Positions</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-[10px] font-medium">
                        <span className="text-blue-500">{(listings?.length || 0)} monitored assets</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Audit Score */}
                <Card className="relative overflow-hidden border shadow-sm dark:bg-zinc-900/50 backdrop-blur-sm">
                  <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10">
                    <ShieldCheck className="w-16 h-16 text-emerald-500" />
                  </div>
                  <CardHeader className="pb-2">
                    <CardDescription className="font-medium">Compliance Pipeline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold flex items-baseline gap-2 text-emerald-600 dark:text-emerald-400">
                        {totalAudits}
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Reports</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-[10px] font-medium">
                        <span className="text-muted-foreground">Comprehensive coverage for 100% of holdings</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Center Layout */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Items / Pipeline */}
                <Card className="lg:col-span-2 border shadow-sm dark:bg-zinc-900/50">
                    <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                        <div className="space-y-0.5">
                            <CardTitle className="text-lg">Audit Workspace</CardTitle>
                            <CardDescription className="text-xs">Your latest compliance and due diligence reports</CardDescription>
                        </div>
                        <Link href="/dashboard/secondary-market/due-diligence">
                            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                View Full Workspace <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {[...(privateAudits || []).slice(0, 4), ...(listings || []).slice(0, 2)].slice(0, 5).map((audit) => (
                            <Link 
                                href={`/dashboard/secondary-market/due-diligence/${audit.id}`} 
                                key={audit.id}
                                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors border-b last:border-0 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-10 w-10 rounded-lg border flex items-center justify-center transition-colors shadow-sm",
                                        audit.dueDiligenceScore >= 85 ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20" : "bg-blue-50 border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/20"
                                    )}>
                                        <ShieldCheck className={cn(
                                            "h-5 w-5",
                                            audit.dueDiligenceScore >= 85 ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"
                                        )} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold group-hover:text-primary transition-colors">{audit.borrower}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{audit.industry}</span>
                                            <span className="text-[10px] text-zinc-400">•</span>
                                            <span className="text-[10px] text-muted-foreground font-mono">{formatCurrency(audit.loanAmount || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className={cn(
                                            "text-lg font-bold font-mono",
                                            audit.dueDiligenceScore >= 85 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                                        )}>
                                            {audit.dueDiligenceScore}
                                        </div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-60">AI Score</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                                </div>
                            </Link>
                        ))}
                        {(!privateAudits || privateAudits.length === 0) && (
                             <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Scale className="h-10 w-10 text-zinc-200 mb-2" />
                                <p className="text-sm font-medium text-muted-foreground">No custom audits found</p>
                                <p className="text-xs text-zinc-400 max-w-[200px] mt-1">Upload an LMA document to start your first private audit.</p>
                             </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Column Extras */}
                <div className="space-y-6">
                    {/* Platform Stats Widget */}
                    <Card className="border-none shadow-xl bg-linear-to-br from-slate-900 to-indigo-950 text-white overflow-hidden ring-1 ring-white/10">
                         <div className="absolute top-0 right-0 p-4 opacity-5">
                            <TrendingDown className="h-20 w-20" />
                         </div>
                         <CardHeader>
                             <CardTitle className="text-base text-white/90">Market Sentiment</CardTitle>
                             <CardDescription className="text-blue-200/50">AI Collective Intelligence</CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-blue-300">
                                    <span>Primary Yield</span>
                                    <span>6.82% (+0.12%)</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[65%] bg-blue-500" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                                    <span>Sector Liquidity</span>
                                    <span>High (98th Pctl)</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[98%] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                             </div>
                             <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="text-xs text-slate-400">Next settlement cycle ends in 14h 22m</div>
                                <Activity className="h-4 w-4 text-emerald-400" />
                             </div>
                         </CardContent>
                    </Card>

                    {/* Quick Access Card */}
                    <Card className="border shadow-sm dark:bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">VDR Gateway</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-between h-10 group bg-zinc-50 dark:bg-zinc-800/50 hover:border-primary transition-all">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs font-semibold">Legal VDR Root</span>
                                </div>
                                <ArrowUpRight className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                            </Button>
                            <Button variant="outline" className="w-full justify-between h-10 group bg-zinc-50 dark:bg-zinc-800/50 hover:border-primary transition-all">
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs font-semibold">Treasury Settlement</span>
                                </div>
                                <ArrowUpRight className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
