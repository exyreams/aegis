// Standardized loan data structures for interoperability
export interface StandardizedLoanData {
  // Core Identifiers
  id: string;
  version: string;
  lastUpdated: string;
  dataStandard: "LMA-EDGE-2024" | "LSTA-2024" | "APLMA-2024";

  // Parties (Standardized)
  parties: {
    borrower: {
      name: string;
      entityId?: string; // LEI or other standard identifier
      jurisdiction: string;
      sector: string;
      creditRating?: string;
    };
    lender: {
      name: string;
      entityId?: string;
      type: "bank" | "institutional" | "alternative" | "syndicate";
    };
    agent?: {
      name: string;
      entityId?: string;
    };
    arrangers?: Array<{
      name: string;
      entityId?: string;
      role: string;
    }>;
  };

  // Financial Terms (Standardized)
  financialTerms: {
    amount: {
      value: number;
      currency: string; // ISO 4217
      precision: number;
    };
    pricing: {
      baseRate:
        | "SOFR"
        | "LIBOR"
        | "EURIBOR"
        | "SONIA"
        | "CDOR"
        | "BBSW"
        | "TIBOR";
      margin: number; // basis points
      allInRate?: number; // calculated rate
      dayCountConvention: "30/360" | "ACT/360" | "ACT/365" | "30E/360";
    };
    term: {
      months: number;
      years: number;
      maturityDate: string; // ISO 8601
    };
    amortization?: {
      type: "bullet" | "amortizing" | "balloon";
      schedule?: Array<{
        date: string;
        principalAmount: number;
        interestAmount: number;
      }>;
    };
  };

  // Facility Details (Standardized)
  facilityDetails: {
    type:
      | "term_loan"
      | "revolving_credit"
      | "syndicated_loan"
      | "bilateral_loan"
      | "project_finance"
      | "bridge_loan";
    subType?: string;
    purpose: string;
    availability: {
      multicurrency: boolean;
      currencies?: string[];
      drawdownConditions?: string[];
    };
    commitment: {
      committed: boolean;
      amount: number;
      currency: string;
    };
  };

  // Covenants (Standardized)
  covenants: {
    financial: Array<{
      id: string;
      type:
        | "leverage"
        | "coverage"
        | "liquidity"
        | "capex"
        | "debt_service"
        | "net_worth";
      description: string;
      threshold: {
        value: number;
        operator: ">=" | "<=" | "=" | ">" | "<";
        unit: "ratio" | "amount" | "percentage";
      };
      testingFrequency: "quarterly" | "semi_annual" | "annual" | "monthly";
      testingDates: string[];
      status: "compliant" | "breach" | "waived" | "amended";
      lastTested?: string;
      nextTest?: string;
    }>;
    operational: Array<{
      id: string;
      type:
        | "material_adverse_change"
        | "ownership_change"
        | "business_restriction"
        | "asset_disposal";
      description: string;
      status: "active" | "inactive" | "breached";
    }>;
    reporting: Array<{
      id: string;
      type:
        | "financial_statements"
        | "compliance_certificate"
        | "budget"
        | "management_accounts";
      frequency: "monthly" | "quarterly" | "annual";
      deadline: string; // relative to period end
      status: "current" | "overdue" | "waived";
    }>;
  };

  // Security Package (Standardized)
  security?: {
    secured: boolean;
    collateral: Array<{
      type:
        | "real_estate"
        | "equipment"
        | "inventory"
        | "accounts_receivable"
        | "cash"
        | "securities"
        | "intellectual_property";
      description: string;
      value?: number;
      currency?: string;
      lienPriority: "first" | "second" | "subordinated";
    }>;
    guarantees: Array<{
      guarantor: string;
      type: "corporate" | "personal" | "limited" | "unlimited";
      amount?: number;
      currency?: string;
    }>;
  };

  // Fees (Standardized)
  fees: Array<{
    type:
      | "arrangement"
      | "commitment"
      | "utilization"
      | "agency"
      | "amendment"
      | "prepayment"
      | "default";
    structure: "upfront" | "ongoing" | "conditional";
    amount?: number;
    percentage?: number;
    currency?: string;
    paymentTiming: string;
    description: string;
  }>;

