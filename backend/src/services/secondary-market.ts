/**
 * Secondary Market Service
 *
 * Loan trading and secondary market operations with DAML integration including
 * loan listings, offers, transfers, and settlements.
 */

import { DamlService, DamlResponse, DamlContract } from "./daml";
import { getTemplateId } from "../config/daml";
import { ConsoleLogger } from "../utils/logger";

export interface LoanListingData {
  listingId: string;
  seller: string;
  loanId: string;
  loanDetails: any;
  askingPrice: string;
  minimumPrice: string;
  listedAt: string;
  expiresAt: string;
  status: string;
}

export interface LoanOfferData {
  offerId: string;
  listingId: string;
  buyer: string;
  seller: string;
  offerPrice: string;
  offeredAt: string;
  status: string;
}

export interface SecondaryLoanTransferData {
  transferId: string;
  seller: string;
  buyer: string;
  loanId: string;
  transferPrice: string;
  borrower: string;
  initiatedAt: string;
  status: string;
}

export interface TransferSettlementData {
  settlementId: string;
  seller: string;
  buyer: string;
  loanId: string;
  transferPrice: string;
  transferFee: string;
  netAmount: string;
  settledAt: string;
}

export interface LoanValuationData {
  valuationId: string;
  valuator: string;
  loanId: string;
  fairValue: string;
  discountRate: string;
  valuationDate: string;
  methodology: string;
}

export interface BorrowerNotificationData {
  notificationId: string;
  borrower: string;
  oldLender: string;
  newLender: string;
  loanId: string;
  notifiedAt: string;
  acknowledged: boolean;
}

export class SecondaryMarketService {
  private static instance: SecondaryMarketService;
  private damlService: DamlService;

  private constructor() {
    this.damlService = DamlService.getInstance();
  }

  public static getInstance(): SecondaryMarketService {
    if (!SecondaryMarketService.instance) {
      SecondaryMarketService.instance = new SecondaryMarketService();
    }
    return SecondaryMarketService.instance;
  }

  // LOAN LISTING QUERIES

  async queryLoanListings(
    authToken: string
  ): Promise<DamlResponse<DamlContract<LoanListingData>[]>> {
    ConsoleLogger.info("Fetching loan listings");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("LoanListing" as any)],
      },
      authToken
    );
  }

  async createLoanListing(
    listingData: LoanListingData,
    authToken: string
  ): Promise<DamlResponse<DamlContract<LoanListingData>>> {
    ConsoleLogger.info(`Creating loan listing: ${listingData.listingId}`);
    return this.damlService.createContract(
      {
        templateId: getTemplateId("LoanListing" as any),
        payload: listingData,
      },
      authToken
    );
  }

  // LOAN LISTING CHOICES

  async makeOffer(
    contractId: string,
    buyer: string,
    offerPrice: string,
    offerTerms: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Making offer on listing: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LoanListing" as any),
        contractId,
        choice: "MakeOffer",
        argument: { buyer, offerPrice, offerTerms },
      },
      authToken
    );
  }

  async acceptOffer(
    contractId: string,
    offerCid: string,
    borrower: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Accepting offer for listing: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LoanListing" as any),
        contractId,
        choice: "AcceptOffer",
        argument: { offerCid, borrower },
      },
      authToken
    );
  }

  async cancelListing(
    contractId: string,
    reason: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Cancelling listing: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LoanListing" as any),
        contractId,
        choice: "CancelListing",
        argument: { reason },
      },
      authToken
    );
  }

  async updateAskingPrice(
    contractId: string,
    newPrice: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Updating asking price for listing: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LoanListing" as any),
        contractId,
        choice: "UpdateAskingPrice",
        argument: { newPrice },
      },
      authToken
    );
  }

  // LOAN OFFER QUERIES

  async queryLoanOffers(
    authToken: string
  ): Promise<DamlResponse<DamlContract<LoanOfferData>[]>> {
    ConsoleLogger.info("Fetching loan offers");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("LoanOffer" as any)],
      },
      authToken
    );
  }

  // LOAN OFFER CHOICES

  async withdrawOffer(
    contractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Withdrawing offer: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LoanOffer" as any),
        contractId,
        choice: "WithdrawOffer",
        argument: {},
      },
      authToken
    );
  }

  async rejectOffer(
    contractId: string,
    rejectionReason: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Rejecting offer: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LoanOffer" as any),
        contractId,
        choice: "RejectOffer",
        argument: { rejectionReason },
      },
      authToken
    );
  }

  // SECONDARY LOAN TRANSFER QUERIES

  async querySecondaryLoanTransfers(
    authToken: string
  ): Promise<DamlResponse<DamlContract<SecondaryLoanTransferData>[]>> {
    ConsoleLogger.info("Fetching secondary loan transfers");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("SecondaryLoanTransfer" as any)],
      },
      authToken
    );
  }

  // SECONDARY LOAN TRANSFER CHOICES

  async executeTransfer(
    contractId: string,
    originalLoanCid: string,
    transferFee: string,
    platformCid: string | undefined,
    assetType: any,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Executing loan transfer: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SecondaryLoanTransfer" as any),
        contractId,
        choice: "ExecuteTransfer",
        argument: {
          originalLoanCid,
          transferFee,
          platformCid: platformCid
            ? { tag: "Some", value: platformCid }
            : { tag: "None" },
          assetType,
        },
      },
      authToken
    );
  }

  async cancelTransfer(
    contractId: string,
    cancellationReason: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Cancelling transfer: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SecondaryLoanTransfer" as any),
        contractId,
        choice: "CancelTransfer",
        argument: { cancellationReason },
      },
      authToken
    );
  }

  // TRANSFER SETTLEMENT QUERIES

  async queryTransferSettlements(
    authToken: string
  ): Promise<DamlResponse<DamlContract<TransferSettlementData>[]>> {
    ConsoleLogger.info("Fetching transfer settlements");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("TransferSettlement" as any)],
      },
      authToken
    );
  }

  // TRANSFER SETTLEMENT CHOICES

  async acknowledgeSettlement(
    contractId: string,
    party: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Acknowledging settlement: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("TransferSettlement" as any),
        contractId,
        choice: "AcknowledgeSettlement",
        argument: { party },
      },
      authToken
    );
  }

  // LOAN VALUATION QUERIES

  async queryLoanValuations(
    authToken: string
  ): Promise<DamlResponse<DamlContract<LoanValuationData>[]>> {
    ConsoleLogger.info("Fetching loan valuations");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("LoanValuation" as any)],
      },
      authToken
    );
  }

  // LOAN VALUATION CHOICES

  async updateValuation(
    contractId: string,
    newFairValue: string,
    newDiscountRate: string,
    newMethodology: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Updating loan valuation: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LoanValuation" as any),
        contractId,
        choice: "UpdateValuation",
        argument: { newFairValue, newDiscountRate, newMethodology },
      },
      authToken
    );
  }

  // BORROWER NOTIFICATION QUERIES

  async queryBorrowerNotifications(
    authToken: string
  ): Promise<DamlResponse<DamlContract<BorrowerNotificationData>[]>> {
    ConsoleLogger.info("Fetching borrower notifications");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("BorrowerNotification" as any)],
      },
      authToken
    );
  }

  // BORROWER NOTIFICATION CHOICES

  async acknowledgeNotification(
    contractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Acknowledging notification: ${contractId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("BorrowerNotification" as any),
        contractId,
        choice: "AcknowledgeNotification",
        argument: {},
      },
      authToken
    );
  }
}
