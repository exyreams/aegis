/**
 * Collateral Management Service
 *
 * Comprehensive collateral pool management with DAML integration including
 * asset locking, valuation tracking, liquidation workflows, and automated
 * collateral release upon loan completion or default scenarios.
 */

import { DamlService, DamlResponse, DamlContract } from "./daml";
import { getTemplateId, DAML_CONFIG } from "../config/daml";
import { ConsoleLogger } from "../utils/logger";
import { CollateralAsset } from "./credit";

export interface CollateralPoolData {
  poolId: string;
  borrower: string;
  lender: string;
  loanId: string;
  assets: CollateralAsset[];
  collateralRequirements: CollateralRequirements;
  totalInitialValue: string;
  totalCurrentValue: string;
  loanAmount: string;
  currentLTV: string;
  status: string;
  lastValuationTime: string;
  marginCallActive: boolean;
  marginCallDeadline?: string;
}

export interface CollateralRequirements {
  minimumRatio: string;
  maintenanceRatio: string;
  liquidationRatio: string;
}

export interface SubstitutionRequestData {
  requestId: string;
  poolCid: string;
  borrower: string;
  lender: string;
  assetToRemove: string;
  assetToAdd: CollateralAsset;
  reason: string;
  requestedAt: string;
  status: string;
}

export interface CollateralLiquidationData {
  liquidationId: string;
  borrower: string;
  lender: string;
  loanId: string;
  assets: CollateralAsset[];
  totalValue: string;
  loanAmount: string;
  reason: string;
  initiatedAt: string;
  status: string;
}

export interface LiquidationSettlementData {
  settlementId: string;
  borrower: string;
  lender: string;
  loanId: string;
  liquidationProceeds: string;
  liquidationCosts: string;
  netProceeds: string;
  loanAmount: string;
  surplus: string;
  shortfall: string;
  settledAt: string;
}

export class CollateralService {
  private damlService: DamlService;

  constructor() {
    this.damlService = DamlService.getInstance();
  }

