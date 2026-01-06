"use client";

import Link from "next/link";
import { useMarketStore } from "@/components/secondary-market/data/store";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  FileSearch,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DueDiligenceDashboard() {
  const router = useRouter();
  const listings = useMarketStore((state) => state.listings);
  const [isNewAuditOpen, setIsNewAuditOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const handleStartAudit = () => {
    if (!selectedLoanId) return;
    setIsStarting(true);
    // Simulate initial setup delay
    setTimeout(() => {
        router.push(`/dashboard/secondary-market/due-diligence/${selectedLoanId}`);
    }, 1500);
  };

  // Group listings by status to simulate "Active Audits" vs "Completed"
  // For demo: High score = Completed/Pass, Medium = In Progress/Review, Low = Failed
  const completedAudits = listings.filter(l => l.dueDiligenceScore >= 80);
  const activeAudits = listings.filter(l => l.dueDiligenceScore >= 50 && l.dueDiligenceScore < 80);
  const flaggedAudits = listings.filter(l => l.dueDiligenceScore < 50);

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-zinc-50/50 dark:bg-zinc-950/50">
        <SiteHeader />
        <div className="flex flex-1 flex-col max-w-[1600px] mx-auto w-full p-6 md:p-8 space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <FileSearch className="h-8 w-8 text-primary" />
                Due Diligence Center
              </h1>
              <p className="text-muted-foreground">
                Manage automated audits, review legal risks, and monitor compliance across the marketplace.
              </p>
            </div>
            <div className="flex items-center gap-2">
                <Dialog open={isNewAuditOpen} onOpenChange={setIsNewAuditOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                            <FileSearch className="h-4 w-4" /> New Audit
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Start New Due Diligence</DialogTitle>
                            <DialogDescription>
                                Select a loan or asset to begin an automated comprehensive risk analysis.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Select Asset</Label>
                                <Select onValueChange={setSelectedLoanId} value={selectedLoanId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a loan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {listings.map((loan) => (
                                            <SelectItem key={loan.id} value={loan.id}>
                                                {loan.borrower} ({loan.industry})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Audit Framework</Label>
                                <Select defaultValue="comprehensive" disabled>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="comprehensive">Comprehensive (LMA Standard)</SelectItem>
                                        <SelectItem value="financial">Financial Only</SelectItem>
                                        <SelectItem value="legal">Legal Red Flags</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground">Only "Comprehensive" is available in this demo version.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsNewAuditOpen(false)} disabled={isStarting}>Cancel</Button>
                            <Button onClick={handleStartAudit} disabled={!selectedLoanId || isStarting} className="min-w-[100px]">
                                {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Analysis"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="h-8 w-px bg-border mx-1 hidden md:block"></div>

                <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search reports..." className="pl-9 w-[250px]" />
                </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Reports</p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{listings.length}</p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Passing Score</p>
                        <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                            {((completedAudits.length / listings.length) * 100).toFixed(0)}%
                        </p>
                    </div>
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                        <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-amber-50/50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Review Needed</p>
                        <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{activeAudits.length + flaggedAudits.length}</p>
                    </div>
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                        <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* Active / Recent Reports List */}
          <div className="space-y-6">
              <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Recent Audit Reports</h3>
              </div>

              <div className="grid gap-4">
                  {/* Reuse mapping logic for list items */}
                  {listings.map((loan) => (
                      <Link href={`/dashboard/secondary-market/due-diligence/${loan.id}`} key={loan.id}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                            <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                                
                                {/* Loan Info */}
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`p-3 rounded-full shrink-0 ${
                                        loan.dueDiligenceScore >= 80 ? 'bg-emerald-100 text-emerald-600' :
                                        loan.dueDiligenceScore >= 50 ? 'bg-amber-100 text-amber-600' :
                                        'bg-red-100 text-red-600'
                                    }`}>
                                        {loan.dueDiligenceScore >= 80 ? <ShieldCheck className="h-6 w-6" /> :
                                         loan.dueDiligenceScore >= 50 ? <Clock className="h-6 w-6" /> :
                                         <ShieldAlert className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                                            {loan.borrower}
                                            <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                        </h4>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="font-medium bg-secondary px-2 py-0.5 rounded text-secondary-foreground">{loan.industry}</span>
                                            <span>•</span>
                                            <span>Requested: {new Date(loan.listingDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Score */}
                                <div className="flex items-center gap-8 md:min-w-[400px] justify-between border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-8 mt-2 md:mt-0 w-full md:w-auto">
                                    <div className="flex flex-col">
                                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Status</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            {loan.dueDiligenceScore >= 80 ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Verified</span>
                                                </>
                                            ) : loan.dueDiligenceScore >= 50 ? (
                                                <>
                                                    <Clock className="h-4 w-4 text-amber-500" />
                                                    <span className="font-medium text-amber-700 dark:text-amber-400">Reviewing</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                    <span className="font-medium text-red-700 dark:text-red-400">Flagged</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col text-right">
                                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Risk Score</span>
                                        <span className={`text-2xl font-bold font-mono ${
                                            loan.dueDiligenceScore >= 80 ? 'text-emerald-600' :
                                            loan.dueDiligenceScore >= 50 ? 'text-amber-600' :
                                            'text-red-600'
                                        }`}>
                                            {loan.dueDiligenceScore}/100
                                        </span>
                                    </div>
                                    
                                    <div className="hidden md:block">
                                        <Button size="sm" variant="ghost">View Report</Button>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                      </Link>
                  ))}
              </div>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
