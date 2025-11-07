/**
 * Credit Management Service
 *
 * Advanced credit scoring and risk assessment with DAML integration including
 * credit profile management, risk rating calculations, borrowing history tracking,
 * and automated credit limit adjustments based on performance metrics.
 */

import { DamlService, DamlResponse, DamlContract } from "./daml";
import { getTemplateId, DAML_CONFIG } from "../config/daml";
import { ConsoleLogger } from "../utils/logger";

export interface CreditProfileData {
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
  defaultHistory: DefaultEvent[];
  lastUpdated: string;
  privacyLevel: string;
}

export interface DefaultEvent {
  loanId: string;
  defaultDate: string;
  amountInDefault: string;
  resolutionDate?: string;
  recoveryAmount?: string;
}

export interface RiskAssessmentData {
  assessmentId: string;
  borrower: string;
  lender: string;
  loanAmount: string;
  loanDuration: { microseconds: string };
  collateralAssets: CollateralAsset[];
  borrowerCreditProfile: CreditProfile;
  assessmentDate: string;
  riskMetrics: RiskMetrics;
  recommendedRate: string;
  riskAdjustedRate: string;
  approvalRecommendation: string;
}

export interface CollateralAsset {
  assetId: string;
  assetType: string;
  quantity: string;
  unitValue: string;
  currentValue: string;
  haircut: string;
  lastValuationTime: string;
  valuationSource: string;
}

export interface CreditProfile {
  party: string;
  creditScore: number;
  riskRating: string;
  totalBorrowed: string;
  totalRepaid: string;
  currentOutstanding: string;
  numberOfLoans: number;
  numberOfDefaults: number;
  averageRepaymentTime: string;
  longestDelayDays: number;
  lastUpdated: string;
}

export interface RiskMetrics {
  creditRisk: string;
  marketRisk: string;
  liquidityRisk: string;
  concentrationRisk: string;
  overallRisk: string;
}

export interface PortfolioRiskData {
  portfolioId: string;
  lender: string;
  activeLoans: number;
  totalExposure: string;
  averageLTV: string;
  concentrationByBorrower: Array<[string, string]>;
  concentrationByAssetType: Array<[string, string]>;
  portfolioRiskMetrics: RiskMetrics;
  lastAssessmentDate: string;
}

export interface CreditInquiryData {
  inquiryId: string;
  borrower: string;
  lender: string;
  purpose: string;
  requestedAt: string;
  status: string;
  sharedInformation?: CreditProfile;
}

export class CreditService {
  private damlService: DamlService;

  constructor() {
    this.damlService = DamlService.getInstance();
  }

