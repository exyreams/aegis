"use client";

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
import { TrendingUp, Users, Clock, Target, BarChart3 } from "lucide-react";

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
    { name: "Low Risk", value: 45, color: "#10b981" },
    { name: "Medium Risk", value: 35, color: "#f59e0b" },
    { name: "High Risk", value: 20, color: "#ef4444" },
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
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Market Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{volumeChange.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Volume growth (MoM)</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-2" />
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
            <div className="text-sm text-gray-600">Yield change (MoM)</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Settlement Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.avgDueDiligenceTime}d
            </div>
            <div className="text-sm text-gray-600">Avg due diligence</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Market Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.activeListings}
            </div>
            <div className="text-sm text-gray-600">Active participants</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume and Yield Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Market Volume & Yield Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "volume"
                      ? `${formatCurrency(Number(value) * 1000000)}`
                      : `${value}%`,
                    name === "volume" ? "Volume" : "Avg Yield",
                  ]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="volume"
                  fill="#3b82f6"
                  name="volume"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgYield"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="avgYield"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={industryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {industryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Profile Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskDistribution.map((risk) => (
                <div
                  key={risk.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: risk.color }}
                    />
                    <span className="font-medium">{risk.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${risk.value}%`,
                          backgroundColor: risk.color,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {risk.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Risk Insights</h4>
              <p className="text-sm text-blue-800">
                Low-risk loans dominate the market, indicating strong
                institutional confidence. High-yield opportunities remain
                available for risk-tolerant investors.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trading Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Trading Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tradingActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "volume"
                      ? `${formatCurrency(Number(value) * 1000000)}`
                      : value,
                    name === "volume" ? "Volume" : "Trades",
                  ]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="trades"
                  fill="#f59e0b"
                  name="trades"
                />
                <Bar
                  yAxisId="right"
                  dataKey="volume"
                  fill="#3b82f6"
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
          <CardTitle>Yield by Credit Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {yieldByRating.map((rating) => (
              <div key={rating.rating} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="font-mono">
                    {rating.rating}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {rating.count} loans
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {rating.yield.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Average yield</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Automation Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Time Reduction</span>
                <span className="font-medium text-green-600">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Cost Reduction</span>
                <span className="font-medium text-green-600">90%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Accuracy Improvement</span>
                <span className="font-medium text-green-600">95%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Market Liquidity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Bid-Ask Spread</span>
                <span className="font-medium">0.25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Time to Sale</span>
                <span className="font-medium">3.2 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Market Depth</span>
                <span className="font-medium text-blue-600">High</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Success Rate</span>
                <span className="font-medium text-green-600">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Processing</span>
                <span className="font-medium">2.1 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">User Satisfaction</span>
                <span className="font-medium text-green-600">4.8/5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
