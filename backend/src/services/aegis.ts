/**
 * Aegis Platform Service
 *
 * Platform treasury management, lender funding, asset authorization,
 * and central platform operations for the Aegis RFQ system.
 */

import { DamlService, DamlResponse, DamlContract } from "./daml";
import { getTemplateId } from "../config/daml";
import { ConsoleLogger } from "../utils/logger";

export interface AegisPlatformData {
  platform: string;
  treasury: AegisTreasury;
  authorizedAssets: AssetType[];
  platformFeeRate: string;
  emergencyOperator: string;
  complianceOfficer: string;
  totalLoansOriginated: string;
  totalFeesCollected: string;
  activeLenders: string[];
  platformStatus: PlatformStatus;
}

export interface AegisTreasury {
  treasuryBalances: Array<[AssetType, string]>;
  reserveRatio: string;
  lastAuditDate: string;
}

export interface AssetType {
  tag: string;
  value: string;
}

export interface PlatformStatus {
  tag: string;
}

export interface AssetBalanceData {
  owner: string;
  assetType: AssetType;
  totalBalance: string;
  availableBalance: string;
  lockedBalance: string;
  escrowedBalance: string;
  lastUpdated: string;
  balanceHistory: BalanceTransaction[];
}

export interface BalanceTransaction {
  transactionId: string;
  transactionType: string;
  amount: string;
  counterparty?: string;
  timestamp: string;
  purpose: string;
}

export interface LiquiditySupportData {
  supportId: string;
  platform: string;
  lender: string;
  assetType: AssetType;
  supportAmount: string;
  repaymentTerms: LiquiditySupportTerms;
  providedAt: string;
  status: string;
}

export interface LiquiditySupportTerms {
  interestRate: string;
  repaymentDeadline: string;
  collateralRequired: boolean;
}

export class AegisService {
  private static instance: AegisService;
  private damlService: DamlService;

  private constructor() {
    this.damlService = DamlService.getInstance();
  }

  public static getInstance(): AegisService {
    if (!AegisService.instance) {
      AegisService.instance = new AegisService();
    }
    return AegisService.instance;
  }

  // PLATFORM QUERIES

