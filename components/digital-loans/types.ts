export interface LoanData {
  id: string;
  borrower: string;
  lender: string;
  amount: number;
  currency: string;
  interestRate: number;
  term: number;
  maturityDate: string;
  facilityType: string;
  status:
    | "draft"
    | "under_review"
    | "approved"
    | "active"
    | "completed"
    | "defaulted";
  purpose: string;
  riskRating:
    | "AAA"
    | "AA"
    | "A"
    | "BBB"
    | "BB"
    | "B"
    | "CCC"
    | "CC"
    | "C"
    | "D";
  covenants: Array<{
    type: string;
    description: string;
    status: "compliant" | "breach" | "warning";
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadedAt: string;
    processed: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
  esgScore?: number;
  sustainabilityLinked?: boolean;
}

export interface ExtractedData {
  loanAmount: number;
  currency: string;
  interestRate: number;
  margin?: number;
  baseRate: string;
  term: number;
  maturityDate: string;
  drawdownDate: string;
  borrower: string;
  lender: string;
  agent: string;
  arrangers: string[];
  facilityType: string;
  purpose: string;
  availability: string;
  covenants: Array<{
    type: string;
    description: string;
    threshold: string;
    testDate: string;
    status: string;
    severity: string;
  }>;
  fees: Array<{
    type: string;
    amount: number | null;
    percentage: number;
  }>;
  riskMetrics?: {
    creditScore: string;
    probabilityOfDefault: number;
    lossGivenDefault: number;
    expectedLoss: number;
    riskWeighting: number;
    economicCapital: number;
    raroc: number;
  };
  esgMetrics?: {
    overallScore: number;
    environmental: {
      score: number;
      metrics: Array<{ name: string; target: string; current: string }>;
    };
    social: {
      score: number;
      metrics: Array<{ name: string; target: string; current: string }>;
    };
    governance: {
      score: number;
      metrics: Array<{ name: string; target: string; current: string }>;
    };
  };
  regulatoryAnalysis: {
    jurisdiction: string;
    applicableRegulations: string[];
    complianceStatus: string;
    regulatoryCapital?: {
      tier1Ratio: number;
      totalCapitalRatio: number;
      leverageRatio: number;
      riskWeightedAssets: number;
    };
  };
  processingTime: string;
  confidence: number;
  documentsProcessed: number;
  pagesAnalyzed: number;
  dataPointsExtracted: number;
}
