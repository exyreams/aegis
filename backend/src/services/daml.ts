/**
 * DAML Integration Service
 *
 * Core DAML ledger integration service providing contract operations, choice execution,
 * and query capabilities with connection pooling, error handling, and business rule
 * validation for privacy-preserving institutional lending workflows.
 */

import {
  DAML_CONFIG,
  getTemplateId,
  validateBusinessRules,
} from "../config/daml";
import { ConsoleLogger } from "../utils/logger";
import {
  convertAppTokenToDamlToken,
  createSystemToken,
} from "../utils/daml-token";

export interface DamlResponse<T = any> {
  result?: T;
  status: number;
  errors?: string[];
  metadata?: {
    duration: number;
    timestamp: string;
    requestId: string;
  };
}

export interface DamlContract<T = any> {
  contractId: string;
  templateId: string;
  key?: any;
  payload: T;
  signatories: string[];
  observers: string[];
  agreementText: string;
}

export interface CreateContractRequest {
  templateId: string;
  payload: any;
  meta?: {
    requestId?: string;
    timeout?: number;
  };
}

export interface QueryContractsRequest {
  templateIds: string[];
  query?: any;
  meta?: {
    requestId?: string;
    limit?: number;
    offset?: number;
  };
}

export interface ExerciseChoiceRequest {
  templateId: string;
  contractId: string;
  choice: string;
  argument: any;
  meta?: {
    requestId?: string;
    timeout?: number;
  };
}

export interface CollateralAsset {
  assetId: string;
  assetType: {
    tag: string;
    value: string;
  };
  quantity: number;
  currentValue: number;
  initialValue: number;
  volatilityScore: number;
  liquidityRating: string;
  lastValuationTime: string;
  valuationSource: string;
  haircut: number;
}

export interface LenderCriteria {
  categories: string[];
  minimumRating: string;
  geographicRestrictions: string[];
  maximumBids: number;
  requiredCapacity: number;
  preferredLenders: string[];
}

export interface PrivacySettings {
  visibilityMode: string;
  allowSecondaryMarket: boolean;
  dataRetentionDays: number;
  anonymizeBorrower: boolean;
  restrictedDataFields: string[];
}

export interface CollateralRequirements {
  minimumRatio: number;
  maintenanceRatio: number;
  liquidationRatio: number;
  acceptedAssetTypes: any[];
  maximumConcentration: number;
}

export interface RFQData {
  rfqId: string;
  borrower: string;
  loanAmount: string;
  collateralAssets: CollateralAsset[];
  loanDuration: { microseconds: string };
  loanPurpose: string;
  lenderCriteria: LenderCriteria;
  privacySettings: PrivacySettings;
  collateralRequirements: CollateralRequirements;
  status: string;
  createdAt: string;
  expiresAt: string;
  currentBidCount: number;
  acceptedBidId?: string;
}

export interface BidData {
  rfqId: any; // (Party, Text) tuple from DAML - can be object, array, or string
  bidId: string;
  lender: string;
  borrower: string;
  loanAmount: string;
  interestRate: string;
  paymentFrequency?: string;
  additionalTerms: string;
  status?: string;
  submittedAt?: string;
}

interface DamlSubmitBid {
  lender: string;
  lenderProfile: {
    lender: string;
    category: string;
    rating: string;
    totalCapacity: string;
    availableCapacity: string;
    activeLoans: number;
    defaultRate: string;
    averageInterestRate: string;
    geographicFocus: string[];
  };
  interestRateStructure: {
    rateType: string;
    baseRate: null;
    margin: string;
    fixedRate: string;
    floorRate: null;
    capRate: null;
    resetFrequency: null;
  };
  repaymentSchedule: {
    frequency: { tag: string; value: {} };
    numberOfPayments: number;
    gracePeriodDays: number;
    lateFeeRate: string;
    earlyRepaymentTerms: {
      allowed: boolean;
      penaltyRate: string;
      noticePeriodDays: number;
      minimumHoldPeriod: null;
    };
    amortizationType: string;
  };
  proposedCovenants: any[];
  additionalTerms: string;
}

