/**
 * DAML Configuration and Template Management
 *
 * Contains DAML ledger connection settings, template IDs, contract choices,
 * business rules, and validation utilities for the Aegis RFQ platform.
 *
 * Template IDs should be extracted from generated TypeScript bindings.
 * Run after: daml build && daml codegen js
 */

export const DAML_CONFIG = {
  jsonApiUrl: process.env.DAML_JSON_API_URL,
  wsUrl: process.env.DAML_WS_URL,
  ledgerId: process.env.DAML_LEDGER_ID || "sandbox",
  applicationId: process.env.DAML_APPLICATION_ID || "aegis-rfq-platform",
  templates: {
    // Core RFQ Templates - generated from DAML compilation
    RFQ: process.env.DAML_TEMPLATE_RFQ,
    Bid: process.env.DAML_TEMPLATE_BID,
    Loan: process.env.DAML_TEMPLATE_LOAN,
    LoanProposal: process.env.DAML_TEMPLATE_LOAN_PROPOSAL,

    // Credit System Templates
    CreditProfileContract: process.env.DAML_TEMPLATE_CREDIT_PROFILE,
    RiskAssessment: process.env.DAML_TEMPLATE_RISK_ASSESSMENT,
    PortfolioRisk: process.env.DAML_TEMPLATE_PORTFOLIO_RISK,
    CreditInquiry: process.env.DAML_TEMPLATE_CREDIT_INQUIRY,
    CreditInsurance: process.env.DAML_TEMPLATE_CREDIT_INSURANCE,
    CreditGuarantee: process.env.DAML_TEMPLATE_CREDIT_GUARANTEE,

    // Syndication Templates
    SyndicatedLoan: process.env.DAML_TEMPLATE_SYNDICATED_LOAN,
    SyndicateDecisionVote: process.env.DAML_TEMPLATE_SYNDICATE_VOTE,
    SyndicateFormation: process.env.DAML_TEMPLATE_SYNDICATE_FORMATION,
    SyndicateReport: process.env.DAML_TEMPLATE_SYNDICATE_REPORT,

    // Collateral Management Templates
    CollateralPool: process.env.DAML_TEMPLATE_COLLATERAL_POOL,
    SubstitutionRequest: process.env.DAML_TEMPLATE_SUBSTITUTION_REQUEST,
    CollateralLiquidation: process.env.DAML_TEMPLATE_COLLATERAL_LIQUIDATION,
    LiquidationSettlement: process.env.DAML_TEMPLATE_LIQUIDATION_SETTLEMENT,

    // Yield Generation Templates
    LiquidityPool: process.env.DAML_TEMPLATE_LIQUIDITY_POOL,
    LPToken: process.env.DAML_TEMPLATE_LP_TOKEN,
    YieldOptimizer: process.env.DAML_TEMPLATE_YIELD_OPTIMIZER,
    StakingRewards: process.env.DAML_TEMPLATE_STAKING_REWARDS,
    PerformanceBonus: process.env.DAML_TEMPLATE_PERFORMANCE_BONUS,

    // Secondary Market Templates
    LoanListing: process.env.DAML_TEMPLATE_LOAN_LISTING,
    LoanOffer: process.env.DAML_TEMPLATE_LOAN_OFFER,
    SecondaryLoanTransfer: process.env.DAML_TEMPLATE_SECONDARY_LOAN_TRANSFER,
    TransferSettlement: process.env.DAML_TEMPLATE_TRANSFER_SETTLEMENT,
    LoanValuation: process.env.DAML_TEMPLATE_LOAN_VALUATION,
    BorrowerNotification: process.env.DAML_TEMPLATE_BORROWER_NOTIFICATION,

    // Aegis Platform Templates
    AegisPlatform: process.env.DAML_TEMPLATE_AEGIS_PLATFORM,
    AssetBalance: process.env.DAML_TEMPLATE_ASSET_BALANCE,
    LiquiditySupport: process.env.DAML_TEMPLATE_LIQUIDITY_SUPPORT,

    // Audit Log Templates
    PlatformAuditLog: process.env.DAML_TEMPLATE_PLATFORM_AUDIT_LOG,
    LenderAuditLog: process.env.DAML_TEMPLATE_LENDER_AUDIT_LOG,
    BorrowerAuditLog: process.env.DAML_TEMPLATE_BORROWER_AUDIT_LOG,
    LoanAuditTrail: process.env.DAML_TEMPLATE_LOAN_AUDIT_TRAIL,
    PoolAuditLog: process.env.DAML_TEMPLATE_POOL_AUDIT_LOG,
    ComplianceAuditLog: process.env.DAML_TEMPLATE_COMPLIANCE_AUDIT_LOG,
    ActivityMonitor: process.env.DAML_TEMPLATE_ACTIVITY_MONITOR,
    ComplianceAlert: process.env.DAML_TEMPLATE_COMPLIANCE_ALERT,
    PlatformEscalation: process.env.DAML_TEMPLATE_PLATFORM_ESCALATION,
    ComplianceEscalation: process.env.DAML_TEMPLATE_COMPLIANCE_ESCALATION,
  },

  // Smart Contract Choices/Actions
  choices: {
    RFQ: {
      SubmitBid: "SubmitBid",
      AcceptBid: "AcceptBid",
      StartReview: "StartReview",
      CancelRFQ: "CancelRFQ",
      ExtendExpiration: "ExtendExpiration",
      MarkExpired: "MarkExpired",
    },
    Bid: {
      WithdrawBid: "WithdrawBid",
      ModifyBid: "ModifyBid",
      MarkUnderReview: "MarkUnderReview",
      RejectBid: "RejectBid",
    },
    LoanProposal: {
      AcceptLoan: "AcceptLoan",
    },
    Loan: {
      MakePayment: "MakePayment",
      MakeEarlyRepayment: "MakeEarlyRepayment",
      MarkDelinquent: "MarkDelinquent",
      MarkDefault: "MarkDefault",
      RestructureLoan: "RestructureLoan",
    },
    // Credit System Choices
    CreditProfileContract: {
      RecordLoanOrigination: "RecordLoanOrigination",
      RecordRepayment: "RecordRepayment",
      RecordDefault: "RecordDefault",
      RecordDefaultResolution: "RecordDefaultResolution",
      UpdatePrivacyLevel: "UpdatePrivacyLevel",
    },
    RiskAssessment: {
      AcceptAssessment: "AcceptAssessment",
      RejectAssessment: "RejectAssessment",
    },
    PortfolioRisk: {
      UpdatePortfolioRisk: "UpdatePortfolioRisk",
      CheckConcentrationLimits: "CheckConcentrationLimits",
    },
    CreditInquiry: {
      ApproveInquiry: "ApproveInquiry",
      DeclineInquiry: "DeclineInquiry",
    },
    CreditInsurance: {
      FileInsuranceClaim: "FileInsuranceClaim",
      CancelInsurance: "CancelInsurance",
    },
    CreditGuarantee: {
      InvokeGuarantee: "InvokeGuarantee",
    },
    // Syndication Choices
    SyndicatedLoan: {
      MakeSyndicatedPayment: "MakeSyndicatedPayment",
      ProposeSyndicateDecision: "ProposeSyndicateDecision",
      AddSyndicateParticipant: "AddSyndicateParticipant",
      RemoveSyndicateParticipant: "RemoveSyndicateParticipant",
      DistributeArrangementFees: "DistributeArrangementFees",
    },
    SyndicateDecisionVote: {
      VoteFor: "VoteFor",
      VoteAgainst: "VoteAgainst",
      FinalizeVote: "FinalizeVote",
    },
    SyndicateFormation: {
      CommitToSyndicate: "CommitToSyndicate",
      FinalizeSyndicate: "FinalizeSyndicate",
      CancelFormation: "CancelFormation",
    },
    SyndicateReport: {
      AcknowledgeReport: "AcknowledgeReport",
    },
    // Collateral Management Choices
    CollateralPool: {
      UpdateValuation: "UpdateValuation",
      TriggerMarginCall: "TriggerMarginCall",
      RespondToMarginCall: "RespondToMarginCall",
      RequestEmergencySupport: "RequestEmergencySupport",
      InitiateLiquidation: "InitiateLiquidation",
      RequestSubstitution: "RequestSubstitution",
      ReleaseCollateral: "ReleaseCollateral",
      PartialRelease: "PartialRelease",
    },
    SubstitutionRequest: {
      ApproveSubstitution: "ApproveSubstitution",
      RejectSubstitution: "RejectSubstitution",
    },
    CollateralLiquidation: {
      ExecuteLiquidation: "ExecuteLiquidation",
      CancelLiquidation: "CancelLiquidation",
    },
    LiquidationSettlement: {
      AcknowledgeSettlement: "AcknowledgeSettlement",
    },
    // Yield Generation Choices
    LiquidityPool: {
      JoinPool: "JoinPool",
      WithdrawFromPool: "WithdrawFromPool",
      DistributeYield: "DistributeYield",
      ClaimYield: "ClaimYield",
      ReinvestYield: "ReinvestYield",
      DeployLiquidity: "DeployLiquidity",
      ReceiveRepayment: "ReceiveRepayment",
      UpdatePerformanceMetrics: "UpdatePerformanceMetrics",
      RebalancePool: "RebalancePool",
    },
    LPToken: {
      TransferLPToken: "TransferLPToken",
      SplitLPToken: "SplitLPToken",
    },
    YieldOptimizer: {
      OptimizeYield: "OptimizeYield",
      UpdateStrategy: "UpdateStrategy",
      AddManagedPool: "AddManagedPool",
      RemoveManagedPool: "RemoveManagedPool",
    },
    StakingRewards: {
      ClaimStakingRewards: "ClaimStakingRewards",
      Unstake: "Unstake",
      AccrueRewards: "AccrueRewards",
    },
    PerformanceBonus: {
      ClaimBonus: "ClaimBonus",
      MarkDistributed: "MarkDistributed",
    },
    // Aegis Platform Choices
    AegisPlatform: {
      MintToTreasury: "MintToTreasury",
      EmergencyMint: "EmergencyMint",
      BulkMintToTreasury: "BulkMintToTreasury",
      AuthorizeNewAssets: "AuthorizeNewAssets",
      DeauthorizeAssets: "DeauthorizeAssets",
      UpdatePlatformFeeRate: "UpdatePlatformFeeRate",
      ReimburseLender: "ReimburseLender",
      RegisterNewLender: "RegisterNewLender",
      AdminFundLender: "AdminFundLender",
      CollectPlatformFee: "CollectPlatformFee",
      CollectSecondaryMarketFee: "CollectSecondaryMarketFee",
      CollectSyndicationFee: "CollectSyndicationFee",
      RegisterLiquidityPool: "RegisterLiquidityPool",
      CollectPoolManagementFee: "CollectPoolManagementFee",
      ProvidePoolPerformanceBonus: "ProvidePoolPerformanceBonus",
      InjectTreasuryFunds: "InjectTreasuryFunds",
      EmergencyShutdown: "EmergencyShutdown",
      ReactivatePlatform: "ReactivatePlatform",
      ProvideLiquiditySupport: "ProvideLiquiditySupport",
    },
    AssetBalance: {
      ReceiveFunds: "ReceiveFunds",
      LockFunds: "LockFunds",
    },
    LiquiditySupport: {
      RepaySupport: "RepaySupport",
    },
  },

  // Performance & Reliability Configuration
  performance: {
    timeout: parseInt(process.env.DAML_TIMEOUT || "30000"),
    maxRetries: parseInt(process.env.DAML_MAX_RETRIES || "3"),
    retryDelay: parseInt(process.env.DAML_RETRY_DELAY || "1000"),
    connectionPoolSize: parseInt(process.env.DAML_POOL_SIZE || "10"),
    requestConcurrency: parseInt(process.env.DAML_CONCURRENCY || "5"),
  },

  // Business Logic Configuration - loaded from environment
  business: {
    defaultRFQExpiryDays: parseInt(process.env.DEFAULT_RFQ_EXPIRY_DAYS || "7"),
    maxLoanDurationDays: parseInt(process.env.MAX_LOAN_DURATION_DAYS || "365"),
    minCollateralRatio: parseFloat(process.env.MIN_COLLATERAL_RATIO || "1.2"),
    maxInterestRate: parseFloat(process.env.MAX_INTEREST_RATE || "0.25"),
    supportedAssets: process.env.SUPPORTED_ASSETS?.split(",").map((asset) =>
      asset.trim()
    ) || [
      // Cryptocurrencies
      "BTC",
      "ETH",
      // Stablecoins
      "USDC",
      "USDT",
      "DAI",
      // Government Bonds
      "US_TREASURY",
      "UK_GILT",
      // Corporate Bonds
      "CORP_BOND_AAA",
      "CORP_BOND_AA",
      // Equities
      "STOCK_AAPL",
      "STOCK_MSFT",
      "STOCK_GOOGL",
      // Commodities
      "GOLD",
      "SILVER",
      "OIL",
      // Real Estate Tokens
      "RE_TOKEN_NYC",
      "RE_TOKEN_SF",
    ],
  },

  // Security Configuration
  security: {
    requireAuth: process.env.NODE_ENV === "production",
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    rateLimitRequests: parseInt(process.env.RATE_LIMIT || "100"),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15 minutes
  },
};

