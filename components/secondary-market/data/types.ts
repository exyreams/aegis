export interface LoanListing {
  // Basic Identification
  id: string;
  borrower: string;
  tickerSymbol?: string;
  originalLender: string;
  
  // Financial Terms
  loanAmount: number;
  outstandingAmount: number;
  interestRate: number;
  maturityDate: string;
  creditRating: string;
  
  // Market Information
  industry: string;
  sectorRegion: string;
  askingPrice: number;
  yieldToMaturity: number;
  
  // Risk Metrics
  dueDiligenceScore: number;
  listingDate: string;
  status: "active" | "under_review" | "sold" | "withdrawn";
  riskLevel: "low" | "medium" | "high";
  
  // Business Details
  description: string;
  highlights: string[];
  revenue?: number;
  ebitda?: number;
  leverageRatio?: number;
  
  // Enhanced Loan Structure Details
  facilityType?: "Term Loan A" | "Term Loan B" | "Revolving Credit Facility" | "Unitranche" | "Mezzanine" | "Bridge Loan";
  currency?: "USD" | "EUR" | "GBP" | "CHF";
  originalTerm?: string;
  remainingTerm?: string;
  
  // Pricing Details
  pricing?: {
    baseRate: "SOFR" | "EURIBOR" | "SONIA" | "Prime";
    spread: string; // e.g., "425bps"
    floor: string; // e.g., "0.50%"
    allInRate: string; // e.g., "SOFR + 425 bps"
    margin: number;
    paymentFrequency: "Monthly" | "Quarterly" | "Semi-Annually" | "Annually";
  };
  
  // Security Package
  security?: {
    type: "First Lien Secured" | "Second Lien" | "Unsecured" | "Asset-Backed";
    collateral: string;
    guarantors: string[];
    perfection: string;
  };
  
  // Financial Covenants
  financialCovenants?: FinancialCovenant[];
  
  // Transfer Rights (Critical for secondary trading)
  transferRights?: {
    minimumTransferAmount: string;
    minimumHoldAmount?: string;
    borrowerConsentRequired: boolean;
    borrowerConsentThreshold?: string;
    yieldProtection?: string;
    assignmentFee: string;
    clauseReference: string;
    eligibleAssignees?: string;
  };
  
  // Documents Available for Due Diligence
  availableDocuments?: LoanDocument[];
  
  // Transaction Details
  useOfProceeds?: string;
  administrativeAgent?: string;
  bookrunners?: string[];
  
  syndication?: {
    totalLenders: number;
    leadArrangers: string[];
    participationStructure: string;
  };
  
  // Market Metrics
  marketMetrics?: {
    lastTrade?: {
      price: number;
      date: string;
    };
    bidAskSpread?: string;
    tradingVolume30d?: number;
    averageLifeYTM?: number;
  };
  
  // Key Dates
  keyDates?: {
    closeDate: string;
    firstPaymentDate?: string;
    nextPaymentDate?: string;
    maturityDate: string;
    lastCovenantTest?: string;
    nextCovenantTest?: string;
  };
  
  // Risk Assessment
  riskFactors?: string[];
}

export interface FinancialCovenant {
  covenant: string;
  clause: string; // LMA clause reference (e.g., "12.1(a)")
  threshold: string;
  current: string;
  headroom: string;
  status: "PASS" | "WARNING" | "FAIL";
  testingDate: string;
  nextTestDate: string;
}

export interface LoanDocument {
  name: string;
  type: "Legal" | "Financial" | "ESG" | "Operational" | "Valuation";
  date: string;
  pages: number;
  status: "verified" | "pending" | "missing";
  description?: string;
}

export interface PortfolioPosition extends LoanListing {
  positionId: string;
  purchaseDate: string;
  purchasePrice: number;
  sharesOwned: number;
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
