import { BaseApiClient } from "./base";

// Type definitions for Aegis Platform API
export interface AssetType {
  tag:
    | "Cryptocurrency"
    | "Stablecoin"
    | "FiatCurrency"
    | "GovernmentBond"
    | "CorporateBond"
    | "Equity"
    | "RealEstateToken"
    | "Commodity";
  value: string;
}

export interface TreasuryBalance {
  assetType: AssetType;
  amount: string;
}

export interface Treasury {
  treasuryBalances: TreasuryBalance[];
  reserveRatio: string;
  lastAuditDate: string;
}

export type PlatformStatus =
  | "PlatformActive"
  | "PlatformMaintenance"
  | "PlatformEmergencyShutdown";

export interface AegisPlatform {
  platform: string;
  treasury: Treasury;
  authorizedAssets: AssetType[];
  platformFeeRate: string;
  emergencyOperator: string;
  complianceOfficer: string;
  totalLoansOriginated: string;
  totalFeesCollected: string;
  activeLenders: string[];
  platformStatus: PlatformStatus;
}

export interface AssetBalance {
  owner: string;
  assetType: AssetType;
  availableBalance: string;
  lockedBalance: string;
  totalBalance: string;
  lastUpdated: string;
}

export interface RepaymentTerms {
  interestRate: string;
  repaymentDeadline: string;
  collateralRequired: boolean;
}

export interface LiquiditySupport {
  supportId: string;
  platform: string;
  lender: string;
  assetType: AssetType;
  supportAmount: string;
  supportReason: string;
  repaymentTerms: RepaymentTerms;
  outstandingAmount: string;
  supportDate: string;
  status: { tag: "Active" | "Repaid" | "Defaulted" };
}

// Request types
export interface CreatePlatformRequest {
  platform: string;
  emergencyOperator: string;
  complianceOfficer: string;
  authorizedAssets: AssetType[];
  platformFeeRate: string;
}

export interface MintToTreasuryRequest {
  assetType: AssetType;
  mintAmount: string;
  mintReason: string;
}

export interface BulkMintRequest {
  mintingPlan: Array<{
    assetType: AssetType;
    amount: string;
  }>;
  bulkReason: string;
}

export interface RegisterLenderRequest {
  newLender: string;
  assetType: AssetType;
}

export interface AdminFundLenderRequest {
  lender: string;
  assetType: AssetType;
  fundingAmount: string;
  fundingReason: string;
}

export interface ReimburseLenderRequest {
  lender: string;
  assetType: AssetType;
  amount: string;
  reimbursementReason: string;
}

export interface AuthorizeAssetsRequest {
  newAssets: AssetType[];
  authorizationReason: string;
}

export interface UpdateFeeRateRequest {
  newFeeRate: string;
  updateReason: string;
}

export interface LiquiditySupportRequest {
  lender: string;
  assetType: AssetType;
  supportAmount: string;
  supportReason: string;
  repaymentTerms: RepaymentTerms;
}

export interface EmergencyMintRequest {
  assetType: AssetType;
  emergencyAmount: string;
  emergencyReason: string;
}

export interface DeauthorizeAssetsRequest {
  assetsToRemove: AssetType[];
  deauthorizationReason: string;
}

export interface CollectFeeRequest {
  loanId: string;
  loanAmount: string;
  lender: string;
  assetType: AssetType;
}

export interface CollectSecondaryFeeRequest {
  transferId: string;
  transferAmount: string;
  seller: string;
  buyer: string;
  assetType: AssetType;
}

export interface CollectSyndicationFeeRequest {
  loanId: string;
  loanAmount: string;
  leadLender: string;
  participantCount: number;
  assetType: AssetType;
}

export interface RegisterPoolRequest {
  poolId: string;
  poolManager: string;
  initialLiquidity: string;
  assetType: AssetType;
}

export interface CollectPoolFeeRequest {
  poolId: string;
  poolManager: string;
  managementFee: string;
  totalLiquidity: string;
  assetType: AssetType;
}

export interface PoolBonusRequest {
  poolId: string;
  poolManager: string;
  bonusAmount: string;
  performanceMetric: string;
  assetType: AssetType;
}

export interface InjectFundsRequest {
  assetType: AssetType;
  injectionAmount: string;
  injectionReason: string;
}

