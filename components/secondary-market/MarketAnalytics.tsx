"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import {
  TrendingUp,
  Users,
  Clock,
  Target,
  BarChart3,
  Activity,
  DollarSign,
  Zap,
} from "lucide-react";

interface MarketTrend {
  month: string;
  volume: number;
  avgYield: number;
}

interface IndustryData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface MarketStats {
  totalVolume: number;
  activeListings: number;
  avgDueDiligenceTime: number;
  avgTransactionCost: number;
  completedTrades: number;
  avgYield: number;
}

interface MarketAnalyticsProps {
  trends: MarketTrend[];
  industryData: IndustryData[];
  stats: MarketStats;
}

// Utility function for formatting currency
const formatCurrency = (amount: number) => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return `${amount.toFixed(0)}`;
};

// Chart configurations
const volumeYieldConfig = {
  volume: {
    label: "Volume",
    color: "var(--chart-1)",
  },
  avgYield: {
    label: "Avg Yield",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const industryConfig = {
  value: {
    label: "Value",
  },
} satisfies ChartConfig;

const riskConfig = {
  value: {
    label: "Value",
  },
} satisfies ChartConfig;

const tradingConfig = {
  trades: {
    label: "Trades",
    color: "var(--chart-1)",
  },
  volume: {
    label: "Volume",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function MarketAnalytics({
  trends,
  industryData,
  stats,
}: MarketAnalyticsProps) {
  const [timeRange, setTimeRange] = React.useState("90d");

  // Fallback data in case props are empty
  const defaultTrends = [
    { month: "Jan", volume: 145, avgYield: 8.2 },
    { month: "Feb", volume: 167, avgYield: 8.4 },
    { month: "Mar", volume: 189, avgYield: 8.1 },
    { month: "Apr", volume: 203, avgYield: 8.6 },
    { month: "May", volume: 178, avgYield: 8.9 },
    { month: "Jun", volume: 234, avgYield: 8.7 },
  ];

  const defaultIndustryData = [
    { name: "Healthcare", value: 28, color: "var(--chart-1)" },
    { name: "Technology", value: 22, color: "var(--chart-2)" },
    { name: "Manufacturing", value: 18, color: "var(--chart-3)" },
    { name: "Energy", value: 15, color: "var(--chart-4)" },
    { name: "Real Estate", value: 12, color: "var(--chart-5)" },
    { name: "Other", value: 5, color: "#94a3b8" },
  ];

  // Use provided data or fallback to defaults
  const trendsData = trends && trends.length > 0 ? trends : defaultTrends;
  const industryChartData =
    industryData && industryData.length > 0
      ? industryData
      : defaultIndustryData;

  // Calculate month-over-month changes
  const volumeChange =
    trendsData.length >= 2
      ? ((trendsData[trendsData.length - 1].volume -
          trendsData[trendsData.length - 2].volume) /
          trendsData[trendsData.length - 2].volume) *
        100
      : 0;

  const yieldChange =
    trendsData.length >= 2
      ? trendsData[trendsData.length - 1].avgYield -
        trendsData[trendsData.length - 2].avgYield
      : 0;

  // Filter trends data based on time range
  const filteredTrends = React.useMemo(() => {
    if (!trendsData || trendsData.length === 0) return defaultTrends;

    if (timeRange === "30d") {
      return trendsData.slice(-6); // Last 6 months for 30d view
    } else if (timeRange === "7d") {
      return trendsData.slice(-3); // Last 3 months for 7d view
    }
    return trendsData; // All data for 90d view
  }, [trendsData, timeRange]);

  // Mock additional analytics data
  const riskDistribution = [
    { name: "Low Risk", value: 45, color: "#10b981" }, // emerald-500
    { name: "Medium Risk", value: 35, color: "#f59e0b" }, // amber-500
    { name: "High Risk", value: 20, color: "#ef4444" }, // red-500
  ];

  const tradingActivity = [
    { day: "Mon", trades: 12, volume: 180 },
    { day: "Tue", trades: 15, volume: 220 },
    { day: "Wed", trades: 8, volume: 150 },
    { day: "Thu", trades: 18, volume: 280 },
    { day: "Fri", trades: 22, volume: 320 },
    { day: "Sat", trades: 5, volume: 80 },
    { day: "Sun", trades: 3, volume: 45 },
  ];

  const yieldByRating = [
    { rating: "AAA", yield: 5.2, count: 8 },
    { rating: "AA", yield: 6.1, count: 15 },
    { rating: "A", yield: 7.3, count: 32 },
    { rating: "BBB", yield: 8.9, count: 45 },
    { rating: "BB", yield: 11.2, count: 28 },
    { rating: "B", yield: 14.5, count: 18 },
  ];

  return (
    <div className="space-y-6 px-4 mx-auto max-w-screen-2xl">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md dark:hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
              Market Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              +{volumeChange.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Volume growth (MoM)
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md dark:hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Target className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400" />
              Avg Yield Spread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                yieldChange >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {yieldChange >= 0 ? "+" : ""}
              {yieldChange.toFixed(1)}bp
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Yield change (MoM)
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md dark:hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-2 text-orange-500 dark:text-orange-400" />
              Settlement Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.avgDueDiligenceTime}d
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Avg due diligence
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md dark:hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="h-4 w-4 mr-2 text-teal-500 dark:text-teal-400" />
              Market Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.activeListings}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Active participants
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume and Yield Trends */}
        <Card>
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                Market Volume & Yield Trends
              </CardTitle>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[160px] rounded-lg sm:ml-auto"
                aria-label="Select a time range"
              >
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">
                  Last 3 months
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Last 30 days
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Last 7 days
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer
              config={volumeYieldConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <AreaChart data={filteredTrends}>
                <defs>
                  <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-volume)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-volume)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillYield" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-avgYield)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-avgYield)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => `Month: ${value}`}
                      formatter={(value, name) => [
                        name === "volume"
                          ? `${formatCurrency(Number(value) * 1000000)}`
                          : `${value}%`,
                        name === "volume" ? "Volume" : "Avg Yield",
                      ]}
                    />
                  }
                />
                <Area
                  dataKey="volume"
                  type="natural"
                  fill="url(#fillVolume)"
                  stroke="var(--color-volume)"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="avgYield"
                  type="natural"
                  fill="url(#fillYield)"
                  stroke="var(--color-avgYield)"
                  strokeWidth={2}
                  stackId="b"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
              Industry Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={industryConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={industryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {industryChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                  }
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-bold text-lg fill-foreground"
                >
                  {`${industryChartData.reduce(
                    (a, b) => a + (b.value as number),
                    0
                  )}%`}
                </text>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {industryChartData.map((item) => (
                <div key={item.name} className="flex items-center text-sm">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" />
              Risk Profile Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-2">
              {riskDistribution.map((risk) => (
                <div key={risk.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: risk.color }}
                      />
                      <span className="font-medium">{risk.name}</span>
                    </div>
                    <span className="text-sm font-bold">{risk.value}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${risk.value}%`,
                        backgroundColor: risk.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mr-3">
                  <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1 text-sm">
                    Risk Insights
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    Low-risk loans dominate the market at 45%, indicating strong
                    institutional confidence. High-yield opportunities remain
                    available for risk-tolerant investors.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trading Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2 text-amber-500 dark:text-amber-400" />
              Weekly Trading Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={tradingConfig} className="h-[300px]">
              <BarChart data={tradingActivity}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        name === "trades"
                          ? `${value} trades`
                          : `${value}M volume`,
                        name === "trades" ? "Trades" : "Volume",
                      ]}
                    />
                  }
                />
                <Bar
                  yAxisId="left"
                  dataKey="trades"
                  fill="var(--color-trades)"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  yAxisId="right"
                  dataKey="volume"
                  fill="var(--color-volume)"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Yield Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <DollarSign className="h-5 w-5 mr-2 text-green-500 dark:text-green-400" />
            Yield by Credit Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {yieldByRating.map((rating) => (
              <Card
                key={rating.rating}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="font-mono font-bold">
                    {rating.rating}
                  </Badge>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {rating.count}
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {rating.yield.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Avg Yield
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-muted/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Zap className="h-4 w-4 mr-2 text-amber-500 dark:text-amber-400" />
              Automation Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: "Time Reduction",
                  value: "85%",
                  color: "text-green-600",
                },
                {
                  label: "Cost Reduction",
                  value: "90%",
                  color: "text-green-600",
                },
                { label: "Accuracy", value: "95%", color: "text-green-600" },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-card hover:shadow-sm transition-all"
                >
                  <span className="text-sm text-muted-foreground">
                    {metric.label}
                  </span>
                  <span className={`font-bold ${metric.color}`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
              Market Liquidity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Bid-Ask Spread", value: "0.25%" },
                { label: "Avg Time to Sale", value: "3.2 days" },
                { label: "Market Depth", value: "High", highlight: true },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-card hover:shadow-sm transition-all"
                >
                  <span className="text-sm text-muted-foreground">
                    {metric.label}
                  </span>
                  <span
                    className={`font-bold ${
                      metric.highlight ? "text-blue-600 dark:text-blue-400" : ""
                    }`}
                  >
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Users className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400" />
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: "Success Rate",
                  value: "98.5%",
                  color: "text-green-600",
                },
                { label: "Avg Processing", value: "2.1 min" },
                {
                  label: "Satisfaction",
                  value: "4.8/5",
                  color: "text-green-600",
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-card hover:shadow-sm transition-all"
                >
                  <span className="text-sm text-muted-foreground">
                    {metric.label}
                  </span>
                  <span className={`font-bold ${metric.color || ""}`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