  async getCreditProfiles(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<CreditProfileData>[]>> {
    ConsoleLogger.info("Fetching credit profiles");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("CreditProfileContract")],
      },
      authToken,
      user
    );
  }

  async getCreditProfileByParty(
    party: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<CreditProfileData> | null>> {
    ConsoleLogger.info(`Fetching credit profile for party: ${party}`);

    const result = await this.damlService.queryContracts<CreditProfileData>(
      {
        templateIds: [getTemplateId("CreditProfileContract")],
      },
      authToken,
      user
    );

    if (result.status === 200 && result.result) {
      const profile = result.result.find((c) => c.payload.party === party);
      return {
        ...result,
        result: profile || null,
      };
    }

    return result as any;
  }

  async createCreditProfile(
    profileData: CreditProfileData,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<CreditProfileData>>> {
    ConsoleLogger.info(
      `Creating credit profile for party: ${profileData.party}`
    );

    return this.damlService.createContract(
      {
        templateId: getTemplateId("CreditProfileContract"),
        payload: profileData,
      },
      authToken,
      user
    );
  }

  async recordLoanOrigination(
    contractId: string,
    loanId: string,
    loanAmount: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Recording loan origination: ${loanId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CreditProfileContract"),
        contractId,
        choice: DAML_CONFIG.choices.CreditProfileContract.RecordLoanOrigination,
        argument: {
          loanId,
          loanAmount,
        },
      },
      authToken,
      user
    );
  }

  async recordRepayment(
    contractId: string,
    loanId: string,
    repaymentAmount: string,
    daysToRepay: number,
    wasOnTime: boolean,
    authToken: string
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Recording repayment for loan: ${loanId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CreditProfileContract"),
        contractId,
        choice: DAML_CONFIG.choices.CreditProfileContract.RecordRepayment,
        argument: {
          loanId,
          repaymentAmount,
          daysToRepay,
          wasOnTime,
        },
      },
      authToken
    );
  }

  async recordDefault(
    contractId: string,
    loanId: string,
    defaultAmount: string,
    defaultDate: string,
    lender: string,
    platformCid: string | undefined,
    assetType: any,
    authToken: string
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Recording default for loan: ${loanId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CreditProfileContract"),
        contractId,
        choice: DAML_CONFIG.choices.CreditProfileContract.RecordDefault,
        argument: {
          loanId,
          defaultAmount,
          defaultDate,
          lender,
          platformCid: platformCid
            ? { tag: "Some", value: platformCid }
            : { tag: "None" },
          assetType,
        },
      },
      authToken
    );
  }

  async recordDefaultResolution(
    contractId: string,
    loanId: string,
    resolutionDate: string,
    recoveryAmount: string,
    authToken: string
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Recording default resolution for loan: ${loanId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CreditProfileContract"),
        contractId,
        choice:
          DAML_CONFIG.choices.CreditProfileContract.RecordDefaultResolution,
        argument: {
          loanId,
          resolutionDate,
          recoveryAmount,
        },
      },
      authToken
    );
  }

  async updatePrivacyLevel(
    contractId: string,
    newPrivacyLevel: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Updating privacy level: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CreditProfileContract"),
        contractId,
        choice: DAML_CONFIG.choices.CreditProfileContract.UpdatePrivacyLevel,
        argument: {
          newPrivacyLevel,
        },
      },
      authToken,
      user
    );
  }

  async getRiskAssessments(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<RiskAssessmentData>[]>> {
    ConsoleLogger.info("Fetching risk assessments");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("RiskAssessment")],
      },
      authToken,
      user
    );
  }

  async createRiskAssessment(
    assessmentData: RiskAssessmentData,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<RiskAssessmentData>>> {
    ConsoleLogger.info(
      `Creating risk assessment: ${assessmentData.assessmentId}`
    );

    return this.damlService.createContract(
      {
        templateId: getTemplateId("RiskAssessment"),
        payload: assessmentData,
      },
      authToken,
      user
    );
  }

  async acceptAssessment(
    contractId: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Accepting risk assessment: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("RiskAssessment"),
        contractId,
        choice: DAML_CONFIG.choices.RiskAssessment.AcceptAssessment,
        argument: {},
      },
      authToken,
      user
    );
  }

  async rejectAssessment(
    contractId: string,
    rejectionReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Rejecting risk assessment: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("RiskAssessment"),
        contractId,
        choice: DAML_CONFIG.choices.RiskAssessment.RejectAssessment,
        argument: {
          rejectionReason,
        },
      },
      authToken,
      user
    );
  }

  async getPortfolioRisks(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<PortfolioRiskData>[]>> {
    ConsoleLogger.info("Fetching portfolio risks");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("PortfolioRisk")],
      },
      authToken,
      user
    );
  }

  async createPortfolioRisk(
    portfolioData: PortfolioRiskData,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<PortfolioRiskData>>> {
    ConsoleLogger.info(`Creating portfolio risk: ${portfolioData.portfolioId}`);

    return this.damlService.createContract(
      {
        templateId: getTemplateId("PortfolioRisk"),
        payload: portfolioData,
      },
      authToken,
      user
    );
  }

  async updatePortfolioRisk(
    contractId: string,
    newActiveLoans: number,
    newTotalExposure: string,
    newAverageLTV: string,
    newConcentrationByBorrower: Array<[string, string]>,
    newConcentrationByAssetType: Array<[string, string]>,
    newRiskMetrics: RiskMetrics,
    authToken: string
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Updating portfolio risk: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("PortfolioRisk"),
        contractId,
        choice: DAML_CONFIG.choices.PortfolioRisk.UpdatePortfolioRisk,
        argument: {
          newActiveLoans,
          newTotalExposure,
          newAverageLTV,
          newConcentrationByBorrower,
          newConcentrationByAssetType,
          newRiskMetrics,
        },
      },
      authToken
    );
  }

  async checkConcentrationLimits(
    contractId: string,
    maxBorrowerConcentration: string,
    maxAssetTypeConcentration: string,
    authToken: string
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Checking concentration limits: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("PortfolioRisk"),
        contractId,
        choice: DAML_CONFIG.choices.PortfolioRisk.CheckConcentrationLimits,
        argument: {
          maxBorrowerConcentration,
          maxAssetTypeConcentration,
        },
      },
      authToken
    );
  }

  // Insurance methods
  async getInsurancePolicies(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract[]>> {
    ConsoleLogger.info("Fetching insurance policies");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("CreditInsurance")],
      },
      authToken,
      user
    );
  }

  async createInsurancePolicy(
    policyData: any,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract>> {
    ConsoleLogger.info(`Creating insurance policy: ${policyData.policyId}`);

    return this.damlService.createContract(
      {
        templateId: getTemplateId("CreditInsurance"),
        payload: policyData,
      },
      authToken,
      user
    );
  }

  async fileInsuranceClaim(
    contractId: string,
    defaultAmount: string,
    claimDate: string,
    claimEvidence: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Filing insurance claim: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CreditInsurance"),
        contractId,
        choice: DAML_CONFIG.choices.CreditInsurance.FileInsuranceClaim,
        argument: {
          defaultAmount,
          claimDate,
          claimEvidence,
        },
      },
      authToken,
      user
    );
  }

  async cancelInsurance(
    contractId: string,
    cancellationReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Cancelling insurance: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CreditInsurance"),
        contractId,
        choice: DAML_CONFIG.choices.CreditInsurance.CancelInsurance,
        argument: {
          cancellationReason,
        },
      },
      authToken,
      user
    );
  }

  // Guarantee methods
  async getGuarantees(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract[]>> {
    ConsoleLogger.info("Fetching guarantees");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("CreditGuarantee")],
      },
      authToken,
      user
    );
  }

  async createGuarantee(
    guaranteeData: any,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract>> {
    ConsoleLogger.info(`Creating guarantee: ${guaranteeData.guaranteeId}`);

    return this.damlService.createContract(
      {
        templateId: getTemplateId("CreditGuarantee"),
        payload: guaranteeData,
      },
      authToken,
      user
    );
  }

  async invokeGuarantee(
    contractId: string,
    loanId: string,
    defaultAmount: string,
    invokeDate: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Invoking guarantee: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CreditGuarantee"),
        contractId,
        choice: DAML_CONFIG.choices.CreditGuarantee.InvokeGuarantee,
        argument: {
          loanId,
          defaultAmount,
          invokeDate,
        },
      },
      authToken,
      user
    );
  }

  // Inquiry methods
  async getInquiries(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<CreditInquiryData>[]>> {
    ConsoleLogger.info("Fetching credit inquiries");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("CreditInquiry")],
      },
      authToken,
      user
    );
  }

  async createInquiry(
    inquiryData: CreditInquiryData,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<CreditInquiryData>>> {
    ConsoleLogger.info(`Creating credit inquiry: ${inquiryData.inquiryId}`);

    return this.damlService.createContract(
      {
        templateId: getTemplateId("CreditInquiry"),
        payload: inquiryData,
      },
      authToken,
      user
    );
  }

  async approveInquiry(
    contractId: string,
    creditProfile: CreditProfile,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Approving credit inquiry: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CreditInquiry"),
        contractId,
        choice: DAML_CONFIG.choices.CreditInquiry.ApproveInquiry,
        argument: {
          creditProfile,
        },
      },
      authToken,
      user
    );
  }

  async declineInquiry(
    contractId: string,
    reason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Declining credit inquiry: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CreditInquiry"),
        contractId,
        choice: DAML_CONFIG.choices.CreditInquiry.DeclineInquiry,
        argument: {
          reason,
        },
      },
      authToken,
      user
    );
  }

  calculateRiskAdjustedRate(
    creditScore: number,
    baseRate: number,
    numberOfDefaults: number
  ): number {
    let adjustment = 0;

    if (creditScore >= 750) adjustment -= 0.01;
    else if (creditScore >= 670) adjustment += 0.0;
    else if (creditScore >= 580) adjustment += 0.02;
    else adjustment += 0.05;

    adjustment += numberOfDefaults * 0.02;

    return Math.max(0.01, baseRate + adjustment);
  }

  generateApprovalRecommendation(
    creditScore: number,
    numberOfDefaults: number,
    numberOfLoans: number
  ): string {
    const defaultRate =
      numberOfLoans > 0 ? numberOfDefaults / numberOfLoans : 0;

    if (creditScore >= 750 && defaultRate === 0) {
      return "StronglyApprove";
    } else if (creditScore >= 670 && defaultRate < 0.1) {
      return "Approve";
    } else if (creditScore >= 580 && defaultRate < 0.2) {
      return "ApproveWithConditions";
    } else if (creditScore >= 500) {
      return "ReviewRequired";
    } else {
      return "Decline";
    }
  }
}