export interface ReceiveFundsRequest {
  amount: string;
  sender: string;
  receiptReason: string;
}

export interface LockFundsRequest {
  amount: string;
  purpose: string;
  lockDuration: string;
}

// Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  result?: any;
  error?: string;
}

export class AegisApi extends BaseApiClient {
  // PLATFORM CREATION & QUERY

  async createPlatform(data: CreatePlatformRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        "/api/aegis/platform",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getPlatform() {
    try {
      const response = await this.request<
        ApiResponse<{ platform: AegisPlatform | null }>
      >("/api/aegis/platform");

      return {
        data: response.success ? response.data?.platform : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getAssetBalances(owner?: string) {
    try {
      const queryParam = owner ? `?owner=${encodeURIComponent(owner)}` : "";
      const response = await this.request<
        ApiResponse<{ balances: AssetBalance[] }>
      >(`/api/aegis/balances${queryParam}`);

      return {
        data: response.success ? response.data?.balances || [] : [],
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getLiquiditySupport(lender?: string) {
    try {
      const queryParam = lender ? `?lender=${encodeURIComponent(lender)}` : "";
      const response = await this.request<
        ApiResponse<{ supports: LiquiditySupport[] }>
      >(`/api/aegis/liquidity-support${queryParam}`);

      return {
        data: response.success ? response.data?.supports || [] : [],
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // TREASURY MANAGEMENT

  async mintToTreasury(contractId: string, data: MintToTreasuryRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/mint`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async bulkMintToTreasury(contractId: string, data: BulkMintRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/bulk-mint`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // LENDER MANAGEMENT

  async registerLender(contractId: string, data: RegisterLenderRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/register-lender`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async adminFundLender(contractId: string, data: AdminFundLenderRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/fund-lender`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async reimburseLender(contractId: string, data: ReimburseLenderRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/reimburse-lender`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // ASSET AUTHORIZATION

  async authorizeAssets(contractId: string, data: AuthorizeAssetsRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/authorize-assets`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async deauthorizeAssets(contractId: string, data: DeauthorizeAssetsRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/deauthorize-assets`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async updateFeeRate(contractId: string, data: UpdateFeeRateRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/update-fee-rate`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // LIQUIDITY SUPPORT

  async provideLiquiditySupport(
    contractId: string,
    data: LiquiditySupportRequest
  ) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/liquidity-support`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async repayLiquiditySupport(contractId: string, repaymentAmount: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/liquidity-support/${contractId}/repay`,
        {
          method: "POST",
          body: JSON.stringify({ repaymentAmount }),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // ASSET BALANCE OPERATIONS

  async receiveFunds(contractId: string, data: ReceiveFundsRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/balances/${contractId}/receive`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async lockFunds(contractId: string, data: LockFundsRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/balances/${contractId}/lock`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // EMERGENCY OPERATIONS

  async emergencyMint(contractId: string, data: EmergencyMintRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/emergency-mint`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async emergencyShutdown(contractId: string, shutdownReason: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/emergency-shutdown`,
        {
          method: "POST",
          body: JSON.stringify({ shutdownReason }),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async reactivatePlatform(contractId: string, reactivationReason: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/reactivate`,
        {
          method: "POST",
          body: JSON.stringify({ reactivationReason }),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // FEE COLLECTION

  async collectPlatformFee(contractId: string, data: CollectFeeRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/collect-fee`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async collectSecondaryMarketFee(
    contractId: string,
    data: CollectSecondaryFeeRequest
  ) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/collect-secondary-fee`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async collectSyndicationFee(
    contractId: string,
    data: CollectSyndicationFeeRequest
  ) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/collect-syndication-fee`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // LIQUIDITY POOL MANAGEMENT

  async registerLiquidityPool(contractId: string, data: RegisterPoolRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/register-pool`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async collectPoolManagementFee(
    contractId: string,
    data: CollectPoolFeeRequest
  ) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/collect-pool-fee`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async providePoolPerformanceBonus(
    contractId: string,
    data: PoolBonusRequest
  ) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/pool-bonus`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async injectTreasuryFunds(contractId: string, data: InjectFundsRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/aegis/platform/${contractId}/inject-funds`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }
}

export const aegisApi = new AegisApi();
