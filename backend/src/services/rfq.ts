/**
 * RFQ Service
 *
 * Request for Quote management with DAML integration including
 * RFQ creation, bid submission, loan proposals, and active loan management.
 */

import { DamlService, DamlResponse, DamlContract } from "./daml";
import { getTemplateId } from "../config/daml";
import { ConsoleLogger } from "../utils/logger";

export interface RFQData {
  borrower: string;
  rfqId: string;
  loanAmount: string;
  collateralAssets: any[];
  loanDuration: { microseconds: string };
  loanPurpose: string;
  lenderCriteria: any;
  privacySettings: any;
  collateralRequirements: any;
  status: string;
  createdAt: string;
  expiresAt: string;
  currentBidCount: number;
  acceptedBidId?: string;
}

export interface BidData {
  rfqId: [string, string];
  bidId: string;
  lender: string;
  lenderProfile: any;
  borrower: string;
  loanAmount: string;
  collateralAssets: any[];
  loanDuration: { microseconds: string };
  interestRateStructure: any;
  repaymentSchedule: any;
  proposedCovenants: any[];
  additionalTerms: string;
  status: string;
  submittedAt: string;
}

export interface LoanProposalData {
  borrower: string;
  lender: string;
  lenderProfile: any;
  principal: string;
  collateralAssets: any[];
  loanDuration: { microseconds: string };
  interestRateStructure: any;
  repaymentSchedule: any;
  covenants: any[];
  additionalTerms: string;
  privacySettings: any;
  proposedAt: string;
  status: string;
}

export interface LoanData {
  loanId: string;
  borrower: string;
  lenders: string[];
  principal: string;
  outstandingPrincipal: string;
  interestRateStructure: any;
  repaymentSchedule: any;
  collateralAssets: any[];
  covenants: any[];
  startDate: string;
  maturityDate: string;
  status: string;
  paymentHistory: any[];
  lastPaymentDate?: string;
}

export class RFQService {
  private static instance: RFQService;
  private damlService: DamlService;

  private constructor() {
    this.damlService = DamlService.getInstance();
  }

  public static getInstance(): RFQService {
    if (!RFQService.instance) {
      RFQService.instance = new RFQService();
    }
    return RFQService.instance;
  }

  // RFQ QUERIES