  async queryPlatform(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<AegisPlatformData>[]>> {
    ConsoleLogger.info("Fetching Aegis platform");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("AegisPlatform" as any)],
      },
      authToken,
      user
    );
  }

  async queryAssetBalances(
    authToken: string,
    owner?: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<AssetBalanceData>[]>> {
    ConsoleLogger.info("Fetching asset balances");
    const query: any = {
      templateIds: [getTemplateId("AssetBalance" as any)],
    };

    if (owner) {
      query.query = { owner };
    }

    return this.damlService.queryContracts(query, authToken, user);
  }

  async queryLiquiditySupport(
    authToken: string,
    lender?: string,
    _user?: any
  ): Promise<DamlResponse<DamlContract<LiquiditySupportData>[]>> {
    ConsoleLogger.info("Fetching liquidity support records");
    const query: any = {
      templateIds: [getTemplateId("LiquiditySupport" as any)],
    };

    if (lender) {
      query.query = { lender };
    }

    return this.damlService.queryContracts(query, authToken);
  }

  // PLATFORM CREATION

  async createPlatform(
    platformData: AegisPlatformData,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<AegisPlatformData>>> {
    ConsoleLogger.info("Creating Aegis platform");
    return this.damlService.createContract(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        payload: platformData,
      },
      authToken,
      user
    );
  }

  // TREASURY MANAGEMENT

  async mintToTreasury(
    contractId: string,
    assetType: AssetType,
    mintAmount: string,
    mintReason: string,
    authorizedBy: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Minting to treasury: ${mintAmount}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "MintToTreasury",
        argument: { assetType, mintAmount, mintReason, authorizedBy },
      },
      authToken,
      user
    );
  }

  async emergencyMint(
    contractId: string,
    assetType: AssetType,
    emergencyAmount: string,
    emergencyReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Emergency mint: ${emergencyAmount}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "EmergencyMint",
        argument: { assetType, emergencyAmount, emergencyReason },
      },
      authToken,
      user
    );
  }

  async bulkMintToTreasury(
    contractId: string,
    mintingPlan: Array<[AssetType, string]>,
    bulkReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Bulk minting to treasury`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "BulkMintToTreasury",
        argument: { mintingPlan, bulkReason },
      },
      authToken,
      user
    );
  }

  async injectTreasuryFunds(
    contractId: string,
    assetType: AssetType,
    amount: string,
    injectionReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Injecting treasury funds: ${amount}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "InjectTreasuryFunds",
        argument: { assetType, amount, injectionReason },
      },
      authToken,
      user
    );
  }

  // ASSET AUTHORIZATION

  async authorizeNewAssets(
    contractId: string,
    newAssets: AssetType[],
    authorizationReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Authorizing ${newAssets.length} new assets`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "AuthorizeNewAssets",
        argument: { newAssets, authorizationReason },
      },
      authToken,
      user
    );
  }

  async deauthorizeAssets(
    contractId: string,
    assetsToRemove: AssetType[],
    deauthorizationReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Deauthorizing ${assetsToRemove.length} assets`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "DeauthorizeAssets",
        argument: { assetsToRemove, deauthorizationReason },
      },
      authToken,
      user
    );
  }

  async updatePlatformFeeRate(
    contractId: string,
    newFeeRate: string,
    updateReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Updating platform fee rate to: ${newFeeRate}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "UpdatePlatformFeeRate",
        argument: { newFeeRate, updateReason },
      },
      authToken,
      user
    );
  }

  // LENDER MANAGEMENT

  async registerNewLender(
    contractId: string,
    newLender: string,
    assetType: AssetType,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Registering new lender: ${newLender}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "RegisterNewLender",
        argument: { newLender, assetType },
      },
      authToken,
      user
    );
  }

  async adminFundLender(
    contractId: string,
    lender: string,
    assetType: AssetType,
    fundingAmount: string,
    fundingReason: string,
    adminApproval: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Admin funding lender ${lender}: ${fundingAmount}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "AdminFundLender",
        argument: {
          lender,
          assetType,
          fundingAmount,
          fundingReason,
          adminApproval,
        },
      },
      authToken,
      user
    );
  }

  async reimburseLender(
    contractId: string,
    lender: string,
    assetType: AssetType,
    amount: string,
    reimbursementReason: string,
    approvedBy: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Reimbursing lender ${lender}: ${amount}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "ReimburseLender",
        argument: {
          lender,
          assetType,
          amount,
          reimbursementReason,
          approvedBy,
        },
      },
      authToken,
      user
    );
  }

  // FEE COLLECTION

  async collectPlatformFee(
    contractId: string,
    loanId: string,
    loanAmount: string,
    lender: string,
    assetType: AssetType,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Collecting platform fee for loan: ${loanId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "CollectPlatformFee",
        argument: { loanId, loanAmount, lender, assetType },
      },
      authToken,
      user
    );
  }

  async collectSecondaryMarketFee(
    contractId: string,
    transferId: string,
    transferAmount: string,
    seller: string,
    buyer: string,
    assetType: AssetType,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Collecting secondary market fee: ${transferId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "CollectSecondaryMarketFee",
        argument: { transferId, transferAmount, seller, buyer, assetType },
      },
      authToken,
      user
    );
  }

  async collectSyndicationFee(
    contractId: string,
    loanId: string,
    loanAmount: string,
    leadLender: string,
    participantCount: number,
    assetType: AssetType,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Collecting syndication fee for loan: ${loanId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "CollectSyndicationFee",
        argument: {
          loanId,
          loanAmount,
          leadLender,
          participantCount,
          assetType,
        },
      },
      authToken,
      user
    );
  }

  // LIQUIDITY POOL OPERATIONS

  async registerLiquidityPool(
    contractId: string,
    poolId: string,
    poolManager: string,
    initialLiquidity: string,
    assetType: AssetType,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Registering liquidity pool: ${poolId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "RegisterLiquidityPool",
        argument: { poolId, poolManager, initialLiquidity, assetType },
      },
      authToken,
      user
    );
  }

  async collectPoolManagementFee(
    contractId: string,
    poolId: string,
    poolManager: string,
    managementFee: string,
    totalLiquidity: string,
    assetType: AssetType,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Collecting pool management fee: ${poolId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "CollectPoolManagementFee",
        argument: {
          poolId,
          poolManager,
          managementFee,
          totalLiquidity,
          assetType,
        },
      },
      authToken,
      user
    );
  }

  async providePoolPerformanceBonus(
    contractId: string,
    poolId: string,
    poolManager: string,
    bonusAmount: string,
    performanceMetric: string,
    assetType: AssetType,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Providing pool performance bonus: ${poolId}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "ProvidePoolPerformanceBonus",
        argument: {
          poolId,
          poolManager,
          bonusAmount,
          performanceMetric,
          assetType,
        },
      },
      authToken,
      user
    );
  }

  // EMERGENCY OPERATIONS

  async emergencyShutdown(
    contractId: string,
    shutdownReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info("Initiating emergency platform shutdown");
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "EmergencyShutdown",
        argument: { shutdownReason },
      },
      authToken,
      user
    );
  }

  async reactivatePlatform(
    contractId: string,
    reactivationReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info("Reactivating platform");
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "ReactivatePlatform",
        argument: { reactivationReason },
      },
      authToken,
      user
    );
  }

  // LIQUIDITY SUPPORT

  async provideLiquiditySupport(
    contractId: string,
    lender: string,
    assetType: AssetType,
    supportAmount: string,
    supportReason: string,
    repaymentTerms: LiquiditySupportTerms,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(
      `Providing liquidity support to ${lender}: ${supportAmount}`
    );
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AegisPlatform" as any),
        contractId,
        choice: "ProvideLiquiditySupport",
        argument: {
          lender,
          assetType,
          supportAmount,
          supportReason,
          repaymentTerms,
        },
      },
      authToken,
      user
    );
  }

  async repaySupport(
    contractId: string,
    repaymentAmount: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Repaying liquidity support: ${repaymentAmount}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LiquiditySupport" as any),
        contractId,
        choice: "RepaySupport",
        argument: { repaymentAmount },
      },
      authToken,
      user
    );
  }

  // ASSET BALANCE OPERATIONS

  async receiveFunds(
    contractId: string,
    amount: string,
    sender: string,
    receiptReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Receiving funds: ${amount}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AssetBalance" as any),
        contractId,
        choice: "ReceiveFunds",
        argument: { amount, sender, receiptReason },
      },
      authToken,
      user
    );
  }

  async lockFunds(
    contractId: string,
    amount: string,
    purpose: string,
    lockDuration: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Locking funds: ${amount}`);
    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("AssetBalance" as any),
        contractId,
        choice: "LockFunds",
        argument: { amount, purpose, lockDuration },
      },
      authToken,
      user
    );
  }
}
