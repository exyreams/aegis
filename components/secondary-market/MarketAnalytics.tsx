"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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

// Custom Tooltip for consistent styling across charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-500 capitalize">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {entry.name === "volume"
                ? formatCurrency(Number(entry.value) * 1000000)
                : `${entry.value}%`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function MarketAnalytics({
  trends,
  industryData,
  stats,
}: MarketAnalyticsProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  // Calculate month-over-month changes
  const volumeChange =
    trends.length >= 2
      ? ((trends[trends.length - 1].volume - trends[trends.length - 2].volume) /
          trends[trends.length - 2].volume) *
        100
      : 0;

  const yieldChange =
    trends.length >= 2
      ? trends[trends.length - 1].avgYield - trends[trends.length - 2].avgYield
      : 0;

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
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
              Market Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{volumeChange.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Volume growth (MoM)
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Target className="h-4 w-4 mr-2 text-purple-500" />
              Avg Yield Spread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                yieldChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {yieldChange >= 0 ? "+" : ""}
              {yieldChange.toFixed(1)}bp
            </div>
            <div className="text-sm text-gray-600 mt-1">Yield change (MoM)</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-orange-500" />
              Settlement Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.avgDueDiligenceTime}d
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg due diligence</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Users className="h-4 w-4 mr-2 text-teal-500" />
              Market Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.activeListings}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Active participants
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume and Yield Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Market Volume & Yield Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickFormatter={(value) => `${value}M`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="volume"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  name="volume"
                  opacity={0.8}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgYield"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#10b981",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  name="avgYield"
                />
              </LineChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {industryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-gray-700 font-bold text-lg"
                >
                  {`${industryData.reduce(
                    (a, b) => a + (b.value as number),
                    0
                  )}%`}
                </text>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {industryData.map((item) => (
                <div key={item.name} className="flex items-center text-sm">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
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
              <Activity className="h-5 w-5 mr-2 text-red-500" />
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
                      <span className="font-medium text-gray-700">
                        {risk.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {risk.value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
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
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1 text-sm">
                    Risk Insights
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
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
              <TrendingUp className="h-5 w-5 mr-2 text-amber-500" />
              Weekly Trading Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tradingActivity}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f9fafb" }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="trades"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                  name="trades"
                />
                <Bar
                  yAxisId="right"
                  dataKey="volume"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                  name="volume"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Yield Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            Yield by Credit Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {yieldByRating.map((rating) => (
              <div
                key={rating.rating}
                className="border rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant="outline"
                    className="font-mono font-bold border-gray-300 text-gray-700"
                  >
                    {rating.rating}
                  </Badge>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {rating.count}
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {rating.yield.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Avg Yield
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Zap className="h-4 w-4 mr-2 text-amber-500" />
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
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                >
                  <span className="text-sm text-gray-600">{metric.label}</span>
                  <span className={`font-bold ${metric.color}`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Activity className="h-4 w-4 mr-2 text-blue-500" />
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
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                >
                  <span className="text-sm text-gray-600">{metric.label}</span>
                  <span
                    className={`font-bold ${
                      metric.highlight ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
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
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                >
                  <span className="text-sm text-gray-600">{metric.label}</span>
                  <span
                    className={`font-bold ${metric.color || "text-gray-900"}`}
                  >
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
