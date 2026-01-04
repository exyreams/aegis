
import loansData from "./loans.json";

export interface ActiveOrder {
  id: string;
  loanId: string;
  borrower: string;
  type: "BUY" | "SELL";
  amount: number;
  price: number;
  status: "OPEN" | "PARTIAL" | "FILLED";
  date: string;
  riskSignal: "SAFE" | "REVIEW_REQUIRED" | "HIGH_RISK";
}

export interface TradeHistoryItem {
  id: string;
  loanId: string;
  borrower: string;
  type: "BUY" | "SELL";
  amount: number;
  price: number;
  status: "COMPLETED" | "CANCELLED";
  date: string;
  settlementDate: string;
  pnl?: number;
}

export interface PortfolioPosition {
  id: string; // Loan ID from loans.json
  // Extended fields from Loan
  borrower: string;
  originalLender: string;
  interestRate: number;
  maturityDate: string;
  creditRating: string;
  industry: string;
  
  // Portfolio specific
  positionId: string;
  originalAmount: number;
  currentAmount: number;
  purchasePrice: number; // Total price paid
  currentValue: number; // Current market value
  yieldToMaturity: number;
  
  // Metrics
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  
  // Compliance & Risk (Transparent Loan Trading)
  covenantStatus: "PASS" | "WARNING" | "FAIL";
  tradeRiskSignal: "SAFE" | "REVIEW_REQUIRED" | "HIGH_RISK";
  dueDiligenceScore: number;
  riskFactors?: string[];
  aiAnalysis?: string;
  lastUpdated?: string;
}

// Helper to calculate risk signal based on score and covenant status
const getRiskSignal = (score: number, status: string): "SAFE" | "REVIEW_REQUIRED" | "HIGH_RISK" => {
  if (status === "FAIL" || score < 70) return "HIGH_RISK";
  if (status === "WARNING" || score < 85) return "REVIEW_REQUIRED";
  return "SAFE";
};

// Map a subset of loans to user's portfolio
export const portfolioPositions: PortfolioPosition[] = [
  // 1. Meridian Holdings (Strong performer)
  {
    id: "1",
    positionId: "POS-001",
    borrower: "Meridian Holdings PLC",
    originalLender: "Barclays Bank PLC",
    interestRate: 8.25,
    maturityDate: "2028-06-15",
    creditRating: "BB+",
    industry: "Industrial Services",
    
    originalAmount: 5000000,
    currentAmount: 5000000,
    purchasePrice: 4950000, // Bought at 99.0
    currentValue: 5050000,  // Now at 101.0
    yieldToMaturity: 8.65,
    
    unrealizedPnL: 100000,
    unrealizedPnLPercent: 2.02,
    
    covenantStatus: "PASS",
    tradeRiskSignal: "SAFE",
    dueDiligenceScore: 94,
    lastUpdated: "2 mins ago",
    aiAnalysis: "Strong cash flow coverage (2.1x) and stable leverage. Ideal hold for yield.",
    riskFactors: []
  },
  
  // 3. GreenEnergy Corp (Solid ESG play)
  {
    id: "3",
    positionId: "POS-002",
    borrower: "GreenEnergy Corp",
    originalLender: "Lloyds Banking Group",
    interestRate: 9.15,
    maturityDate: "2029-03-20",
    creditRating: "BBB",
    industry: "Renewable Energy",
    
    originalAmount: 12000000,
    currentAmount: 12000000,
    purchasePrice: 12120000, // Bought at 101.0 (Green premium)
    currentValue: 12240000,  // Now at 102.0
    yieldToMaturity: 9.45,
    
    unrealizedPnL: 120000,
    unrealizedPnLPercent: 0.99,
    
    covenantStatus: "PASS",
    tradeRiskSignal: "SAFE",
    dueDiligenceScore: 88,
    lastUpdated: "5 mins ago",
    aiAnalysis: "Outperforming renewable sector benchmarks. Regulatory tailwinds strong.",
    riskFactors: []
  },
  
  // 5. Atlantic Manufacturing (Warning signs)
  {
    id: "5",
    positionId: "POS-003",
    borrower: "Atlantic Manufacturing",
    originalLender: "Santander UK",
    interestRate: 8.95,
    maturityDate: "2027-07-18",
    creditRating: "BB",
    industry: "Manufacturing",
    
    originalAmount: 3500000,
    currentAmount: 3500000,
    purchasePrice: 3465000, // Bought at 99.0
    currentValue: 3395000,  // Now at 97.0
    yieldToMaturity: 9.85,
    
    unrealizedPnL: -70000,
    unrealizedPnLPercent: -2.02,
    
    covenantStatus: "WARNING",
    tradeRiskSignal: "REVIEW_REQUIRED", // Score 79 is borderline
    dueDiligenceScore: 79,
    lastUpdated: "1 hour ago",
    aiAnalysis: "EBITDA margin compression detected. Watch leverage ratio closely next quarter.",
    riskFactors: ["Margin Compression", "Sector Volatility"]
  },

  // 18. Alpine Ski Resorts (High Risk - Failing Covenants)
  {
    id: "18",
    positionId: "POS-004",
    borrower: "Alpine Ski Resorts",
    originalLender: "HSBC Bank PLC",
    interestRate: 10.15,
    maturityDate: "2026-10-12",
    creditRating: "B+",
    industry: "Hospitality",
    
    originalAmount: 2000000,
    currentAmount: 2000000,
    purchasePrice: 1900000, // Bought at 95.0
    currentValue: 1800000,  // Now at 90.0
    yieldToMaturity: 11.25,
    
    unrealizedPnL: -100000,
    unrealizedPnLPercent: -5.26,
    
    covenantStatus: "FAIL", // Major red flag for traders
    tradeRiskSignal: "HIGH_RISK",
    dueDiligenceScore: 71
  }
];

export const activeOrders: ActiveOrder[] = [
  {
    id: "ORD-001",
    loanId: "12",
    borrower: "Quantum Energy Solutions",
    type: "BUY",
    amount: 2000000,
    price: 1980000, // 99.0
    status: "OPEN",
    date: "2025-01-03",
    riskSignal: "SAFE"
  },
  {
    id: "ORD-002",
    loanId: "18",
    borrower: "Alpine Ski Resorts",
    type: "SELL",
    amount: 1000000,
    price: 850000, // 85.0 - Selling at huge discount due to FAIL status
    status: "PARTIAL",
    date: "2025-01-04",
    riskSignal: "HIGH_RISK"
  }
];

export const tradeHistory: TradeHistoryItem[] = [
  {
    id: "TRD-001",
    loanId: "1",
    borrower: "Meridian Holdings PLC",
    type: "BUY",
    amount: 5000000,
    price: 4950000,
    status: "COMPLETED",
    date: "2024-11-15",
    settlementDate: "2024-11-17",
  },
  {
    id: "TRD-002",
    loanId: "9",
    borrower: "Premier Hospitality Group",
    type: "SELL",
    amount: 1500000,
    price: 1350000,
    status: "COMPLETED",
    date: "2024-12-10",
    settlementDate: "2024-12-12",
    pnl: -150000
  },
  {
    id: "TRD-003",
    loanId: "11",
    borrower: "Metropolitan Real Estate",
    type: "BUY",
    amount: 7500000,
    price: 7500000,
    status: "COMPLETED",
    date: "2024-10-05",
    settlementDate: "2024-10-07",
  }
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercent = (percent: number) => {
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
};
