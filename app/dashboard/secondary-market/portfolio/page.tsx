"use client";

import { useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/Dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  Info,
  ExternalLink,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  BrainCircuit,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import {
  tradeHistory,     // Keep for history
  formatCurrency,
  formatPercent,
} from "@/components/secondary-market/data/portfolio";
import { useMarketStore } from "@/components/secondary-market/data/store";
import { Order, PortfolioPosition } from "@/components/secondary-market/data/types";

export default function PortfolioPage() {
  // Store State
  const portfolioPositions = useMarketStore((state) => state.portfolio);
  const activeOrders = useMarketStore((state) => state.orders);
  // const tradeHistory = useMarketStore((state) => state.tradeHistory); // If we add history later

  const [activeTab, setActiveTab] = useState<"positions" | "orders" | "history">("positions");
  const [selectedPosition, setSelectedPosition] = useState<PortfolioPosition | null>(null);
  const [sellAmount, setSellAmount] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // --- Logic from TradingDashboard ---
  const totalPortfolioValue = portfolioPositions.reduce((sum, pos) => sum + pos.currentValue, 0);
  const totalUnrealizedPnL = portfolioPositions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  const totalUnrealizedPnLPercent =
    totalPortfolioValue > 0
      ? (totalUnrealizedPnL / (totalPortfolioValue - totalUnrealizedPnL)) * 100
      : 0;

  const handleCreateSellOrder = () => {
    if (!selectedPosition) return;
    if (selectedPosition.tradeRiskSignal !== "SAFE") {
      setIsConfirmOpen(true);
    } else {
      finalizeSellOrder();
    }
  };

  const finalizeSellOrder = () => {
    toast.success("Sell order created successfully!", {
      description: `Order for ${selectedPosition?.borrower} placed on the marketplace.`,
    });
    setSellAmount("");
    setSellPrice("");
    setIsConfirmOpen(false);
  };

  const getRiskBadge = (position: PortfolioPosition | Order) => {
    // Helper for badge style
    let badge = null;
     // Handle both PortfolioPosition (tradeRiskSignal) and Order (derived or undefined)
    const signal = 'tradeRiskSignal' in position ? position.tradeRiskSignal : null;

    switch (signal) {
      case "SAFE":
        badge = (
          <Badge variant="outline" className="cursor-pointer hover:bg-emerald-100 transition-colors bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 gap-1 rounded-md px-2 py-0.5">
            <ShieldCheck className="w-3 h-3" /> Safe
          </Badge>
        );
        break;
      case "REVIEW_REQUIRED":
        badge = (
          <Badge variant="outline" className="cursor-pointer hover:bg-amber-100 transition-colors bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 gap-1 rounded-md px-2 py-0.5">
            <Info className="w-3 h-3" /> Review
          </Badge>
        );
        break;
      case "HIGH_RISK":
        badge = (
          <Badge variant="outline" className="cursor-pointer hover:bg-red-100 transition-colors bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 gap-1 rounded-md px-2 py-0.5 animate-pulse">
            <ShieldAlert className="w-3 h-3" /> High Risk
          </Badge>
        );
        break;
      default:
        return null;
    }

    // For Orders, just return the badge without popover (as we lack detailed data)
    if (!('aiAnalysis' in position)) {
         return badge;
    }

    const pos = position as PortfolioPosition;

    // Wrap in Popover for intelligence (Positions only)
    return (
        <Popover>
            <PopoverTrigger asChild>
                {badge}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden" align="start">
                <div className={`p-4 border-b ${
                    signal === 'SAFE' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' :
                    signal === 'REVIEW_REQUIRED' ? 'bg-amber-50/50 dark:bg-amber-900/10' :
                    'bg-red-50/50 dark:bg-red-900/10'
                }`}>
                    <div className="flex items-center gap-2 mb-1">
                        <BrainCircuit className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-sm">AI Trade Intelligence</h4>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Updated {pos.lastUpdated || 'just now'}</span>
                        <span className="font-mono font-medium">Score: {pos.dueDiligenceScore}/100</span>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    <p className="text-sm leading-relaxed">
                        {pos.aiAnalysis || "No analysis available for this position."}
                    </p>
                    {pos.riskFactors && pos.riskFactors.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Risk Factors</p>
                            <ul className="space-y-1">
                                {pos.riskFactors.map((factor: string, i: number) => (
                                    <li key={i} className="text-xs flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                                        <AlertTriangle className="h-3 w-3" />
                                        {factor}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <Button variant="secondary" size="sm" className="w-full text-xs h-8" asChild>
                         <Link href={`/dashboard/secondary-market/due-diligence/${pos.id}`}>
                            View Full Diligence Report
                         </Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
  };

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
        <div className="flex flex-1 flex-col max-w-[1600px] mx-auto w-full p-4 md:p-8 space-y-8">
          
          {/* Header & Net Worth */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-muted-foreground mb-1">
                   <Briefcase className="w-5 h-5" />
                   <span className="font-medium text-sm tracking-wide uppercase">Portfolio Management</span>
               </div>
               <h1 className="text-4xl font-bold tracking-tight text-foreground">
                   My Portfolio
               </h1>
            </div>
            
            {/* Total Value Display */}
            <div className="flex items-center gap-6 bg-background rounded-2xl p-4 shadow-sm border">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Value</p>
                    <p className="text-3xl font-bold font-mono tracking-tight">{formatCurrency(totalPortfolioValue)}</p>
                </div>
                <div className="h-10 w-px bg-border"></div>
                <div className="space-y-1">
                     <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Unrealized P&L</p>
                     <div className={`flex items-center gap-1.5 font-bold text-xl ${totalUnrealizedPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {totalUnrealizedPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        {formatCurrency(totalUnrealizedPnL)}
                        <span className="text-sm font-normal opacity-80">({formatPercent(totalUnrealizedPnLPercent)})</span>
                     </div>
                </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-linear-to-br from-blue-500/5 to-transparent border-blue-100 dark:border-blue-900/50">
                  <CardContent className="p-6 flex items-center justify-between">
                      <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Active Positions</p>
                          <p className="text-2xl font-bold">{portfolioPositions.length}</p>
                      </div>
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                  </CardContent>
              </Card>
              
              <Card className="bg-linear-to-br from-purple-500/5 to-transparent border-purple-100 dark:border-purple-900/50">
                  <CardContent className="p-6 flex items-center justify-between">
                      <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Weighted Avg Yield</p>
                          <p className="text-2xl font-bold text-purple-600">
                              {(portfolioPositions.reduce((sum, pos) => sum + pos.yieldToMaturity, 0) / portfolioPositions.length).toFixed(1)}%
                          </p>
                      </div>
                       <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                          <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                  </CardContent>
              </Card>

              <Card className="bg-linear-to-br from-emerald-500/5 to-transparent border-emerald-100 dark:border-emerald-900/50">
                   <CardContent className="p-6 flex items-center justify-between">
                      <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Risk Health</p>
                          <div className="flex items-center gap-2">
                             <p className="text-2xl font-bold">{((portfolioPositions.filter(p => p.covenantStatus === 'PASS').length / portfolioPositions.length) * 100).toFixed(0)}%</p>
                             <span className="text-sm text-emerald-600 font-medium">Passing</span>
                          </div>
                      </div>
                       <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                  </CardContent>
              </Card>
          </div>

          {/* NavigationTabs */}
          <div className="flex items-center border-b">
              <button 
                onClick={() => setActiveTab("positions")}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === "positions" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                  Positions
                  {activeTab === "positions" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
              <button 
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === "orders" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                  Active Orders
                   {activeTab === "orders" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
               <button 
                onClick={() => setActiveTab("history")}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === "history" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                  Trade History
                   {activeTab === "history" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-6 animate-in fade-in duration-500">
             {activeTab === "positions" && (
                 <div className="grid gap-4">
                     {portfolioPositions.map((position) => (
                         <div 
                            key={position.id} 
                            className="group relative bg-background rounded-xl border p-5 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                
                                {/* Identifier Section */}
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`p-3 rounded-2xl shrink-0 ${
                                        position.covenantStatus === 'PASS' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                                        position.covenantStatus === 'WARNING' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                                        'bg-red-100 text-red-600 dark:bg-red-900/30'
                                    }`}>
                                         {position.covenantStatus === 'PASS' ? <ShieldCheck className="h-6 w-6" /> : 
                                          position.covenantStatus === 'WARNING' ? <Info className="h-6 w-6" /> : 
                                          <ShieldAlert className="h-6 w-6" />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/dashboard/secondary-market/due-diligence/${position.id}`} className="font-bold text-lg hover:text-primary transition-colors flex items-center gap-1.5 leading-none">
                                                {position.borrower}
                                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                            {getRiskBadge(position)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="font-medium text-foreground/80">{position.creditRating}</span>
                                            <span>•</span>
                                            <span>{position.industry}</span>
                                            <span>•</span>
                                            <span className="font-mono">Maturity: {new Date(position.maturityDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Section */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 flex-grow-[2] md:border-l md:pl-8">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Current Value</p>
                                        <p className="text-lg font-bold font-mono text-foreground/90">{formatCurrency(position.currentValue)}</p>
                                    </div>
                                    <div>
                                         <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Unrealized P&L</p>
                                         <p className={`text-lg font-bold font-mono flex items-center gap-1 ${position.unrealizedPnL >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                            {position.unrealizedPnL >= 0 ? "+" : ""}{formatCurrency(position.unrealizedPnL)}
                                         </p>
                                    </div>
                                     <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Purchase Price</p>
                                        <p className="text-lg font-medium font-mono text-muted-foreground">{formatCurrency(position.purchasePrice)}</p>
                                    </div>
                                    <div className="flex flex-col items-start md:items-end justify-center">
                                         <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full md:w-auto hover:bg-primary hover:text-primary-foreground transition-colors border-primary/20 bg-primary/5">
                                                    Manage Position
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2">
                                                        <span>Sell {position.borrower}</span>
                                                        {getRiskBadge(position)}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Create a sell order on the secondary marketplace.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                
                                                <div className="space-y-4 py-4">
                                                    {/* Intelligence Brief in Dialog */}
                                                    <div className="rounded-lg bg-muted/40 p-3 border">
                                                        <div className="flex items-center gap-2 mb-2 text-primary">
                                                            <BrainCircuit className="h-4 w-4" />
                                                            <span className="text-xs font-semibold uppercase tracking-wider">Market Intelligence</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            {position.aiAnalysis || "Standard trading conditions apply. No significant risk factors detected."}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Sale Amount</Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1.5 text-muted-foreground">$</span>
                                                            <Input 
                                                                placeholder={position.currentAmount.toLocaleString()} 
                                                                className="pl-6 font-mono"
                                                                value={sellAmount}
                                                                onChange={(e) => setSellAmount(e.target.value)}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground text-right">Max: {formatCurrency(position.currentAmount)}</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Asking Price</Label>
                                                         <div className="relative">
                                                            <span className="absolute left-3 top-1.5 text-muted-foreground">$</span>
                                                            <Input 
                                                                placeholder="Enter price..." 
                                                                className="pl-6 font-mono"
                                                                value={sellPrice}
                                                                onChange={(e) => setSellPrice(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    {isConfirmOpen && (
                                                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10 animate-in fade-in zoom-in-95 duration-200">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <ShieldAlert className="h-5 w-5 text-red-600" />
                                                                <h4 className="font-semibold text-red-900 dark:text-red-200">Due Diligence Warning</h4>
                                                            </div>
                                                            <p className="text-sm text-red-700 dark:text-red-300 mb-4 leading-relaxed">
                                                                This loan has a <strong className="font-bold">FAIL</strong> compliance status. Selling now may result in a significant discount or require additional disclosures under the Transparent Loan Trading protocol.
                                                            </p>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} className="w-full text-red-700 hover:text-red-800 hover:bg-red-100">
                                                                    Cancel
                                                                </Button>
                                                                <Button variant="destructive" onClick={finalizeSellOrder} className="w-full">
                                                                    Proceed with Risk
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {!isConfirmOpen && (
                                                    <DialogFooter>
                                                        <Button variant="ghost" onClick={() => setSelectedPosition(null)}>Cancel</Button>
                                                        <Button onClick={() => {
                                                            setSelectedPosition(position);
                                                            handleCreateSellOrder();
                                                        }} type="submit" disabled={!sellAmount || !sellPrice}>
                                                            Create Sell Order
                                                        </Button>
                                                    </DialogFooter>
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                         </div>
                     ))}
                 </div>
             )}

             {activeTab === "orders" && (
                <div className="grid gap-4">
                    {activeOrders.map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${order.type === 'BUY' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'}`}>
                                        {order.type === 'BUY' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg">{order.borrower}</span>
                                            {getRiskBadge(order)}
                                        </div>
                                        <div className="text-sm text-muted-foreground flex gap-2">
                                            <span>{order.type} Order</span>
                                            <span>•</span>
                                            <span className="font-mono">{order.id}</span>
                                            <span>•</span>
                                            <span>{new Date(order.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 text-right">
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Amount</p>
                                        <p className="font-mono font-bold">{formatCurrency(order.amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Price</p>
                                        <p className="font-mono font-bold">{formatCurrency(order.price)}</p>
                                    </div>
                                    <div>
                                         <Badge variant="secondary" className="uppercase tracking-widest text-[10px] py-1">
                                             {order.status}
                                         </Badge>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
             )}

             {activeTab === "history" && (
                <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Borrower</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">P&L</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tradeHistory.map((trade) => (
                                <tr key={trade.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="py-3 px-4 font-mono text-muted-foreground">{new Date(trade.date).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 font-medium">{trade.borrower}</td>
                                    <td className="py-3 px-4">
                                        <Badge variant="outline" className={trade.type === 'BUY' ? 'border-blue-200 text-blue-700 bg-blue-50' : 'border-orange-200 text-orange-700 bg-orange-50'}>
                                            {trade.type}
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono">{formatCurrency(trade.amount)}</td>
                                    <td className="py-3 px-4 text-right font-mono">{formatCurrency(trade.price)}</td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-emerald-600">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span className="font-medium">Settled</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-medium">
                                        {trade.pnl ? (
                                            <span className={trade.pnl >= 0 ? "text-emerald-600" : "text-red-600"}>
                                                {trade.pnl >= 0 ? "+" : ""}{formatCurrency(trade.pnl)}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