  async queryRFQs(
    authToken: string
  ): Promise<DamlResponse<DamlContract<RFQData>[]>> {
    ConsoleLogger.info("Fetching RFQs");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("RFQ" as any)],
      },
      authToken
    );
  }

  async createRFQ(
    rfqData: RFQData,
    authToken: string
  ): Promise<DamlResponse<DamlContract<RFQData>>> {
    ConsoleLogger.info(`Creating RFQ: ${rfqData.rfqId}`);
    return this.damlService.createContract(
      {
        templateId: getTemplateId("RFQ" as any),
        payload: rfqData,
      },
      authToken
    );
  }

  // RFQ CHOICES

  async submitBid(
    contractId: string,
    lender: string,
    lenderProfile: any,
    interestRateStructure: any,
    repaymentSchedule: any,
    proposedCovenants: any[],
    additionalTerms: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Submitting bid for RFQ: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("RFQ" as any),
        contractId,
        choice: "SubmitBid",
        argument: {
          lender,
          lenderProfile,
          interestRateStructure,
          repaymentSchedule,
          proposedCovenants,
          additionalTerms,
        },
      },
      authToken
    );
  }

  async incrementBidCount(
    contractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Incrementing bid count: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("RFQ" as any),
        contractId,
        choice: "IncrementBidCount",
        argument: {},
      },
      authToken
    );
  }

  async acceptBid(
    contractId: string,
    bidCid: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Accepting bid for RFQ: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("RFQ" as any),
        contractId,
        choice: "AcceptBid",
        argument: { bidCid },
      },
      authToken
    );
  }

  async startReview(
    contractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Starting review for RFQ: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("RFQ" as any),
        contractId,
        choice: "StartReview",
        argument: {},
      },
      authToken
    );
  }

  async cancelRFQ(
    contractId: string,
    reason: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Cancelling RFQ: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("RFQ" as any),
        contractId,
        choice: "CancelRFQ",
        argument: { reason },
      },
      authToken
    );
  }

  async extendExpiration(
    contractId: string,
    newExpiresAt: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Extending RFQ expiration: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("RFQ" as any),
        contractId,
        choice: "ExtendExpiration",
        argument: { newExpiresAt },
      },
      authToken
    );
  }

  async markExpired(
    contractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Marking RFQ as expired: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("RFQ" as any),
        contractId,
        choice: "MarkExpired",
        argument: {},
      },
      authToken
    );
  }

  // BID QUERIES

  async queryBids(
    authToken: string
  ): Promise<DamlResponse<DamlContract<BidData>[]>> {
    ConsoleLogger.info("Fetching bids");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("Bid" as any)],
      },
      authToken
    );
  }

  // BID CHOICES

  async withdrawBid(
    contractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Withdrawing bid: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("Bid" as any),
        contractId,
        choice: "WithdrawBid",
        argument: {},
      },
      authToken
    );
  }

  async modifyBid(
    contractId: string,
    newInterestRateStructure: any,
    newRepaymentSchedule: any,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Modifying bid: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("Bid" as any),
        contractId,
        choice: "ModifyBid",
        argument: { newInterestRateStructure, newRepaymentSchedule },
      },
      authToken
    );
  }

  async markBidUnderReview(
    contractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Marking bid under review: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("Bid" as any),
        contractId,
        choice: "MarkUnderReview",
        argument: {},
      },
      authToken
    );
  }

  async rejectBid(
    contractId: string,
    reason: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Rejecting bid: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("Bid" as any),
        contractId,
        choice: "RejectBid",
        argument: { reason },
      },
      authToken
    );
  }

  // LOAN PROPOSAL QUERIES

  async queryLoanProposals(
    authToken: string
  ): Promise<DamlResponse<DamlContract<LoanProposalData>[]>> {
    ConsoleLogger.info("Fetching loan proposals");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("LoanProposal" as any)],
      },
      authToken
    );
  }

  // LOAN PROPOSAL CHOICES

  async acceptLoan(
    contractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Accepting loan proposal: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LoanProposal" as any),
        contractId,
        choice: "AcceptLoan",
        argument: {},
      },
      authToken
    );
  }

  async rejectLoan(
    contractId: string,
    reason: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Rejecting loan proposal: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LoanProposal" as any),
        contractId,
        choice: "RejectLoan",
        argument: { reason },
      },
      authToken
    );
  }

  // LOAN QUERIES

  async queryLoans(
    authToken: string
  ): Promise<DamlResponse<DamlContract<LoanData>[]>> {
    ConsoleLogger.info("Fetching loans");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("Loan" as any)],
      },
      authToken
    );
  }

  // LOAN CHOICES

  async makePayment(
    contractId: string,
    paymentAmount: string,
    principalPortion: string,
    interestPortion: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Making payment for loan: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("Loan" as any),
        contractId,
        choice: "MakePayment",
        argument: { paymentAmount, principalPortion, interestPortion },
      },
      authToken
    );
  }

  async makeEarlyRepayment(
    contractId: string,
    repaymentAmount: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Making early repayment for loan: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("Loan" as any),
        contractId,
        choice: "MakeEarlyRepayment",
        argument: { repaymentAmount },
      },
      authToken
    );
  }

  async markDelinquent(
    contractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Marking loan as delinquent: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("Loan" as any),
        contractId,
        choice: "MarkDelinquent",
        argument: {},
      },
      authToken
    );
  }

  async markDefault(
    contractId: string,
    reason: string,
    platformCid: string | undefined,
    assetType: any,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Marking loan as default: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("Loan" as any),
        contractId,
        choice: "MarkDefault",
        argument: {
          reason,
          platformCid: platformCid
            ? { tag: "Some", value: platformCid }
            : { tag: "None" },
          assetType,
        },
      },
      authToken
    );
  }

  async restructureLoan(
    contractId: string,
    newInterestRateStructure: any,
    newRepaymentSchedule: any,
    newCovenants: any[],
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Restructuring loan: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("Loan" as any),
        contractId,
        choice: "RestructureLoan",
        argument: {
          newInterestRateStructure,
          newRepaymentSchedule,
          newCovenants,
        },
      },
      authToken
    );
  }
}
