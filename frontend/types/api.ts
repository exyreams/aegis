// Core API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters?: Record<string, string>;
}

// User related types
export type UserRole =
  | "borrower"
  | "lender"
  | "admin"
  | "risk_analyst"
  | "compliance_officer"
  | "market_maker"
  | "auditor";

export interface UserData {
  id: string;
  email: string;
  name: string;
  damlParty: string;
  role: UserRole;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  lenderProfile?: {
    anonymousId: string;
    categoryTier:
      | "Tier1Bank"
      | "RegionalBank"
      | "InvestmentFund"
      | "PrivateEquity"
      | "InsuranceCompany"
      | "PensionFund"
      | "SpecialtyLender";
    ratingTier: "Premium" | "Standard" | "Basic";
    capacityTier: "Large" | "Medium" | "Small";
    geographicScope: "Global" | "Regional" | "Local";
    internalRating?: string;
  } | null;
}

export interface CreateUserData {
  damlParty: string;
  name: string;
  role: UserRole;
  email?: string;
}

// RFQ related types
export interface RFQData {
  contractId: string;
  id: string;
  title?: string;
  borrower: string;
  loanAmount: number;
  collateralAmount: number;
  collateralAsset: string;
  loanDuration: { microseconds: string };
  approvedLenders: string[];
  createdAt: string;
  expiresAt: string;
  status: "active" | "expired" | "completed" | "cancelled";
  collateralRatio?: string;
  daysRemaining?: number;
}

export interface CreateRFQRequest {
  borrower: string;
  loanAmount: number;
  collateralAmount: number;
  collateralAsset: string;
  collateralCategory: string;
  loanDurationDays: number;
  approvedLenders: string[];
}

export interface CreateRFQData {
  loanAmount: number;
  collateralAmount: number;
  collateralAsset: string;
  collateralCategory: string;
  loanDurationDays: number;
  approvedLenders: string[];
}

export interface RFQResponse {
  contractId: string;
  rfq: RFQData;
}

// Bid related types
export interface BidData {
  lender: string;
  interestRate: number;
  additionalTerms?: string;
}

export interface CreateBidData {
  interestRate: number;
  additionalTerms?: string;
}

export interface BidResponse {
  contractId: string;
  lender: string;
  interestRate: string;
  additionalTerms: string;
}

export interface AcceptBidResponse {
  loanContractId: string;
  message: string;
}

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  damlParty: string;
  role: "borrower" | "lender" | "admin";
}

export interface AuthResponse {
  success: boolean;
  user: UserData;
  token: string;
  error?: string;
}

export interface CurrentUserResponse {
  user: UserData;
  session: {
    id: string;
    token: string;
    expiresAt: string;
  };
  error?: string;
}

export interface UsersResponse {
  success: boolean;
  users?: UserData[];
  error?: string;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
  stats?: {
    totalUsers: number;
    borrowers: number;
    lenders: number;
    admins: number;
  };
}

// Health check types
export interface HealthResponse {
  status: "healthy" | "unhealthy";
  services: {
    daml: "healthy" | "unhealthy";
    database: "healthy" | "unhealthy";
    [key: string]: string;
  };
  uptime: number;
  details?: {
    stats: {
      rfq_count: number;
      bid_count: number;
      user_count: number;
    };
  };
}
// Credit System Types
export interface CreditProfile {
  party: string;
  profileId: string;
  creditScore: number;
  riskRating: string;
  totalBorrowed: string;
  totalRepaid: string;
  currentOutstanding: string;
  numberOfLoans: number;
  numberOfDefaults: number;
  numberOfLatePayments: number;
  averageRepaymentTime: string;
  longestDelayDays: number;
  defaultHistory: string[];
  lastUpdated: string;
  privacyLevel: string;
}

export interface CreateCreditProfileRequest {
  party: string;
  profileId: string;
  creditScore: number;
  riskRating: string;
  totalBorrowed?: string;
  totalRepaid?: string;
  currentOutstanding?: string;
  numberOfLoans?: number;
  numberOfDefaults?: number;
  numberOfLatePayments?: number;
  averageRepaymentTime?: string;
  longestDelayDays?: number;
  defaultHistory?: string[];
  lastUpdated: string;
  privacyLevel: string;
}

