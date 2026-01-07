"use client";

import Link from "next/link";
import { useMarketStore } from "@/components/secondary-market/data/store";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import {
  FileSearch,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileText,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Building2,
  MoreHorizontal,
  Download,
  RefreshCw,
  CircleDot,
  Zap,
  ListChecks,
  Sparkles,
  Activity,
  Scale,
  FileUp,
  CheckCircle2,
  FileDown,
  Info,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LoanListing } from "@/components/secondary-market/data/types";


const riskCategories = [
  { name: "Legal Risk", key: "legal", color: "bg-violet-500" },
  { name: "Credit Risk", key: "credit", color: "bg-blue-500" },
  { name: "Compliance Risk", key: "compliance", color: "bg-amber-500" },
  { name: "Documentation Risk", key: "documentation", color: "bg-rose-500" },
] as const;

interface EnhancedLoan extends LoanListing {
  verifiedItems: number;
  totalItems: number;
  lastActivity: Date;
  riskBreakdown: {
    legal: number;
    credit: number;
    compliance: number;
    documentation: number;
  };
  estimatedValue: number;
  priority: "high" | "medium" | "low";
}

export default function DueDiligenceDashboard() {
  const router = useRouter();
  const listings = useMarketStore((state) => state.listings);
  const [isNewAuditOpen, setIsNewAuditOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationFinished, setSimulationFinished] = useState(false);
  const [lastSimulationId, setLastSimulationId] = useState<string | null>(null);
  const [isPrivateAudit, setIsPrivateAudit] = useState(false);
  const [sampleLoaded, setSampleLoaded] = useState(false);
  const { privateAudits, addPrivateAudit, renamePrivateAudit, deletePrivateAudit } = useMarketStore();
  const [editingAuditId, setEditingAuditId] = useState<string | null>(null);
  const [newAuditName, setNewAuditName] = useState("");

  const simulationSteps = [
    { text: "OCR: Processing Document Text...", delay: 1200 },
    { text: "Extracting Legal Covenants...", delay: 1500 },
    { text: "Cross-referencing LMA Standards...", delay: 1300 },
    { text: "Generating Risk Sentiment Matrix...", delay: 1000 },
  ];

  // Enhanced data with mock verification progress
  // Note: For a real app, these values would come from an API
  const enhancedListings = useMemo<EnhancedLoan[]>(() => {
    // Fixed baseline for mock dates to keep render pure
    const baseDate = new Date("2026-01-01").getTime();

    const baseListings = listings.map((loan) => {
      // Simple pseudo-random seed from ID string
      const seed = loan.id
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const getPseudoRandom = (offset: number) =>
        (Math.sin(seed + offset) + 1) / 2;

      return {
        ...loan,
        verifiedItems: Math.floor(getPseudoRandom(1) * 6) + 1,
        totalItems: 6,
        lastActivity: new Date(
          baseDate - Math.floor(getPseudoRandom(2) * 7 * 24 * 60 * 60 * 1000)
        ),
        riskBreakdown: {
          legal: Math.floor(getPseudoRandom(3) * 30) + 70,
          credit: Math.floor(getPseudoRandom(4) * 30) + 70,
          compliance: Math.floor(getPseudoRandom(5) * 30) + 70,
          documentation: Math.floor(getPseudoRandom(6) * 30) + 70,
        },
        estimatedValue:
          (loan.loanAmount || 0) * (0.85 + getPseudoRandom(7) * 0.15),
        priority: (getPseudoRandom(8) > 0.7
          ? "high"
          : getPseudoRandom(8) > 0.4
          ? "medium"
          : "low") as "high" | "medium" | "low",
      };
    });

    return [...(privateAudits as EnhancedLoan[]), ...baseListings];
  }, [listings, privateAudits]);

  // Filter logic
  const filteredListings = useMemo(() => {
    let filtered = enhancedListings;

    if (activeTab === "verified") {
      filtered = filtered.filter((l) => l.dueDiligenceScore >= 80);
    } else if (activeTab === "reviewing") {
      filtered = filtered.filter(
        (l) => l.dueDiligenceScore >= 50 && l.dueDiligenceScore < 80
      );
    } else if (activeTab === "flagged") {
      filtered = filtered.filter((l) => l.dueDiligenceScore < 50);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (l) =>
          l.borrower.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.industry.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [enhancedListings, activeTab, searchQuery]);

  // Stats
  const stats = useMemo(
    () => ({
      total: listings.length,
      verified: listings.filter((l) => l.dueDiligenceScore >= 80).length,
      reviewing: listings.filter(
        (l) => l.dueDiligenceScore >= 50 && l.dueDiligenceScore < 80
      ).length,
      flagged: listings.filter((l) => l.dueDiligenceScore < 50).length,
      avgScore:
        listings.length > 0
          ? Math.round(
              listings.reduce((sum, l) => sum + l.dueDiligenceScore, 0) /
                listings.length
            )
          : 0,
      totalValue: enhancedListings.reduce(
        (sum, l) => sum + l.estimatedValue,
        0
      ),
    }),
    [listings, enhancedListings]
  );

  const handleStartAudit = async () => {
    if (!selectedLoanId && !isPrivateAudit) return;
    
    setIsStarting(true);
    setIsSimulating(true);
    setSimulationStep(0);

    // Simulate the "Vibe" console steps
    for (let i = 0; i < simulationSteps.length; i++) {
        setSimulationStep(i);
        await new Promise(resolve => setTimeout(resolve, simulationSteps[i].delay));
    }

    // Success state
    let targetId = selectedLoanId;
    if (isPrivateAudit) {
        const newId = `audit-${Date.now()}`;
        targetId = newId;
        const newAudit: EnhancedLoan = {
            id: newId,
            borrower: "Dynamic Logistics Corp",
            industry: "Transportation & Logistics",
            loanAmount: 50000000,
            dueDiligenceScore: 88,
            status: "active",
            riskLevel: "low",
            originalLender: "Sample Bank NA",
            maturityDate: "2029-12-31",
            askingPrice: 48500000,
            yieldToMaturity: 6.4,
            outstandingAmount: 49500000,
            interestRate: 5.5,
            creditRating: "B+",
            sectorRegion: "North America",
            description: "Institutional term loan for expansion of logistics network.",
            highlights: ["Secured by fleet assets", "Strong cash flow coverage"],
            listingDate: new Date().toISOString().split('T')[0],
            verifiedItems: 6,
            totalItems: 6,
            lastActivity: new Date(),
            riskBreakdown: { legal: 92, credit: 85, compliance: 90, documentation: 95 },
            estimatedValue: 49200000,
            priority: "medium"
        };
        addPrivateAudit(newAudit);
    }
    
    setLastSimulationId(targetId);
    setSimulationFinished(true);
    setIsSimulating(false);
    setIsStarting(false);
  };

  const getStatusConfig = (score: number) => {
    if (score >= 80)
      return {
        label: "Verified",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/50",
        border: "border-emerald-200 dark:border-emerald-800",
        icon: ShieldCheck,
        badge:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
      };
    if (score >= 50)
      return {
        label: "In Review",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/50",
        border: "border-amber-200 dark:border-amber-800",
        icon: Clock,
        badge:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      };
    return {
      label: "Flagged",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/50",
      border: "border-red-200 dark:border-red-800",
      icon: ShieldAlert,
      badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    };
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${(value / 1e3).toFixed(0)}K`;
  };

  const formatTimeAgo = (date: Date | string | number) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Updated recently";
    
    // Use a fixed "now" reference to keep the function pure during a single render
    const baseDate = new Date("2026-01-01").getTime();
    const hours = Math.floor((baseDate - d.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
      <SidebarInset className="bg-zinc-50/50 dark:bg-zinc-950/50">
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          {/* Institutional Section Header */}
          <div className="px-6 md:px-8 py-6">
            <div className="relative overflow-hidden rounded-4xl bg-slate-950 text-white shadow-2xl">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />

                <div className="relative z-10 p-8 lg:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    {/* Title Section */}
                    <div className="space-y-4 max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs text-blue-200">
                        <Scale className="h-3 w-3" />
                        <span>LMA Standard Framework</span>
                      </div>
                      <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                          Due Diligence Center
                        </h1>
                        <p className="text-slate-400 text-base leading-relaxed">
                          Automated compliance verification for secondary loan trades. Review legal 
                          documentation, assess credit risks, and ensure regulatory adherence 
                          before transaction settlement.
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-10 px-4 group gap-2"
                    onClick={() => useMarketStore.getState().resetMarket()}
                >
                    <RefreshCw className="h-4 w-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
                    Reset Workspace
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10">
                        <Download className="h-4 w-4" />
                        Export Reports
                      </Button>

                      <Dialog
                        open={isNewAuditOpen}
                        onOpenChange={setIsNewAuditOpen}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 gap-2"
                            onClick={() => {
                                setSimulationFinished(false);
                                setIsSimulating(false);
                                setIsStarting(false);
                                setSelectedLoanId("");
                                setSampleLoaded(false);
                                setIsPrivateAudit(false);
                            }}
                          >
                            <Sparkles className="h-4 w-4" />
                            New Audit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                      {simulationFinished ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
                          <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/20">
                              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                            </div>
                            <div className="absolute -top-1 -right-1">
                                <span className="flex h-6 w-6 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative flex rounded-full h-6 w-6 bg-emerald-500 border-2 border-white dark:border-zinc-950 items-center justify-center">
                                        <Sparkles className="h-3 w-3 text-white" />
                                    </span>
                                </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-foreground">Analysis Complete</h3>
                            <p className="text-sm text-muted-foreground max-w-[280px]">
                                AI Due Diligence Score generated with <span className="font-bold text-foreground">98% confidence</span>. 
                                Audit persists in your local workspace.
                            </p>
                          </div>

                          <div className="flex flex-col gap-3 w-full max-w-[240px]">
                            <Button 
                                className="w-full gap-2 bg-blue-600 hover:bg-blue-500 text-white h-11"
                                onClick={() => {
                                    setIsNewAuditOpen(false);
                                    setSimulationFinished(false);
                                    router.push(`/dashboard/secondary-market/due-diligence/${lastSimulationId}`);
                                }}
                            >
                                <FileSearch className="h-4 w-4" />
                                Open Analysis
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="w-full"
                                onClick={() => {
                                    setIsNewAuditOpen(false);
                                    setSimulationFinished(false);
                                }}
                            >
                                Back to Dashboard
                            </Button>
                          </div>
                        </div>
                      ) : isSimulating ? (
                        <div className="py-12 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-300">
                          <div className="relative">
                            <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                            </div>
                          </div>
                          
                          <div className="space-y-3 w-full max-w-sm">
                            <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                <span>AI Analysis Engine</span>
                                <span>{Math.round(((simulationStep + 1) / simulationSteps.length) * 100)}%</span>
                            </div>
                            <Progress value={((simulationStep + 1) / simulationSteps.length) * 100} className="h-1.5" />
                            <div className="h-6 flex items-center justify-center">
                                <p className="text-sm font-medium text-foreground bg-primary/5 px-3 py-1 rounded-full border border-primary/10 transition-all duration-300">
                                    {simulationSteps[simulationStep].text}
                                </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 w-full">
                            {simulationSteps.map((step, idx) => (
                                <div 
                                    key={idx} 
                                    className={cn(
                                        "flex items-center gap-2 text-[11px] font-medium p-2 rounded-lg border transition-all duration-500",
                                        idx < simulationStep 
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                                            : idx === simulationStep
                                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 animate-pulse"
                                            : "bg-muted/50 text-muted-foreground border-transparent opacity-50"
                                    )}
                                >
                                    {idx < simulationStep ? (
                                        <CheckCircle2 className="h-3 w-3" />
                                    ) : (
                                        <CircleDot className={cn("h-3 w-3", idx === simulationStep && "animate-spin")} />
                                    )}
                                    {step.text.split(":")[0]}
                                </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2.5 rounded-xl bg-primary/10">
                                <FileSearch className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <DialogTitle>Initiate Due Diligence</DialogTitle>
                                <DialogDescription className="mt-0.5">
                                  Begin automated verification process
                                </DialogDescription>
                              </div>
                            </div>
                          </DialogHeader>

                          <Tabs defaultValue="market" className="w-full mt-4" onValueChange={(v) => setIsPrivateAudit(v === "private")}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="market">Market Asset</TabsTrigger>
                                <TabsTrigger value="private">Private Side Audit</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="market" className="py-4 space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Select Marketplace Loan</Label>
                                    <Select onValueChange={setSelectedLoanId} value={selectedLoanId}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Choose a loan..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {listings.map((loan) => (
                                                <SelectItem key={loan.id} value={loan.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-3.5 w-3.5" />
                                                        <span>{loan.borrower}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                        <ListChecks className="h-4 w-4 text-primary" />
                                        Automated LMA Checks
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        We will cross-reference the registered documents on the Marketplace 
                                        with the LMA Standard Framework.
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="private" className="py-4 space-y-5">
                                <div className="space-y-4">
                                    <div className={cn(
                                        "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors",
                                        sampleLoaded ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/20" : "bg-muted/30 hover:border-primary/50"
                                    )}>
                                        {sampleLoaded ? (
                                            <>
                                                <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                                                    <FileCheck className="h-6 w-6" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-semibold text-emerald-900 dark:text-emerald-100 italic">&quot;LMA_Credit_Agreement_v3.pdf&quot;</p>
                                                    <p className="text-xs text-emerald-600">Sample Document Loaded (2.4 MB)</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-3 bg-primary/10 rounded-full text-primary">
                                                    <FileUp className="h-6 w-6" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium">Drop confidential docs here</p>
                                                    <p className="text-xs text-muted-foreground">PDF, Word, or Scanned Images up to 20MB</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex justify-center">
                                        <Button 
                                            variant="secondary" 
                                            size="sm" 
                                            className="h-9 gap-2 text-xs font-semibold"
                                            onClick={() => setSampleLoaded(true)}
                                            disabled={sampleLoaded}
                                        >
                                            <FileDown className="h-3.5 w-3.5" />
                                            {sampleLoaded ? "Sample Loaded" : "Load Sample LMA Doc"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Borrower Name (Optional)</Label>
                                        <Input placeholder="e.g. Acme Corp" className="h-9 text-xs" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Asset Class</Label>
                                        <Select defaultValue="leveraged">
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="leveraged">Leveraged Loan</SelectItem>
                                                <SelectItem value="investment">Investment Grade</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>
                          </Tabs>

                          <DialogFooter className="gap-2 mt-6">
                            <Button
                              variant="ghost"
                              onClick={() => setIsNewAuditOpen(false)}
                              disabled={isStarting}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleStartAudit}
                              disabled={(isPrivateAudit ? !sampleLoaded : !selectedLoanId) || isStarting}
                              className="min-w-[140px] gap-2 bg-blue-600 hover:bg-blue-500 text-white"
                            >
                              Start Analysis
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Main Content */}
          <div className="max-w-[1600px] mx-auto w-full px-6 md:px-8 py-8 space-y-8">
            {/* Stats Grid - Muted Enterprise Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Pipeline Value */}
              <Card className="relative overflow-hidden border-none shadow-md bg-linear-to-br from-slate-50 to-zinc-100 dark:from-slate-900 dark:to-zinc-950 ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-zinc-400 dark:hover:ring-zinc-600 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="w-12 h-12 text-zinc-900 dark:text-white" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight">
                    {formatCurrency(stats.totalValue)}
                  </div>
                  <div className="flex items-center mt-2 text-[10px] text-zinc-500 uppercase font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                    Active Pipeline
                  </div>
                </CardContent>
              </Card>

              {/* Average Score */}
              <Card className="relative overflow-hidden border-none shadow-md bg-linear-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 ring-1 ring-blue-500/20 dark:ring-blue-500/10 hover:ring-blue-500/40 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Activity className="w-12 h-12 text-blue-600" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg. Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-1">
                    <p className="text-2xl font-bold tracking-tight">{stats.avgScore}</p>
                    <span className="text-muted-foreground text-xs mb-1 font-medium">/100</span>
                  </div>
                  <Progress value={stats.avgScore} className="h-1 mt-3 bg-blue-100 dark:bg-blue-900/30" />
                </CardContent>
              </Card>

              {/* Verified */}
              <Card className="relative overflow-hidden border-none shadow-md bg-linear-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/20 dark:to-teal-950/20 ring-1 ring-emerald-500/20 dark:ring-emerald-500/10 hover:ring-emerald-500/40 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <ShieldCheck className="w-12 h-12 text-emerald-500" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verified</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                    {stats.verified}
                  </p>
                   <div className="flex items-center mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                    Settlement Ready
                  </div>
                </CardContent>
              </Card>

              {/* In Review */}
              <Card className="relative overflow-hidden border-none shadow-md bg-linear-to-br from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/20 ring-1 ring-amber-500/20 dark:ring-amber-500/10 hover:ring-amber-500/40 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Clock className="w-12 h-12 text-amber-500" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                    {stats.reviewing}
                  </p>
                  <div className="flex items-center mt-2 text-[10px] text-amber-600 dark:text-amber-400 uppercase font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />
                    Pending Analysis
                  </div>
                </CardContent>
              </Card>

              {/* Flagged */}
              <Card className="relative overflow-hidden border-none shadow-md bg-linear-to-br from-rose-50 to-red-100 dark:from-rose-950/20 dark:to-red-950/20 ring-1 ring-rose-500/20 dark:ring-rose-500/10 hover:ring-rose-500/40 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <AlertTriangle className="w-12 h-12 text-rose-500" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Flagged</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
                    {stats.flagged}
                  </p>
                  <div className="flex items-center mt-2 text-[10px] text-red-600 dark:text-red-400 uppercase font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2" />
                    Requires Action
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Table Section */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/30 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Tabs */}
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full lg:w-auto"
                  >
                    <TabsList className="bg-background border h-10">
                      <TabsTrigger value="all" className="gap-2 px-4">
                        All
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          {stats.total}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="verified" className="gap-2 px-4">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        Verified
                      </TabsTrigger>
                      <TabsTrigger value="reviewing" className="gap-2 px-4">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        Reviewing
                      </TabsTrigger>
                      <TabsTrigger value="flagged" className="gap-2 px-4">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        Flagged
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Search & Filter */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by borrower or industry..."
                        className="pl-9 w-[280px] h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-4">Asset / Borrower</div>
                  <div className="col-span-2">Verification Progress</div>
                  <div className="col-span-2 text-center">Risk Score</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y">
                  {filteredListings.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <FileSearch className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">
                        No audits found
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  ) : (
                    filteredListings.map((loan) => {
                      const status = getStatusConfig(loan.dueDiligenceScore);
                      const StatusIcon = status.icon;
                      const verificationPercent =
                        (loan.verifiedItems / loan.totalItems) * 100;

                      return (
                        <Link
                          href={`/dashboard/secondary-market/due-diligence/${loan.id}`}
                          key={loan.id}
                          className="block"
                        >
                          <div className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-muted/30 transition-colors group">
                            {/* Asset Info */}
                            <div className="col-span-4">
                              <div className="flex items-center gap-4">
                                <div
                                  className={cn(
                                    "p-2.5 rounded-xl shrink-0 transition-colors",
                                    status.bg,
                                    status.border,
                                    "border"
                                  )}
                                >
                                  <StatusIcon
                                    className={cn("h-5 w-5", status.color)}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                                      {loan.borrower}
                                    </h4>
                                    {loan.priority === "high" && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            High Priority
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] font-medium"
                                    >
                                      {loan.industry}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatCurrency(loan.estimatedValue)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Verification Progress */}
                            <div className="col-span-2">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {loan.verifiedItems}/{loan.totalItems} items
                                  </span>
                                  <span className="font-medium">
                                    {Math.round(verificationPercent)}%
                                  </span>
                                </div>
                                <Progress
                                  value={verificationPercent}
                                  className={cn(
                                    "h-1.5",
                                    verificationPercent === 100 &&
                                      "[&>div]:bg-emerald-500"
                                  )}
                                />
                              </div>
                            </div>

                            {/* Risk Score */}
                            <div className="col-span-2">
                              <div className="flex flex-col items-center">
                                <div
                                  className={cn(
                                    "text-2xl font-bold font-mono",
                                    loan.dueDiligenceScore >= 80
                                      ? "text-emerald-600"
                                      : loan.dueDiligenceScore >= 50
                                      ? "text-amber-600"
                                      : "text-red-600"
                                  )}
                                >
                                  {loan.dueDiligenceScore}
                                </div>
                                <div className="flex gap-0.5 mt-1">
                                  {riskCategories.map((cat) => (
                                    <TooltipProvider key={cat.key}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            className={cn(
                                              "w-6 h-1.5 rounded-full opacity-80",
                                              cat.color,
                                              loan.riskBreakdown[
                                                cat.key as keyof typeof loan.riskBreakdown
                                              ] < 70 && "opacity-40"
                                            )}
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {cat.name}:{" "}
                                          {
                                            loan.riskBreakdown[
                                              cat.key as keyof typeof loan.riskBreakdown
                                            ]
                                          }
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-2">
                              <div className="space-y-1.5">
                                <Badge
                                  className={cn("font-medium", status.badge)}
                                >
                                  {status.label}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  Updated {formatTimeAgo(loan.lastActivity)}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-2 flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    router.push(`/dashboard/secondary-market/due-diligence/${loan.id}`);
                                }}
                              >
                                View Report
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2" onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditingAuditId(loan.id);
                                        setNewAuditName(loan.borrower);
                                    }}>
                                    <Pencil className="h-4 w-4" />
                                    Rename Audit
                                  </DropdownMenuItem>
                                  {loan.id.startsWith('audit-') && (
                                    <DropdownMenuItem 
                                        className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            deletePrivateAudit(loan.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Audit
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem className="gap-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                    <Download className="h-4 w-4" />
                                    Download Report
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                    <RefreshCw className="h-4 w-4" />
                                    Re-run Analysis
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="gap-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                    <ExternalLink className="h-4 w-4" />
                                    View Listing
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bottom Section - Risk Categories Summary */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Risk Categories Breakdown */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    Verification Categories
                  </CardTitle>
                  <CardDescription>
                    Automated checks performed across all audit categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      {
                        name: "Legal Documentation",
                        items: [
                          "Credit Agreement",
                          "Security Docs",
                          "Intercreditor",
                        ],
                        score: 87,
                        icon: Scale,
                        color: "violet",
                      },
                      {
                        name: "Financial Analysis",
                        items: ["Audited Statements", "Projections", "Ratios"],
                        score: 92,
                        icon: TrendingUp,
                        color: "blue",
                      },
                      {
                        name: "Regulatory Compliance",
                        items: ["KYC/AML", "Sanctions", "Licenses"],
                        score: 78,
                        icon: ShieldCheck,
                        color: "emerald",
                      },
                      {
                        name: "Documentation Quality",
                        items: ["Completeness", "Accuracy", "Currency"],
                        score: 84,
                        icon: FileText,
                        color: "amber",
                      },
                    ].map((category) => (
                      <div
                        key={category.name}
                        className={cn(
                          "p-4 rounded-xl border",
                          `bg-${category.color}-50/50 border-${category.color}-200/50`,
                          `dark:bg-${category.color}-950/20 dark:border-${category.color}-800/50`
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <category.icon
                              className={cn(
                                "h-4 w-4",
                                `text-${category.color}-600`
                              )}
                            />
                            <span className="font-medium text-sm">
                              {category.name}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "text-lg font-bold",
                              category.score >= 80
                                ? "text-emerald-600"
                                : "text-amber-600"
                            )}
                          >
                            {category.score}%
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {category.items.map((item) => (
                            <Badge
                              key={item}
                              variant="secondary"
                              className="text-[10px] bg-white/70 dark:bg-black/30"
                            >
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips / Info Panel */}
              <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Compliance Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      {
                        title: "LMA Standard Requirements",
                        description:
                          "All trades must meet LMA documentation standards before settlement.",
                      },
                      {
                        title: "Review Timeline",
                        description:
                          "Standard due diligence reviews complete within 2-3 business days.",
                      },
                      {
                        title: "Flagged Items",
                        description:
                          "Red flags require manual review and additional documentation.",
                      },
                    ].map((tip, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-background/80 border"
                      >
                        <p className="font-medium text-sm">{tip.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tip.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <ExternalLink className="h-4 w-4" />
                    View LMA Guidelines
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Rename Dialog */}
          <Dialog open={!!editingAuditId} onOpenChange={(open) => !open && setEditingAuditId(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Audit</DialogTitle>
                    <DialogDescription>
                        Update the display name for this compliance audit.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="auditName">Borrower / Asset Name</Label>
                    <Input 
                        id="auditName" 
                        value={newAuditName} 
                        onChange={(e) => setNewAuditName(e.target.value)} 
                        className="mt-2"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingAuditId(null)}>Cancel</Button>
                    <Button onClick={() => {
                        if (editingAuditId && newAuditName) {
                            renamePrivateAudit(editingAuditId, newAuditName);
                            setEditingAuditId(null);
                        }
                    }}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