  // ESG & Sustainability (Standardized)
  esg?: {
    sustainabilityLinked: boolean;
    framework?: "ICMA" | "LMA" | "APLMA" | "custom";
    kpis: Array<{
      metric: string;
      baseline: number;
      target: number;
      unit: string;
      testingFrequency: "annual" | "semi_annual" | "quarterly";
      pricingAdjustment: {
        improvement: number; // basis points
        deterioration: number; // basis points
      };
    }>;
    useOfProceeds?: {
      greenProject: boolean;
      socialProject: boolean;
      sustainabilityProject: boolean;
      description: string;
    };
    reporting: {
      frequency: "annual" | "semi_annual";
      verificationRequired: boolean;
      verifier?: string;
    };
  };

  // Regulatory & Compliance (Standardized)
  regulatory: {
    jurisdiction: string; // ISO 3166-1 alpha-2
    governingLaw: string;
    applicableRegulations: string[];
    riskWeighting?: number; // Basel III
    capitalTreatment?: string;
    reportingRequirements: Array<{
      regulation: string;
      frequency: string;
      deadline: string;
    }>;
  };

  // Documentation (Standardized)
  documentation: {
    creditAgreement: {
      executed: boolean;
      executionDate?: string;
      version: string;
    };
    securityDocuments: Array<{
      type: string;
      executed: boolean;
      executionDate?: string;
    }>;
    opinions: Array<{
      type: "legal" | "tax" | "regulatory";
      jurisdiction: string;
      received: boolean;
      date?: string;
    }>;
  };

  // Market Data (Standardized)
  marketData?: {
    benchmarkRates: Array<{
      date: string;
      rate: number;
      source: string;
    }>;
    creditSpreads?: Array<{
      date: string;
      spread: number;
      rating: string;
      sector: string;
    }>;
  };

  // Lifecycle Events (Standardized)
  lifecycle: {
    status:
      | "draft"
      | "negotiation"
      | "documentation"
      | "executed"
      | "active"
      | "matured"
      | "cancelled"
      | "defaulted";
    milestones: Array<{
      event: string;
      date: string;
      description?: string;
    }>;
    amendments: Array<{
      id: string;
      date: string;
      type: "pricing" | "covenant" | "maturity" | "amount" | "other";
      description: string;
      executed: boolean;
    }>;
  };

  // Data Quality & Validation
  dataQuality: {
    completeness: number; // percentage
    accuracy: number; // percentage
    lastValidated: string;
    validationRules: string[];
    issues: Array<{
      field: string;
      severity: "error" | "warning" | "info";
      message: string;
    }>;
  };

  // Interoperability Metadata
  interoperability: {
    sourceSystem: string;
    targetSystems: string[];
    mappingVersion: string;
    exportFormats: Array<"json" | "xml" | "csv" | "fpml" | "fixml">;
    apiEndpoints?: Array<{
      method: string;
      url: string;
      description: string;
    }>;
  };
}

// Standardized loan comparison interface
export interface LoanComparison {
  loans: StandardizedLoanData[];
  comparisonMetrics: {
    pricing: {
      allInRates: number[];
      margins: number[];
      fees: number[];
    };
    terms: {
      maturities: string[];
      amounts: number[];
    };
    covenants: {
      leverageRatios: Array<number | null>;
      coverageRatios: Array<number | null>;
      covenantCount: number[];
    };
    esg: {
      sustainabilityLinked: boolean[];
      esgScores: Array<number | null>;
    };
  };
  analysis: {
    marketPosition: "tight" | "market" | "wide";
    recommendations: string[];
    riskAssessment: string;
  };
}

// Data standardization utilities
export class LoanDataStandardizer {
  static validateLoanData(data: Partial<StandardizedLoanData>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!data.id) errors.push("Loan ID is required");
    if (!data.parties?.borrower?.name) errors.push("Borrower name is required");
    if (!data.financialTerms?.amount?.value)
      errors.push("Loan amount is required");
    if (!data.financialTerms?.amount?.currency)
      errors.push("Currency is required");

