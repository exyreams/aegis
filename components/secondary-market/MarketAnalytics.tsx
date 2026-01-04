"use client";

import * as React from "react";
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
  Scatter} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import {
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Activity,
  Zap,
  ShieldCheck,
  FileText
} from "lucide-react";
import { 
    marketStats, 
    marketTrends, 
    industryDistribution, 
    covenantHealthData, 
    riskYieldCorrelation} from "./data/analytics";

// Chart Configs
const volumeYieldConfig = {
  volume: { label: "Volume", color: "var(--chart-1)" },
  avgYield: { label: "Avg Yield", color: "var(--chart-2)" },
} satisfies ChartConfig;

const covenantConfig = {
    value: { label: "Loans" }
} satisfies ChartConfig;

export function MarketAnalytics() {
  const [timeRange, setTimeRange] = React.useState("90d");

  // Calculate trends for KPI cards
  const volumeChange = ((marketTrends[marketTrends.length - 1].volume - marketTrends[marketTrends.length - 2].volume) / marketTrends[marketTrends.length - 2].volume) * 100;
  const yieldChange = marketTrends[marketTrends.length - 1].avgYield - marketTrends[marketTrends.length - 2].avgYield;

  return (
    <div className="space-y-6 px-4 mx-auto max-w-screen-2xl">
      {/* 1. Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Market Growth */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" /> Market Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{volumeChange.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground mt-1">Volume growth (MoM)</div>
          </CardContent>
        </Card>
        
        {/* Avg Yield - Primary Driver for Traders */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Target className="h-4 w-4 mr-2 text-purple-500" /> Avg Yield Spread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{yieldChange.toFixed(1)}bp</div>
            <div className="text-sm text-muted-foreground mt-1">Yield change (MoM)</div>
          </CardContent>
        </Card>

        {/* Due Diligence Speed - Automation Theme */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-blue-200 bg-blue-50/50 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Zap className="h-4 w-4 mr-2 text-amber-500" /> Automated DD Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{marketStats.avgDueDiligenceTime}d</div>
            <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-green-600 font-medium">↓ 85%</span> vs Manual
            </div>
          </CardContent>
        </Card>

        {/* Active Participants */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="h-4 w-4 mr-2 text-teal-500" /> Active Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{marketStats.activeListings}</div>
            <div className="text-sm text-muted-foreground mt-1">Institutions Trading</div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Health (Theme: Keeping Loans on Track) */}
        <Card className="lg:col-span-1 border-l-4 border-l-blue-500">
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <ShieldCheck className="h-5 w-5 mr-2 text-blue-500" />
                    Covenant Health
                </CardTitle>
                <CardDescription>Real-time portfolio compliance status</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={covenantHealthData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {covenantHealthData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number | undefined) => [`${value}%`, 'Loans']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="text-3xl font-bold text-foreground">90%</span>
                            <p className="text-xs text-muted-foreground">Passing</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-3 mt-2">
                    {covenantHealthData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                                <span className={item.name.includes("Critical") ? "font-medium text-red-600" : "text-muted-foreground"}>
                                    {item.name}
                                </span>
                            </div>
                            <span className="font-mono font-medium">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* Volume & Yield (Theme: Market Overview) */}
        <Card className="lg:col-span-2">
           <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Market Trends
              </CardTitle>
              <CardDescription>Volume vs. Yield correlation over time</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto">
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer config={volumeYieldConfig} className="aspect-auto h-[300px] w-full">
              <AreaChart data={marketTrends}>
                <defs>
                  <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-volume)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-volume)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-avgYield)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-avgYield)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis yAxisId="left" orientation="left" tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} domain={[0, 15]} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area yAxisId="left" dataKey="volume" type="monotone" fill="url(#fillVolume)" stroke="var(--color-volume)" strokeWidth={2} />
                <Area yAxisId="right" dataKey="avgYield" type="monotone" fill="url(#fillYield)" stroke="var(--color-avgYield)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3. Deep Dive Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yield vs Risk (Theme: Transparent Trading) */}
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                      <Zap className="h-5 w-5 mr-2 text-amber-500" />
                      Yield vs. Compliance Score
                  </CardTitle>
                  <CardDescription>Higher yields correlate with lower compliance scores (Risk Pricing)</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" dataKey="riskScore" name="Compliance Score" unit="/100" domain={[50, 100]} label={{ value: 'Compliance Score', position: 'insideBottom', offset: -10 }} />
                              <YAxis type="number" dataKey="avgYield" name="Yield" unit="%" label={{ value: 'Yield %', angle: -90, position: 'insideLeft' }} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                      return (
                                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                                              <p className="font-semibold">{payload[0].payload.group}</p>
                                              <p className="text-sm">Score: {payload[0].payload.riskScore}/100</p>
                                              <p className="text-sm">Yield: {payload[1].payload.avgYield}%</p>
                                          </div>
                                      );
                                  }
                                  return null;
                              }} />
                              <Scatter name="Risk Groups" data={riskYieldCorrelation} fill="#8884d8">
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
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                      <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
                      Industry Distribution
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                                data={industryDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {industryDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number | undefined, name: any) => [`${value}%`, name]} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                         </PieChart>
                    </ResponsiveContainer>
                  </div>
              </CardContent>
          </Card>
      </div>

       {/* 4. Insight Banner */}
       <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-lg border border-blue-100 dark:border-blue-900 flex items-start gap-4">
            <div className="p-2 bg-white dark:bg-blue-950 rounded-full shadow-sm">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Analyst Insight</h4>
                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    The correlation between <strong>low compliance scores</strong> and <strong>high yields</strong> has strengthened this quarter, indicating improved market efficiency.
                    Automated Due Diligence is now repricing <strong>High Risk</strong> assets 85% faster than traditional checks.
                </p>
            </div>
       </div>
    </div>
  );
}
