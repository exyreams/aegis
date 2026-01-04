
export interface MarketStats {
  totalVolume: number;
  activeListings: number;
  avgDueDiligenceTime: number;
  avgTransactionCost: number;
  completedTrades: number;
  avgYield: number;
}

export interface MarketTrend {
  month: string;
  volume: number;
  avgYield: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

// 1. Updated Market Stats with slightly more "active" numbers
export const marketStats: MarketStats = {
  totalVolume: 1847000000000,
  activeListings: 242,
  avgDueDiligenceTime: 1.8, // Reduced thanks to Automation
  avgTransactionCost: 12500,
  completedTrades: 168,
  avgYield: 9.48,
};

// 2. Trends - Healthy growth
export const marketTrends: MarketTrend[] = [
  { month: "Jan", volume: 145, avgYield: 8.2 },
  { month: "Feb", volume: 167, avgYield: 8.4 },
  { month: "Mar", volume: 189, avgYield: 8.1 },
  { month: "Apr", volume: 203, avgYield: 8.6 },
  { month: "May", volume: 178, avgYield: 8.9 },
  { month: "Jun", volume: 234, avgYield: 8.7 },
  { month: "Jul", volume: 256, avgYield: 8.5 },
  { month: "Aug", volume: 289, avgYield: 8.8 },
  { month: "Sep", volume: 267, avgYield: 9.1 },
  { month: "Oct", volume: 298, avgYield: 8.9 },
  { month: "Nov", volume: 312, avgYield: 8.6 },
  { month: "Dec", volume: 334, avgYield: 8.7 },
];

// 3. Industry Distribution
export const industryDistribution: ChartDataPoint[] = [
  { name: "Healthcare", value: 28, color: "var(--chart-1)" },
  { name: "Technology", value: 22, color: "var(--chart-2)" },
  { name: "Manufacturing", value: 18, color: "var(--chart-3)" },
  { name: "Energy", value: 15, color: "var(--chart-4)" },
  { name: "Real Estate", value: 12, color: "var(--chart-5)" },
  { name: "Other", value: 5, color: "#94a3b8" },
];

// 4. [NEW] Covenant Health (Compliance Overview)
export const covenantHealthData: ChartDataPoint[] = [
  { name: "Fully Compliant", value: 65, color: "#10b981" }, // Green
  { name: "Minor Breach (Warning)", value: 25, color: "#f59e0b" }, // Amber
  { name: "Major Breach (Critical)", value: 10, color: "#ef4444" }, // Red
];

// 5. [NEW] Yield vs Risk (Scatter plot data proxy)
// Showing that higher yield correlates with lower compliance scores
export const riskYieldCorrelation = [
  { group: "Low Yield (<7%)", riskScore: 92, avgYield: 6.5 },
  { group: "Med Yield (7-9%)", riskScore: 85, avgYield: 8.2 },
  { group: "High Yield (9-11%)", riskScore: 74, avgYield: 10.1 },
  { group: "Distressed (>11%)", riskScore: 58, avgYield: 14.5 },
];

export const riskDistribution: ChartDataPoint[] = [
  { name: "Low Risk", value: 45, color: "#10b981" },
  { name: "Medium Risk", value: 35, color: "#f59e0b" },
  { name: "High Risk", value: 20, color: "#ef4444" },
];

export const tradingActivity = [
  { day: "Mon", trades: 12, volume: 180 },
  { day: "Tue", trades: 15, volume: 220 },
  { day: "Wed", trades: 8, volume: 150 },
  { day: "Thu", trades: 18, volume: 280 },
  { day: "Fri", trades: 22, volume: 320 },
  { day: "Sat", trades: 5, volume: 80 },
  { day: "Sun", trades: 3, volume: 45 },
];

export const yieldByRating = [
  { rating: "AAA", yield: 5.2, count: 8 },
  { rating: "AA", yield: 6.1, count: 15 },
  { rating: "A", yield: 7.3, count: 32 },
  { rating: "BBB", yield: 8.9, count: 45 },
  { rating: "BB", yield: 11.2, count: 28 },
  { rating: "B", yield: 14.5, count: 18 },
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};