export class DamlService {
  private static instance: DamlService;
  private baseUrl: string;
  private requestCounter: number = 0;
  private connectionPool: Map<string, any> = new Map();

  constructor() {
    if (!DAML_CONFIG.jsonApiUrl) {
      throw new Error("DAML_JSON_API_URL environment variable is required");
    }

    this.baseUrl = DAML_CONFIG.jsonApiUrl;
    this.initializeConnectionPool();
  }

  static getInstance(): DamlService {
    if (!DamlService.instance) {
      DamlService.instance = new DamlService();
    }
    return DamlService.instance;
  }

  private initializeConnectionPool() {
    ConsoleLogger.info(
      `Initializing DAML connection pool (size: ${DAML_CONFIG.performance.connectionPoolSize})`
    );

    this.testConnection();
  }

  private async testConnection() {
    try {
      const response = await fetch(`${DAML_CONFIG.jsonApiUrl}/v1/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer dummy-token-for-test",
        },
        body: JSON.stringify({
          templateIds: [],
        }),
      });

      if (response.status === 401) {
        ConsoleLogger.success("DAML JSON API connection established");
      } else if (response.ok) {
        ConsoleLogger.success("DAML JSON API connection established");
      } else {
        ConsoleLogger.warning(
          `DAML JSON API responded with status: ${response.status}`
        );
      }
    } catch (error) {
      ConsoleLogger.error("Failed to connect to DAML JSON API", {
        url: DAML_CONFIG.jsonApiUrl,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestCounter}`;
  }

  private async makeRequestWithRetry<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any,
    headers: Record<string, string> = {},
    requestId?: string
  ): Promise<DamlResponse<T>> {
    const id = requestId || this.generateRequestId();
    let lastError: Error | null = null;

    for (
      let attempt = 1;
      attempt <= DAML_CONFIG.performance.maxRetries;
      attempt++
    ) {
      try {
        const result = await this.makeRequest<T>(
          endpoint,
          method,
          body,
          headers,
          id
        );

        if (result.status < 500) {
          return result;
        }

        if (attempt === DAML_CONFIG.performance.maxRetries) {
          return result;
        }

        ConsoleLogger.warning(
          `Request ${id} failed (attempt ${attempt}/${DAML_CONFIG.performance.maxRetries}), retrying...`
        );
        await this.delay(DAML_CONFIG.performance.retryDelay * attempt);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        if (attempt === DAML_CONFIG.performance.maxRetries) {
          ConsoleLogger.error(
            `Request ${id} failed after ${attempt} attempts`,
            lastError
          );
          return {
            status: 500,
            errors: [lastError.message],
            metadata: {
              duration: 0,
              timestamp: new Date().toISOString(),
              requestId: id,
            },
          };
        }

        ConsoleLogger.warning(
          `Request ${id} error (attempt ${attempt}/${DAML_CONFIG.performance.maxRetries}): ${lastError.message}`
        );
        await this.delay(DAML_CONFIG.performance.retryDelay * attempt);
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }

  public async makeRequest<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any,
    headers: Record<string, string> = {},
    requestId?: string
  ): Promise<DamlResponse<T>> {
    const startTime = Date.now();
    const id = requestId || this.generateRequestId();
    const url = `${this.baseUrl}/${endpoint.replace(/^\//, "")}`;

    try {
      const requestHeaders = {
        "Content-Type": "application/json",
        "X-Request-ID": id,
        ...headers,
      };

      ConsoleLogger.info(`DAML Request ${id}: ${method} ${endpoint}`);

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(DAML_CONFIG.performance.timeout),
      });

      const responseData = await response.text();
      const duration = Date.now() - startTime;

      ConsoleLogger.damlProxy(method, endpoint, url, response.status);

      let parsedData: any;
      try {
        parsedData = JSON.parse(responseData);
      } catch {
        parsedData = responseData;
      }

      const result: DamlResponse<T> = {
        status: response.status,
        metadata: {
          duration,
          timestamp: new Date().toISOString(),
          requestId: id,
        },
      };

      if (response.ok) {
        ConsoleLogger.success(`DAML ${method} ${endpoint} completed`, {
          requestId: id,
          duration: `${duration}ms`,
          status: response.status,
        });
        result.result = parsedData.result || parsedData;
      } else {
        ConsoleLogger.error(`DAML ${method} ${endpoint} failed`, {
          requestId: id,
          status: response.status,
          errors: parsedData.errors || [parsedData.message || "Unknown error"],
          duration: `${duration}ms`,
        });
        result.errors = parsedData.errors || [
          parsedData.message || "Unknown error",
        ];
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      ConsoleLogger.error(`DAML ${method} ${endpoint} - Network Error`, {
        requestId: id,
        error: errorMessage,
        duration: `${duration}ms`,
      });

      return {
        status: 500,
        errors: [errorMessage],
        metadata: {
          duration,
          timestamp: new Date().toISOString(),
          requestId: id,
        },
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getParties(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any[]>> {
    const damlToken =
      convertAppTokenToDamlToken(authToken, user) || createSystemToken();

    return this.makeRequestWithRetry("v1/parties", "GET", undefined, {
      Authorization: `Bearer ${damlToken}`,
    });
  }

  async queryContracts<T>(
    request: QueryContractsRequest,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<T>[]>> {
    let damlToken: string;
    if (authToken.startsWith("Bearer ")) {
      damlToken = authToken.substring(7);
    } else {
      damlToken =
        convertAppTokenToDamlToken(authToken, user) || createSystemToken();
    }

    return this.makeRequestWithRetry(
      "v1/query",
      "POST",
      request,
      {
        Authorization: `Bearer ${damlToken}`,
      },
      request.meta?.requestId
    );
  }

  async createContract<T>(
    request: CreateContractRequest,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<T>>> {
    const validation = validateBusinessRules(request.payload);
    if (!validation.valid) {
      return {
        status: 400,
        errors: validation.errors,
        metadata: {
          duration: 0,
          timestamp: new Date().toISOString(),
          requestId: request.meta?.requestId || this.generateRequestId(),
        },
      };
    }

    let damlToken: string;
    if (authToken.startsWith("Bearer ")) {
      damlToken = authToken.substring(7);
    } else {
      damlToken =
        convertAppTokenToDamlToken(authToken, user) || createSystemToken();
    }

    return this.makeRequestWithRetry(
      "v1/create",
      "POST",
      request,
      {
        Authorization: `Bearer ${damlToken}`,
      },
      request.meta?.requestId
    );
  }

  async exerciseChoice<T>(
    request: ExerciseChoiceRequest,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<T>> {
    let damlToken: string;
    if (authToken.startsWith("Bearer ")) {
      damlToken = authToken.substring(7);
    } else {
      damlToken =
        convertAppTokenToDamlToken(authToken, user) || createSystemToken();
    }

    return this.makeRequestWithRetry(
      "v1/exercise",
      "POST",
      request,
      {
        Authorization: `Bearer ${damlToken}`,
      },
      request.meta?.requestId
    );
  }

  async getRFQs(
    authToken: string
  ): Promise<DamlResponse<DamlContract<RFQData>[]>> {
    return this.queryContracts(
      {
        templateIds: [getTemplateId("RFQ")],
      },
      authToken
    );
  }

  async getBids(authToken: string): Promise<DamlResponse<DamlContract<any>[]>> {
    return this.queryContracts(
      {
        templateIds: [getTemplateId("Bid")],
      },
      authToken
    );
  }

  async getLoans(
    authToken: string
  ): Promise<DamlResponse<DamlContract<any>[]>> {
    return this.queryContracts(
      {
        templateIds: [getTemplateId("Loan")],
      },
      authToken
    );
  }

  async getLoanProposals(
    authToken: string
  ): Promise<DamlResponse<DamlContract<any>[]>> {
    return this.queryContracts(
      {
        templateIds: [getTemplateId("LoanProposal")],
      },
      authToken
    );
  }

  async createRFQ(
    rfqData: RFQData,
    authToken: string
  ): Promise<DamlResponse<DamlContract<RFQData>>> {
    return this.createContract(
      {
        templateId: getTemplateId("RFQ"),
        payload: rfqData,
      },
      authToken
    );
  }

  async submitBid(
    rfqContractId: string,
    bidData: BidData,
    authToken: string,
    lenderProfile?: {
      category?: string;
      rating?: string;
      totalCapacity?: string;
      availableCapacity?: string;
      activeLoans?: number;
      defaultRate?: string;
      geographicFocus?: string[];
    }
  ): Promise<DamlResponse<any>> {
    const damlBidData: DamlSubmitBid = {
      lender: bidData.lender,
      lenderProfile: {
        lender: bidData.lender,
        category: lenderProfile?.category || "InvestmentFund",
        rating: lenderProfile?.rating || "BBB", // This should now always be provided
        totalCapacity: lenderProfile?.totalCapacity || "1000000.0",
        availableCapacity: lenderProfile?.availableCapacity || "500000.0",
        activeLoans: lenderProfile?.activeLoans || 0,
        defaultRate: lenderProfile?.defaultRate || "0.02",
        averageInterestRate: bidData.interestRate,
        geographicFocus: lenderProfile?.geographicFocus || ["Global"],
      },
      interestRateStructure: {
        rateType: "Fixed",
        baseRate: null,
        margin: "0.0",
        fixedRate: bidData.interestRate,
        floorRate: null,
        capRate: null,
        resetFrequency: null,
      },
      repaymentSchedule: {
        frequency: { tag: bidData.paymentFrequency || "Monthly", value: {} },
        numberOfPayments: 12,
        gracePeriodDays: 5,
        lateFeeRate: "0.05",
        earlyRepaymentTerms: {
          allowed: false,
          penaltyRate: "0.02",
          noticePeriodDays: 30,
          minimumHoldPeriod: null,
        },
        amortizationType: "FullyAmortizing",
      },
      proposedCovenants: [],
      additionalTerms: bidData.additionalTerms,
    };

    return this.exerciseChoice(
      {
        templateId: getTemplateId("RFQ"),
        contractId: rfqContractId,
        choice: DAML_CONFIG.choices.RFQ.SubmitBid,
        argument: damlBidData,
      },
      authToken
    );
  }

  async acceptBid(
    rfqContractId: string,
    bidContractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.exerciseChoice(
      {
        templateId: getTemplateId("RFQ"),
        contractId: rfqContractId,
        choice: DAML_CONFIG.choices.RFQ.AcceptBid,
        argument: { bidCid: bidContractId },
      },
      authToken
    );
  }

  async acceptLoan(
    proposalContractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.exerciseChoice(
      {
        templateId: getTemplateId("LoanProposal"),
        contractId: proposalContractId,
        choice: DAML_CONFIG.choices.LoanProposal.AcceptLoan,
        argument: {},
      },
      authToken
    );
  }

  async repayLoan(
    loanContractId: string,
    paymentAmount: string,
    principalPortion: string,
    interestPortion: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.exerciseChoice(
      {
        templateId: getTemplateId("Loan"),
        contractId: loanContractId,
        choice: DAML_CONFIG.choices.Loan.MakePayment,
        argument: { paymentAmount, principalPortion, interestPortion },
      },
      authToken
    );
  }

  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}/v1/parties`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      const duration = Date.now() - startTime;
      const healthy = response.status === 401 || response.status === 200;

      return {
        healthy,
        details: {
          status: response.status,
          duration: `${duration}ms`,
          url: this.baseUrl,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          url: this.baseUrl,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  getMetrics() {
    return {
      requestCount: this.requestCounter,
      connectionPoolSize: this.connectionPool.size,
      config: {
        timeout: DAML_CONFIG.performance.timeout,
        maxRetries: DAML_CONFIG.performance.maxRetries,
        retryDelay: DAML_CONFIG.performance.retryDelay,
      },
    };
  }

  // AEGIS PLATFORM METHODS

  async getAegisPlatform(
    authToken: string
  ): Promise<DamlResponse<DamlContract<any>[]>> {
    const templateId = getTemplateId("AegisPlatform");
    if (!templateId) {
      return {
        status: 500,
        errors: ["AegisPlatform template ID not configured"],
        metadata: {
          duration: 0,
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        },
      };
    }
    return this.queryContracts(
      {
        templateIds: [templateId],
      },
      authToken
    );
  }

  async getAssetBalances(
    authToken: string,
    owner?: string
  ): Promise<DamlResponse<DamlContract<any>[]>> {
    const query: any = {
      templateIds: [getTemplateId("AssetBalance")],
    };

    if (owner) {
      query.query = { owner };
    }

    return this.queryContracts(query, authToken);
  }

  async getLiquiditySupport(
    authToken: string,
    lender?: string
  ): Promise<DamlResponse<DamlContract<any>[]>> {
    const query: any = {
      templateIds: [getTemplateId("LiquiditySupport")],
    };

    if (lender) {
      query.query = { lender };
    }

    return this.queryContracts(query, authToken);
  }

  async mintToTreasury(
    platformContractId: string,
    assetType: any,
    mintAmount: string,
    mintReason: string,
    authorizedBy: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform"),
        contractId: platformContractId,
        choice: DAML_CONFIG.choices.AegisPlatform.MintToTreasury,
        argument: {
          assetType,
          mintAmount,
          mintReason,
          authorizedBy,
        },
      },
      authToken
    );
  }

  async bulkMintToTreasury(
    platformContractId: string,
    mintingPlan: Array<[any, string]>,
    bulkReason: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform"),
        contractId: platformContractId,
        choice: DAML_CONFIG.choices.AegisPlatform.BulkMintToTreasury,
        argument: {
          mintingPlan,
          bulkReason,
        },
      },
      authToken
    );
  }

  async registerNewLender(
    platformContractId: string,
    newLender: string,
    assetType: any,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform"),
        contractId: platformContractId,
        choice: DAML_CONFIG.choices.AegisPlatform.RegisterNewLender,
        argument: {
          newLender,
          assetType,
        },
      },
      authToken
    );
  }

  async adminFundLender(
    platformContractId: string,
    lender: string,
    assetType: any,
    fundingAmount: string,
    fundingReason: string,
    adminApproval: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform"),
        contractId: platformContractId,
        choice: DAML_CONFIG.choices.AegisPlatform.AdminFundLender,
        argument: {
          lender,
          assetType,
          fundingAmount,
          fundingReason,
          adminApproval,
        },
      },
      authToken
    );
  }

  async reimburseLender(
    platformContractId: string,
    lender: string,
    assetType: any,
    amount: string,
    reimbursementReason: string,
    approvedBy: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform"),
        contractId: platformContractId,
        choice: DAML_CONFIG.choices.AegisPlatform.ReimburseLender,
        argument: {
          lender,
          assetType,
          amount,
          reimbursementReason,
          approvedBy,
        },
      },
      authToken
    );
  }

  async provideLiquiditySupport(
    platformContractId: string,
    lender: string,
    assetType: any,
    supportAmount: string,
    supportReason: string,
    repaymentTerms: any,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform"),
        contractId: platformContractId,
        choice: DAML_CONFIG.choices.AegisPlatform.ProvideLiquiditySupport,
        argument: {
          lender,
          assetType,
          supportAmount,
          supportReason,
          repaymentTerms,
        },
      },
      authToken
    );
  }

  async repayLiquiditySupport(
    supportContractId: string,
    repaymentAmount: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.exerciseChoice(
      {
        templateId: getTemplateId("LiquiditySupport"),
        contractId: supportContractId,
        choice: DAML_CONFIG.choices.LiquiditySupport.RepaySupport,
        argument: {
          repaymentAmount,
        },
      },
      authToken
    );
  }

  async receiveFunds(
    balanceContractId: string,
    amount: string,
    sender: string,
    receiptReason: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.exerciseChoice(
      {
        templateId: getTemplateId("AssetBalance"),
        contractId: balanceContractId,
        choice: DAML_CONFIG.choices.AssetBalance.ReceiveFunds,
        argument: {
          amount,
          sender,
          receiptReason,
        },
      },
      authToken
    );
  }

  async lockFunds(
    balanceContractId: string,
    amount: string,
    purpose: string,
    lockDuration: any,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.exerciseChoice(
      {
        templateId: getTemplateId("AssetBalance"),
        contractId: balanceContractId,
        choice: DAML_CONFIG.choices.AssetBalance.LockFunds,
        argument: {
          amount,
          purpose,
          lockDuration,
        },
      },
      authToken
    );
  }
}
