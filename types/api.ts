// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: "borrower" | "lender" | "admin";
  createdAt: string;
  updatedAt: string;
}

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  image?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Loan-related interfaces
export interface LoanDocument {
  id: string;
  title: string;
  type:
    | "term_sheet"
    | "credit_agreement"
    | "security_document"
    | "compliance_report";
  status: "draft" | "under_review" | "approved" | "executed";
  borrowerId: string;
  lenderId?: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanFacility {
  id: string;
  borrowerId: string;
  lenderIds: string[];
  amount: number;
  currency: string;
  interestRate: number;
  maturityDate: string;
  status: "active" | "defaulted" | "repaid" | "under_review";
  covenants: LoanCovenant[];
  esgMetrics: ESGMetric[];
  createdAt: string;
  updatedAt: string;
}

export interface LoanCovenant {
  id: string;
  type: "financial" | "operational" | "reporting";
  description: string;
  threshold?: number;
  frequency: "monthly" | "quarterly" | "annually";
  status: "compliant" | "breach" | "warning";
  lastChecked: string;
}

export interface ESGMetric {
  id: string;
  category: "environmental" | "social" | "governance";
  metric: string;
  value: number;
  unit: string;
  reportingPeriod: string;
  verified: boolean;
  verificationDate?: string;
}

// Trading interfaces
export interface LoanTrade {
  id: string;
  loanId: string;
  sellerId: string;
  buyerId?: string;
  amount: number;
  price: number;
  status: "listed" | "pending" | "completed" | "cancelled";
  dueDiligenceStatus: "pending" | "in_progress" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
}

// Secondary Market interfaces
export interface LoanListing {
  listingId: string;
  seller: string;
  loanId: string;
  askingPrice: string;
  status: "active" | "pending" | "sold" | "expired" | "cancelled";
  loanDetails: {
    originalAmount: string;
    outstandingAmount: string;
    interestRate: string;
    maturityDate: string;
    borrower: string;
  };
  listedAt: string;
  updatedAt: string;
}

export interface LoanOffer {
  offerId: string;
  buyer: string;
  listingId: string;
  offerPrice: string;
  terms: string;
  status: "pending" | "accepted" | "rejected" | "expired" | "withdrawn";
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