export interface CreditInquiry {
  inquiryId: string;
  borrower: string;
  lender: string;
  purpose: string;
  requestedAt: string;
  status: "InquiryPending" | "InquiryApproved" | "InquiryDeclined";
}

export interface RiskAssessment {
  assessmentId: string;
  borrower: string;
  lender: string;
  creditScore: number;
  riskRating: string;
  assessmentDetails: string;
  recommendedInterestRate: string;
  maxLoanAmount: string;
  assessedAt: string;
}

// Collateral Management Types
export interface CollateralPool {
  poolId: string;
  borrower: string;
  lender: string;
  loanId: string;
  collateralAssets: Array<{
    assetType: string;
    amount: string;
    valuation: string;
  }>;
  totalValuation: string;
  requiredRatio: string;
  currentRatio: string;
  status: string;
  lastValuationUpdate: string;
  marginCallThreshold: string;
  liquidationThreshold: string;
}

export interface CollateralLiquidation {
  liquidationId: string;
  poolId: string;
  borrower: string;
  lender: string;
  triggerReason: string;
  assetsToLiquidate: Array<{
    assetType: string;
    amount: string;
  }>;
  estimatedProceeds: string;
  liquidationCosts: string;
  initiatedAt: string;
  status: string;
}

// Syndication Types
export interface SyndicatedLoan {
  loanId: string;
  borrower: string;
  leadLender: string;
  participants: Array<{
    lender: string;
    commitment: string;
    share: string;
  }>;
  totalAmount: string;
  interestRate: string;
  arrangementFee: string;
  participationFee: string;
  terms: string;
  status: string;
  createdAt: string;
}

export interface SyndicateFormation {
  formationId: string;
  leadLender: string;
  borrower: string;
  loanAmount: string;
  targetParticipants: number;
  minimumCommitment: string;
  arrangementFee: string;
  participationFee: string;
  commitments: Array<{
    lender: string;
    amount: string;
    committedAt: string;
  }>;
  status: string;
  deadline: string;
}

// Yield Generation Types
export interface LiquidityPool {
  poolId: string;
  manager: string;
  strategy: string;
  totalLiquidity: string;
  availableLiquidity: string;
  deployedLiquidity: string;
  participants: Array<{
    party: string;
    contribution: string;
    lpTokens: string;
  }>;
  currentYield: string;
  performanceMetrics: {
    totalReturn: string;
    annualizedReturn: string;
    sharpeRatio: string;
  };
  createdAt: string;
}

export interface StakingRewards {
  rewardId: string;
  participant: string;
  poolId: string;
  stakedAmount: string;
  rewardRate: string;
  accruedRewards: string;
  lastClaimDate: string;
  stakingPeriod: string;
  status: string;
}

// Secondary Market Types
export interface LoanListing {
  listingId: string;
  seller: string;
  loanId: string;
  askingPrice: string;
  loanDetails: {
    originalAmount: string;
    outstandingAmount: string;
    interestRate: string;
    maturityDate: string;
    borrower: string;
  };
  listedAt: string;
  status: string;
}

export interface LoanOffer {
  offerId: string;
  buyer: string;
  listingId: string;
  offerPrice: string;
  terms: string;
  validUntil: string;
  status: string;
}

// API Request/Response wrappers for new features
export interface CreditProfileResponse {
  success: boolean;
  data?: {
    contractId: string;
    profile: CreditProfile;
  };
  error?: string;
}

export interface CollateralPoolResponse {
  success: boolean;
  data?: {
    contractId: string;
    pool: CollateralPool;
  };
  error?: string;
}

export interface SyndicatedLoanResponse {
  success: boolean;
  data?: {
    contractId: string;
    loan: SyndicatedLoan;
  };
  error?: string;
}

export interface LiquidityPoolResponse {
  success: boolean;
  data?: {
    contractId: string;
    pool: LiquidityPool;
  };
  error?: string;
}

export interface LoanListingResponse {
  success: boolean;
  data?: {
    contractId: string;
    listing: LoanListing;
  };
  error?: string;
}