    // Data format validation
    if (
      data.financialTerms?.amount?.currency &&
      !/^[A-Z]{3}$/.test(data.financialTerms.amount.currency)
    ) {
      errors.push("Currency must be ISO 4217 format (3 letters)");
    }

    // Business logic validation
    if (
      data.financialTerms?.pricing?.margin &&
      data.financialTerms.pricing.margin < 0
    ) {
      warnings.push("Negative margin detected");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static compareLoanTerms(
    loan1: StandardizedLoanData,
    loan2: StandardizedLoanData
  ): LoanComparison {
    return {
      loans: [loan1, loan2],
      comparisonMetrics: {
        pricing: {
          allInRates: [
            loan1.financialTerms.pricing.allInRate || 0,
            loan2.financialTerms.pricing.allInRate || 0,
          ],
          margins: [
            loan1.financialTerms.pricing.margin,
            loan2.financialTerms.pricing.margin,
          ],
          fees: [
            loan1.fees.reduce((sum, fee) => sum + (fee.amount || 0), 0),
            loan2.fees.reduce((sum, fee) => sum + (fee.amount || 0), 0),
          ],
        },
        terms: {
          maturities: [
            loan1.financialTerms.term.maturityDate,
            loan2.financialTerms.term.maturityDate,
          ],
          amounts: [
            loan1.financialTerms.amount.value,
            loan2.financialTerms.amount.value,
          ],
        },
        covenants: {
          leverageRatios: [
            loan1.covenants.financial.find((c) => c.type === "leverage")
              ?.threshold.value || null,
            loan2.covenants.financial.find((c) => c.type === "leverage")
              ?.threshold.value || null,
          ],
          coverageRatios: [
            loan1.covenants.financial.find((c) => c.type === "coverage")
              ?.threshold.value || null,
            loan2.covenants.financial.find((c) => c.type === "coverage")
              ?.threshold.value || null,
          ],
          covenantCount: [
            loan1.covenants.financial.length +
              loan1.covenants.operational.length,
            loan2.covenants.financial.length +
              loan2.covenants.operational.length,
          ],
        },
        esg: {
          sustainabilityLinked: [
            loan1.esg?.sustainabilityLinked || false,
            loan2.esg?.sustainabilityLinked || false,
          ],
          esgScores: [null, null], // Would be calculated from ESG KPIs
        },
      },
      analysis: {
        marketPosition: "market", // Would be determined by market data comparison
        recommendations: [
          "Consider covenant alignment with market standards",
          "Review pricing competitiveness",
        ],
        riskAssessment: "Standard commercial risk profile",
      },
    };
  }

  static exportToFormat(
    data: StandardizedLoanData,
    format: "json" | "xml" | "csv"
  ): string {
    switch (format) {
      case "json":
        return JSON.stringify(data, null, 2);
      case "xml":
        // Simplified XML export - in production, use proper XML library
        return `<?xml version="1.0" encoding="UTF-8"?>
<loan id="${data.id}">
  <borrower>${data.parties.borrower.name}</borrower>
  <amount currency="${data.financialTerms.amount.currency}">${data.financialTerms.amount.value}</amount>
  <rate>${data.financialTerms.pricing.allInRate}</rate>
  <maturity>${data.financialTerms.term.maturityDate}</maturity>
</loan>`;
      case "csv":
        // Simplified CSV export - in production, handle nested objects properly
        return `ID,Borrower,Amount,Currency,Rate,Maturity
${data.id},${data.parties.borrower.name},${data.financialTerms.amount.value},${data.financialTerms.amount.currency},${data.financialTerms.pricing.allInRate},${data.financialTerms.term.maturityDate}`;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  static generateInteroperabilityReport(data: StandardizedLoanData): {
    compatibility: Record<string, boolean>;
    mappingIssues: string[];
    recommendations: string[];
  } {
    const compatibility = {
      "LMA Standard": true,
      "LSTA Standard": true,
      "APLMA Standard": true,
      "Basel III": !!data.regulatory.riskWeighting,
      "IFRS 9": true,
      CECL: true,
    };

    const mappingIssues: string[] = [];
    const recommendations: string[] = [];

    // Check for common interoperability issues
    if (!data.parties.borrower.entityId) {
      mappingIssues.push(
        "Missing borrower LEI - may cause entity matching issues"
      );
      recommendations.push("Add Legal Entity Identifier (LEI) for borrower");
    }

    if (!data.regulatory.riskWeighting) {
      mappingIssues.push(
        "Missing risk weighting - required for regulatory capital calculations"
      );
      recommendations.push("Add Basel III risk weighting");
    }

    return {
      compatibility,
      mappingIssues,
      recommendations,
    };
  }
}

// Mock data generator for testing
export function generateMockLoanData(): StandardizedLoanData {
  return {
    id: `LOAN-${Date.now()}`,
    version: "1.0",
    lastUpdated: new Date().toISOString(),
    dataStandard: "LMA-EDGE-2024",

    parties: {
      borrower: {
        name: "Global Manufacturing Corp",
        entityId: "549300ABCDEF123456789",
        jurisdiction: "US",
        sector: "Manufacturing",
        creditRating: "BBB+",
      },
      lender: {
        name: "JPMorgan Chase Bank, N.A.",
        entityId: "7H6GLXDRUGQFU57RNE97",
        type: "bank",
      },
    },

    financialTerms: {
      amount: {
        value: 250000000,
        currency: "USD",
        precision: 2,
      },
      pricing: {
        baseRate: "SOFR",
        margin: 275,
        allInRate: 5.25,
        dayCountConvention: "ACT/360",
      },
      term: {
        months: 60,
        years: 5,
        maturityDate: "2029-12-31",
      },
    },

    facilityDetails: {
      type: "revolving_credit",
      purpose: "General corporate purposes and working capital",
      availability: {
        multicurrency: true,
        currencies: ["USD", "EUR", "GBP"],
      },
      commitment: {
        committed: true,
        amount: 250000000,
        currency: "USD",
      },
    },

    covenants: {
      financial: [
        {
          id: "COV-001",
          type: "leverage",
          description: "Total Debt to EBITDA Ratio",
          threshold: {
            value: 3.5,
            operator: "<=",
            unit: "ratio",
          },
          testingFrequency: "quarterly",
          testingDates: [
            "2024-03-31",
            "2024-06-30",
            "2024-09-30",
            "2024-12-31",
          ],
          status: "compliant",
          nextTest: "2024-03-31",
        },
      ],
      operational: [],
      reporting: [],
    },

    fees: [
      {
        type: "arrangement",
        structure: "upfront",
        amount: 1250000,
        currency: "USD",
        paymentTiming: "On execution",
        description: "Arrangement fee",
      },
    ],

    regulatory: {
      jurisdiction: "US",
      governingLaw: "New York",
      applicableRegulations: ["Dodd-Frank Act", "Basel III"],
      riskWeighting: 100,
      reportingRequirements: [],
    },

    documentation: {
      creditAgreement: {
        executed: true,
        executionDate: "2024-01-15",
        version: "1.0",
      },
      securityDocuments: [],
      opinions: [],
    },

    lifecycle: {
      status: "active",
      milestones: [
        {
          event: "Credit Agreement Executed",
          date: "2024-01-15",
        },
      ],
      amendments: [],
    },

    dataQuality: {
      completeness: 95,
      accuracy: 98,
      lastValidated: new Date().toISOString(),
      validationRules: ["required_fields", "data_formats", "business_logic"],
      issues: [],
    },

    interoperability: {
      sourceSystem: "LMA-EDGE-Platform",
      targetSystems: ["Bloomberg", "Refinitiv", "S&P", "Moody's"],
      mappingVersion: "2024.1",
      exportFormats: ["json", "xml", "csv"],
    },
  };
}
