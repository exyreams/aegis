import { BaseApiClient } from "./base";
import type {
  CollateralPool,
  CollateralPoolResponse,
  CollateralLiquidation,
} from "@/types/api";

export class CollateralApi extends BaseApiClient {
  async getCollateralPools() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: CollateralPool[];
        error?: string;
      }>("/api/collateral/pools");

      return {
        data: response.success ? response.data || [] : [],
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

  async createCollateralPool(data: {
    poolId: string;
    borrower: string;
    lender: string;
    loanId: string;
    collateralAssets: Array<{
      assetType: string;
      amount: string;
      valuation: string;
    }>;
    requiredRatio: string;
  }) {
    try {
      const response = await this.request<CollateralPoolResponse>(
        "/api/collateral/pools",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.data : null,
        error: response.success ? null : response.error,
        status: response.success ? 201 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getCollateralPool(poolId: string) {
    try {
      const response = await this.request<CollateralPoolResponse>(
        `/api/collateral/pools/${poolId}`
      );

      return {
        data: response.success ? response.data : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 404,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getCollateralLiquidations() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: CollateralLiquidation[];
        error?: string;
      }>("/api/collateral/liquidations");

      return {
        data: response.success ? response.data || [] : [],
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

  async createCollateralLiquidation(data: {
    liquidationId: string;
    poolId: string;
    borrower: string;
    lender: string;
    triggerReason: string;
    assetsToLiquidate: Array<{
      assetType: string;
      amount: string;
    }>;
    estimatedProceeds: string;
    liquidationCosts: string;
  }) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string };
        error?: string;
      }>("/api/collateral/liquidations", {
        method: "POST",
        body: JSON.stringify(data),
      });

      return {
        data: response.success ? response.data : null,
        error: response.success ? null : response.error,
        status: response.success ? 201 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async updateCollateralValuation(poolId: string, newValuation: string) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string };
        error?: string;
      }>(`/api/collateral/pools/${poolId}/valuation`, {
        method: "PUT",
        body: JSON.stringify({ newValuation }),
      });

      return {
        data: response.success ? response.data : null,
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

  async triggerMarginCall(
    contractId: string,
    deadline: string,
    requiredAmount: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/collateral/pools/${contractId}/margin-call`, {
        method: "POST",
        body: JSON.stringify({ deadline, requiredAmount }),
      });

      return {
        success: response.success,
        message: response.message,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async respondToMarginCall(
    contractId: string,
    additionalAssets: Array<{ assetType: string; amount: string }>
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/collateral/pools/${contractId}/respond-margin-call`, {
        method: "POST",
        body: JSON.stringify({ additionalAssets }),
      });

      return {
        success: response.success,
        message: response.message,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async initiateLiquidation(contractId: string, reason: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/collateral/pools/${contractId}/liquidate`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });

      return {
        success: response.success,
        message: response.message,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async requestEmergencySupport(
    contractId: string,
    platformCid: string,
    supportAmount: string,
    assetType: any,
    repaymentTerms: any
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/collateral/pools/${contractId}/request-emergency-support`, {
        method: "POST",
        body: JSON.stringify({
          platformCid,
          supportAmount,
          assetType,
          repaymentTerms,
        }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  async requestSubstitution(
    contractId: string,
    assetToRemove: any,
    assetToAdd: any,
    reason: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/collateral/pools/${contractId}/request-substitution`, {
        method: "POST",
        body: JSON.stringify({ assetToRemove, assetToAdd, reason }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  async releaseCollateral(contractId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/collateral/pools/${contractId}/release`, {
        method: "POST",
      });

      return {
        success: response.success,
        message: response.message,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async partialRelease(contractId: string, assetIdsToRelease: string[]) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/collateral/pools/${contractId}/partial-release`, {
        method: "POST",
        body: JSON.stringify({ assetIdsToRelease }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  // SUBSTITUTION REQUESTS

  async getSubstitutionRequests() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/collateral/substitution-requests");

      return {
        data: response.success ? response.data || [] : [],
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

  async approveSubstitution(contractId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/collateral/substitution-requests/${contractId}/approve`, {
        method: "POST",
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  async rejectSubstitution(contractId: string, rejectionReason: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/collateral/substitution-requests/${contractId}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejectionReason }),
      });

      return {
        success: response.success,
        message: response.message,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // LIQUIDATIONS

  async getLiquidations() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/collateral/liquidations");

      return {
        data: response.success ? response.data || [] : [],
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

  async executeLiquidation(
    contractId: string,
    liquidationProceeds: string,
    liquidationCosts: string,
    platformCid: string,
    assetType: any
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/collateral/liquidations/${contractId}/execute`, {
        method: "POST",
        body: JSON.stringify({
          liquidationProceeds,
          liquidationCosts,
          platformCid,
          assetType,
        }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  async cancelLiquidation(contractId: string, cancellationReason: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/collateral/liquidations/${contractId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ cancellationReason }),
      });

      return {
        success: response.success,
        message: response.message,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // SETTLEMENTS

  async getSettlements() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/collateral/settlements");

      return {
        data: response.success ? response.data || [] : [],
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

  async acknowledgeSettlement(contractId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/collateral/settlements/${contractId}/acknowledge`, {
        method: "POST",
      });

      return {
        success: response.success,
        message: response.message,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        status: 500,
      };
    }
  }
}

export const collateralApi = new CollateralApi();