// Environment-specific configuration - loaded from actual environment
export const ENV_CONFIG = {
  development: {
    logLevel: process.env.LOG_LEVEL || "debug",
    enableMetrics: process.env.ENABLE_METRICS === "true",
    enableTracing: process.env.ENABLE_TRACING === "true",
  },
  production: {
    logLevel: process.env.LOG_LEVEL || "info",
    enableMetrics: process.env.ENABLE_METRICS !== "false",
    enableTracing: process.env.ENABLE_TRACING !== "false",
  },
};

// Configuration validation with detailed error messages
export function validateDamlConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields validation
  const requiredFields = [
    { key: "jsonApiUrl", value: DAML_CONFIG.jsonApiUrl },
    { key: "ledgerId", value: DAML_CONFIG.ledgerId },
    { key: "applicationId", value: DAML_CONFIG.applicationId },
  ];

  requiredFields.forEach((field) => {
    if (!field.value || field.value.trim() === "") {
      errors.push(`Missing required field: ${field.key}`);
    }
  });

  // URL validation
  if (DAML_CONFIG.jsonApiUrl) {
    try {
      new URL(DAML_CONFIG.jsonApiUrl);
    } catch {
      errors.push(`Invalid DAML JSON API URL: ${DAML_CONFIG.jsonApiUrl}`);
    }
  }

  // Template ID validation
  Object.entries(DAML_CONFIG.templates).forEach(([name, templateId]) => {
    if (!templateId) {
      errors.push(`Missing template ID for ${name}`);
    } else if (!templateId.includes(":")) {
      errors.push(`Invalid template ID format for ${name}: ${templateId}`);
    }
  });

  // Performance configuration validation
  if (DAML_CONFIG.performance.timeout < 1000) {
    errors.push("Timeout must be at least 1000ms");
  }

  if (
    DAML_CONFIG.performance.maxRetries < 0 ||
    DAML_CONFIG.performance.maxRetries > 10
  ) {
    errors.push("Max retries must be between 0 and 10");
  }

  // Business logic validation
  if (DAML_CONFIG.business.minCollateralRatio < 1.0) {
    errors.push("Minimum collateral ratio must be at least 100%");
  }

  if (DAML_CONFIG.business.maxInterestRate > 1.0) {
    errors.push("Maximum interest rate cannot exceed 100%");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Get current environment configuration
export function getEnvConfig() {
  const env = process.env.NODE_ENV || "development";
  return ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development;
}

// Helper to get template ID by name
export function getTemplateId(
  templateName: keyof typeof DAML_CONFIG.templates
): string {
  const templateId = DAML_CONFIG.templates[templateName];
  if (!templateId) {
    throw new Error(`Unknown template: ${templateName}`);
  }
  return templateId;
}

// Helper to validate business rules
export function validateBusinessRules(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate supported assets
  if (
    data.collateralAsset &&
    !DAML_CONFIG.business.supportedAssets.includes(data.collateralAsset)
  ) {
    errors.push(
      `Unsupported collateral asset: ${
        data.collateralAsset
      }. Supported: ${DAML_CONFIG.business.supportedAssets.join(", ")}`
    );
  }

  // Validate collateral ratio
  if (data.loanAmount && data.collateralAmount) {
    const ratio =
      parseFloat(data.collateralAmount) / parseFloat(data.loanAmount);
    if (ratio < DAML_CONFIG.business.minCollateralRatio) {
      errors.push(
        `Insufficient collateral ratio: ${ratio.toFixed(
          2
        )}. Minimum required: ${DAML_CONFIG.business.minCollateralRatio}`
      );
    }
  }

  // Validate interest rate
  if (
    data.interestRate &&
    parseFloat(data.interestRate) > DAML_CONFIG.business.maxInterestRate
  ) {
    errors.push(
      `Interest rate too high: ${(parseFloat(data.interestRate) * 100).toFixed(
        2
      )}%. Maximum allowed: ${(
        DAML_CONFIG.business.maxInterestRate * 100
      ).toFixed(2)}%`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
