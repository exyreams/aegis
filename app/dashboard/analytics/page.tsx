"use client";

import * as React from "react";
import { AppSidebar } from "@/components/navigation";
import { SiteHeader } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import {
  TrendingUp,
  Zap,
  ShieldCheck,
  Activity,
  FileText,
  ArrowUpRight,
  BarChart3
} from "lucide-react";
import { 
    marketStats, 
    marketTrends, 
    industryDistribution, 
    covenantHealthData, 
    riskYieldCorrelation 
} from "@/components/secondary-market/data/analytics";

// --- Premium Chart Configs ---
const volumeYieldConfig = {
  volume: { label: "Volume", color: "hsl(var(--chart-1))" },
  avgYield: { label: "Avg Yield", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("90d");

  // KPI Calculations
  const volumeChange = ((marketTrends[marketTrends.length - 1].volume - marketTrends[marketTrends.length - 2].volume) / marketTrends[marketTrends.length - 2].volume) * 100;
  const yieldChange = marketTrends[marketTrends.length - 1].avgYield - marketTrends[marketTrends.length - 2].avgYield;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-gradient-to-br from-background via-background to-muted/20">
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Market Analytics
              </h1>
              <p className="text-muted-foreground text-lg">
                Real-time insights into market performance and risk distribution.
              </p>
            </div>
            <div className="flex items-center gap-2">
                <div className="bg-background/50 backdrop-blur-sm border rounded-lg p-1">
                   <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[160px] border-none shadow-none focus:ring-0">
                        <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="90d">Last 3 months</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                    </Select> 
                </div>
            </div>
          </div>

          {/* 1. Bento Grid - KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Market Growth */}
            <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-900/20 dark:to-teal-900/10 ring-1 ring-emerald-500/20">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-16 h-16 text-emerald-500" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Market Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground flex items-baseline gap-2">
                    +{volumeChange.toFixed(1)}%
                    <span className="text-xs font-normal text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" /> MoM
                    </span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">Volume trend positive</div>
              </CardContent>
            </Card>
            
            {/* Avg Yield */}
            <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-violet-500/10 to-purple-500/5 dark:from-violet-900/20 dark:to-purple-900/10 ring-1 ring-violet-500/20">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="w-16 h-16 text-violet-500" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Yield Spread</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground flex items-baseline gap-2">
                    +{yieldChange.toFixed(1)} <span className="text-lg">bp</span>
                </div>
                 <div className="text-sm text-muted-foreground mt-2">Yield change (MoM)</div>
              </CardContent>
            </Card>

            {/* Automated DD */}
            <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-900/20 dark:to-orange-900/10 ring-1 ring-amber-500/20">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-16 h-16 text-amber-500" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Automated DD Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground flex items-baseline gap-2">
                    {marketStats.avgDueDiligenceTime}d
                     <span className="text-xs font-normal text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full flex items-center">
                        -85% vs Man
                    </span>
                </div>
                 <div className="text-sm text-muted-foreground mt-2">Avg processing time</div>
              </CardContent>
            </Card>

             {/* Active Participants */}
             <Card className="relative overflow-hidden border-none shadow-lg bg-background/50 backdrop-blur ring-1 ring-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{marketStats.activeListings}</div>
                 <div className="text-sm text-muted-foreground mt-2">Institutions Trading</div>
              </CardContent>
            </Card>
          </div>

          {/* 2. Main Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Covenant Health - The "Hero" Compliance Chart */}
            <Card className="lg:col-span-1 border-none shadow-xl bg-gradient-to-b from-background to-muted/20 ring-1 ring-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center text-lg font-semibold">
                        <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
                        Covenant Health
                    </CardTitle>
                    <CardDescription>Real-time portfolio compliance status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[280px] w-full relative group">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={covenantHealthData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                    cornerRadius={6}
                                >
                                    {covenantHealthData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" className="transition-all duration-300 hover:opacity-80" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', backgroundColor: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
                                    formatter={(value: number | undefined) => [`${value}%`, 'Loans']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Statistics */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-bold tracking-tighter">90%</span>
                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Passing</span>
                        </div>
                    </div>
                    
                    {/* Compact Legend */}
                    <div className="grid grid-cols-1 gap-2 mt-4">
                        {covenantHealthData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center">
                                    <div className="w-2.5 h-2.5 rounded-full mr-3 shadow-sm" style={{ backgroundColor: item.color }} />
                                    <span className={item.name.includes("Critical") ? "font-medium text-destructive" : "text-muted-foreground"}>
                                        {item.name}
                                    </span>
                                </div>
                                <span className="font-bold">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Volume & Yield Trends */}
            <Card className="lg:col-span-2 border-none shadow-xl bg-background/50 backdrop-blur-sm ring-1 ring-border/50">
               <CardHeader>
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <Activity className="h-5 w-5 mr-2 text-primary" />
                    Market Trends
                  </CardTitle>
                  <CardDescription>Volume vs. Yield correlation over time</CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <ChartContainer config={volumeYieldConfig} className="aspect-auto h-[350px] w-full">
                  <AreaChart data={marketTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-volume)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-volume)" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="fillYield" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-avgYield)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-avgYield)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                    <YAxis yAxisId="left" orientation="left" tickLine={false} axisLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                    <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} domain={[0, 15]} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Area yAxisId="left" dataKey="volume" type="monotone" fill="url(#fillVolume)" stroke="var(--color-volume)" strokeWidth={3} />
                    <Area yAxisId="right" dataKey="avgYield" type="monotone" fill="url(#fillYield)" stroke="var(--color-avgYield)" strokeWidth={3} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* 3. Deep Dive Row (Risk & Industry) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Yield vs Risk - Transparent Trading Proof */}
              <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm ring-1 ring-border/50">
                  <CardHeader>
                      <CardTitle className="flex items-center text-lg font-semibold">
                          <Zap className="h-5 w-5 mr-2 text-amber-500" />
                          Yield vs. Compliance Score
                      </CardTitle>
                      <CardDescription>Risk Pricing Efficiency Analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                                  <XAxis type="number" dataKey="riskScore" name="Compliance Score" unit="/100" domain={[50, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}  />
                                  <YAxis type="number" dataKey="avgYield" name="Yield" unit="%" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                      if (active && payload && payload.length) {
                                          return (
                                              <div className="bg-popover text-popover-foreground border rounded-xl p-3 shadow-xl">
                                                  <p className="font-semibold mb-1">{payload[0].payload.group}</p>
                                                  <div className="flex justify-between gap-4 text-sm">
                                                    <span className="text-muted-foreground">Score:</span>
                                                    <span className="font-mono">{payload[0].payload.riskScore}</span>
                                                  </div>
                                                  <div className="flex justify-between gap-4 text-sm">
                                                    <span className="text-muted-foreground">Yield:</span>
                                                    <span className="font-mono text-emerald-500">{payload[1].payload.avgYield}%</span>
                                                  </div>
                                              </div>
                                          );
                                      }
                                      return null;
                                  }} />
                                  <Scatter name="Risk Groups" data={riskYieldCorrelation}>
                                      {riskYieldCorrelation.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 3 ? '#ef4444' : '#f59e0b'} />
                                      ))}
                                  </Scatter>
                              </ScatterChart>
                          </ResponsiveContainer>
                      </div>
                  </CardContent>
              </Card>

              {/* Industry Distribution */}
              <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm ring-1 ring-border/50">
                  <CardHeader>
                      <CardTitle className="flex items-center text-lg font-semibold">
                          <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
                          Industry Exposure
                      </CardTitle>
                      <CardDescription>Portfolio diversification by sector</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie
                                    data={industryDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                    cornerRadius={4}
                                >
                                    {industryDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number | undefined, name: string | undefined) => [`${value}%`, name || '']} 
                                />
                                <Legend 
                                    layout="vertical" 
                                    verticalAlign="middle" 
                                    align="right"
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
                                />
                             </PieChart>
                        </ResponsiveContainer>
                      </div>
                  </CardContent>
              </Card>
          </div>

           {/* 4. Insight Banner */}
           <div className="mt-8 p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
                <div className="bg-background/95 backdrop-blur-md rounded-xl p-6 flex flex-col sm:flex-row items-start gap-5">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full shrink-0">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-foreground mb-1">Analyst Insight</h4>
                        <p className="text-muted-foreground leading-relaxed max-w-4xl">
                            The correlation between <strong>low compliance scores</strong> and <strong>high yields</strong> has strengthened this quarter, indicating improved market efficiency.
                            Automated Due Diligence is now repricing <strong>High Risk</strong> assets <span className="text-emerald-600 font-medium">85% faster</span> than traditional checks.
                        </p>
                    </div>
                </div>
           </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