  async getCollateralPools(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<CollateralPoolData>[]>> {
    ConsoleLogger.info("Fetching collateral pools");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("CollateralPool")],
      },
      authToken,
      user
    );
  }

  async getCollateralPoolById(
    poolId: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<CollateralPoolData> | null>> {
    ConsoleLogger.info(`Fetching collateral pool: ${poolId}`);

    const result = await this.damlService.queryContracts<CollateralPoolData>(
      {
        templateIds: [getTemplateId("CollateralPool")],
      },
      authToken,
      user
    );

    if (result.status === 200 && result.result) {
      const pool = result.result.find((c) => c.payload.poolId === poolId);
      return {
        ...result,
        result: pool || null,
      };
    }

    return result as any;
  }

  async createCollateralPool(
    poolData: CollateralPoolData,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<CollateralPoolData>>> {
    ConsoleLogger.info(`Creating collateral pool: ${poolData.poolId}`);

    return this.damlService.createContract(
      {
        templateId: getTemplateId("CollateralPool"),
        payload: poolData,
      },
      authToken,
      user
    );
  }

  async updateValuation(
    contractId: string,
    newAssetValues: Array<[string, string]>,
    valuationSource: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Updating collateral valuation: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CollateralPool"),
        contractId,
        choice: DAML_CONFIG.choices.CollateralPool.UpdateValuation,
        argument: {
          newAssetValues,
          valuationSource,
        },
      },
      authToken,
      user
    );
  }

  async triggerMarginCall(
    contractId: string,
    deadline: string,
    requiredAmount: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Triggering margin call: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CollateralPool"),
        contractId,
        choice: DAML_CONFIG.choices.CollateralPool.TriggerMarginCall,
        argument: {
          deadline,
          requiredAmount,
        },
      },
      authToken,
      user
    );
  }

  async respondToMarginCall(
    contractId: string,
    additionalAssets: CollateralAsset[],
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Responding to margin call: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CollateralPool"),
        contractId,
        choice: DAML_CONFIG.choices.CollateralPool.RespondToMarginCall,
        argument: {
          additionalAssets,
        },
      },
      authToken,
      user
    );
  }

  async initiateLiquidation(
    contractId: string,
    reason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Initiating liquidation: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CollateralPool"),
        contractId,
        choice: DAML_CONFIG.choices.CollateralPool.InitiateLiquidation,
        argument: {
          reason,
        },
      },
      authToken,
      user
    );
  }

  async requestSubstitution(
    contractId: string,
    assetToRemove: string,
    assetToAdd: CollateralAsset,
    reason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Requesting collateral substitution: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CollateralPool"),
        contractId,
        choice: DAML_CONFIG.choices.CollateralPool.RequestSubstitution,
        argument: {
          assetToRemove,
          assetToAdd,
          reason,
        },
      },
      authToken,
      user
    );
  }

  async releaseCollateral(
    contractId: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Releasing collateral: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CollateralPool"),
        contractId,
        choice: DAML_CONFIG.choices.CollateralPool.ReleaseCollateral,
        argument: {},
      },
      authToken,
      user
    );
  }

  async partialRelease(
    contractId: string,
    assetIdsToRelease: string[],
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Partial collateral release: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CollateralPool"),
        contractId,
        choice: DAML_CONFIG.choices.CollateralPool.PartialRelease,
        argument: {
          assetIdsToRelease,
        },
      },
      authToken,
      user
    );
  }

  async getSubstitutionRequests(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<SubstitutionRequestData>[]>> {
    ConsoleLogger.info("Fetching substitution requests");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("SubstitutionRequest")],
      },
      authToken,
      user
    );
  }

  async approveSubstitution(
    contractId: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Approving substitution: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SubstitutionRequest"),
        contractId,
        choice: DAML_CONFIG.choices.SubstitutionRequest.ApproveSubstitution,
        argument: {},
      },
      authToken,
      user
    );
  }

  async rejectSubstitution(
    contractId: string,
    rejectionReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Rejecting substitution: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("SubstitutionRequest"),
        contractId,
        choice: DAML_CONFIG.choices.SubstitutionRequest.RejectSubstitution,
        argument: {
          rejectionReason,
        },
      },
      authToken,
      user
    );
  }

  async requestEmergencySupport(
    contractId: string,
    platformCid: string,
    supportAmount: string,
    assetType: any,
    repaymentTerms: any,
    authToken: string
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Requesting emergency support: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CollateralPool"),
        contractId,
        choice: DAML_CONFIG.choices.CollateralPool.RequestEmergencySupport,
        argument: {
          platformCid,
          supportAmount,
          assetType,
          repaymentTerms,
        },
      },
      authToken
    );
  }

  async getLiquidations(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<CollateralLiquidationData>[]>> {
    ConsoleLogger.info("Fetching collateral liquidations");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("CollateralLiquidation")],
      },
      authToken,
      user
    );
  }

  async getCollateralLiquidations(
    authToken: string
  ): Promise<DamlResponse<DamlContract<CollateralLiquidationData>[]>> {
    ConsoleLogger.info("Fetching collateral liquidations");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("CollateralLiquidation")],
      },
      authToken
    );
  }

  async executeLiquidation(
    contractId: string,
    liquidationProceeds: string,
    liquidationCosts: string,
    platformCid: string | undefined,
    assetType: any,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Executing liquidation: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CollateralLiquidation"),
        contractId,
        choice: DAML_CONFIG.choices.CollateralLiquidation.ExecuteLiquidation,
        argument: {
          liquidationProceeds,
          liquidationCosts,
          platformCid: platformCid
            ? { tag: "Some", value: platformCid }
            : { tag: "None" },
          assetType,
        },
      },
      authToken,
      user
    );
  }

  async cancelLiquidation(
    contractId: string,
    cancellationReason: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Cancelling liquidation: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("CollateralLiquidation"),
        contractId,
        choice: DAML_CONFIG.choices.CollateralLiquidation.CancelLiquidation,
        argument: {
          cancellationReason,
        },
      },
      authToken,
      user
    );
  }

  async getSettlements(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<LiquidationSettlementData>[]>> {
    ConsoleLogger.info("Fetching liquidation settlements");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("LiquidationSettlement")],
      },
      authToken,
      user
    );
  }

  async getLiquidationSettlements(
    authToken: string
  ): Promise<DamlResponse<DamlContract<LiquidationSettlementData>[]>> {
    ConsoleLogger.info("Fetching liquidation settlements");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("LiquidationSettlement")],
      },
      authToken
    );
  }

  async acknowledgeSettlement(
    contractId: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse> {
    ConsoleLogger.info(`Acknowledging settlement: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LiquidationSettlement"),
        contractId,
        choice: DAML_CONFIG.choices.LiquidationSettlement.AcknowledgeSettlement,
        argument: {},
      },
      authToken,
      user
    );
  }

  calculateCollateralValue(assets: CollateralAsset[]): number {
    return assets.reduce((total, asset) => {
      const value = parseFloat(asset.currentValue);
      const haircut = parseFloat(asset.haircut);
      return total + value * (1 - haircut);
    }, 0);
  }

  calculateLTV(loanAmount: number, collateralValue: number): number {
    if (collateralValue === 0) return Infinity;
    return loanAmount / collateralValue;
  }

  needsMarginCall(ltv: number, maintenanceRatio: number): boolean {
    return ltv > 1 / maintenanceRatio;
  }

  needsLiquidation(ltv: number, liquidationRatio: number): boolean {
    return ltv > 1 / liquidationRatio;
  }

  calculateHealthFactor(ltv: number, liquidationRatio: number): number {
    if (ltv === 0) return Infinity;
    return 1 / liquidationRatio / ltv;
  }
}
