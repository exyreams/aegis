export interface LoanListing {
  id: string;
  borrower: string;
  originalLender: string;
  loanAmount: number;
  outstandingAmount: number;
  interestRate: number;
  maturityDate: string;
  creditRating: string;
  industry: string;
  askingPrice: number;
  yieldToMaturity: number;
  dueDiligenceScore: number;
  listingDate: string;
  status: "active" | "under_review" | "sold" | "withdrawn";
  riskLevel: "low" | "medium" | "high";
  
  // Enhanced Fields for "Wow" Factor
  tickerSymbol?: string;
  sectorRegion: string; // e.g., "North America", "EMEA"
  description: string;
  highlights: string[];
  
  // Financials for Analytics
  revenue?: number;
  ebitda?: number;
  leverageRatio?: number;
}

export interface PortfolioPosition extends LoanListing {
  positionId: string;
  purchaseDate: string;
  purchasePrice: number; // The price user paid
  sharesOwned: number; // For simplicity in loan trading, often % of debt
  originalAmount: number;
  currentAmount: number;

  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  
  covenantStatus: "PASS" | "WARNING" | "FAIL";
  tradeRiskSignal: "SAFE" | "REVIEW_REQUIRED" | "HIGH_RISK";
  aiAnalysis?: string;
  riskFactors?: string[];
  lastUpdated?: string;
}

export interface Order {
  id: string;
  loanId: string;
  borrower: string;
  type: "BUY" | "SELL";
  amount: number;
  price: number;
  status: "OPEN" | "PARTIAL" | "FILLED" | "CANCELLED";
  date: string;
  settlementDate?: string;
}

export interface TradeNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  timestamp: number;
  read: boolean;
}
