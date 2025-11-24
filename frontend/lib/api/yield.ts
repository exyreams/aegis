import { BaseApiClient } from "./base";
import type {
  LiquidityPool,
  LiquidityPoolResponse,
  StakingRewards,
} from "@/types/api";

export class YieldApi extends BaseApiClient {
  async getLiquidityPools() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: LiquidityPool[];
        error?: string;
      }>("/api/yield/pools");

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

  async createLiquidityPool(data: {
    poolId: string;
    manager: string;
    strategy: string;
    initialLiquidity: string;
  }) {
    try {
      const response = await this.request<LiquidityPoolResponse>(
        "/api/yield/pools",
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

  async getLiquidityPool(poolId: string) {
    try {
      const response = await this.request<LiquidityPoolResponse>(
        `/api/yield/pools/${poolId}`
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

  async joinPool(poolId: string, contribution: string) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string; lpTokens: string };
        error?: string;
      }>(`/api/yield/pools/${poolId}/join`, {
        method: "POST",
        body: JSON.stringify({ contribution }),
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

  async withdrawFromPool(poolId: string, lpTokens: string) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string; withdrawnAmount: string };
        error?: string;
      }>(`/api/yield/pools/${poolId}/withdraw`, {
        method: "POST",
        body: JSON.stringify({ lpTokens }),
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

  async getStakingRewards() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: StakingRewards[];
        error?: string;
      }>("/api/yield/staking");

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

  async createStakingReward(data: {
    rewardId: string;
    participant: string;
    poolId: string;
    stakedAmount: string;
    rewardRate: string;
    stakingPeriod: string;
  }) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string };
        error?: string;
      }>("/api/yield/staking", {
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

  async claimStakingRewards(rewardId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string; claimedAmount: string };
        error?: string;
      }>(`/api/yield/staking/${rewardId}/claim`, {
        method: "POST",
        body: JSON.stringify({}),
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

  async distributeYield(poolId: string, yieldAmount: string) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string };
        error?: string;
      }>(`/api/yield/pools/${poolId}/distribute`, {
        method: "POST",
        body: JSON.stringify({ yieldAmount }),
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

  // LIQUIDITY POOL OPERATIONS

  async claimYield(contractId: string, participant: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/yield/pools/${contractId}/claim-yield`, {
        method: "POST",
        body: JSON.stringify({ participant }),
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

  async reinvestYield(contractId: string, participant: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/yield/pools/${contractId}/reinvest`, {
        method: "POST",
        body: JSON.stringify({ participant }),
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

  async distributeYieldToPool(
    contractId: string,
    yieldAmount: string,
    source: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/pools/${contractId}/distribute-yield`, {
        method: "POST",
        body: JSON.stringify({ yieldAmount, source }),
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

  async deployLiquidity(contractId: string, loanId: string, amount: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/pools/${contractId}/deploy`, {
        method: "POST",
        body: JSON.stringify({ loanId, amount }),
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

  async receiveRepayment(
    contractId: string,
    loanId: string,
    principalAmount: string,
    interestAmount: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/pools/${contractId}/receive-repayment`, {
        method: "POST",
        body: JSON.stringify({ loanId, principalAmount, interestAmount }),
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

  async updatePerformanceMetrics(contractId: string, newMetrics: any) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/pools/${contractId}/update-metrics`, {
        method: "POST",
        body: JSON.stringify({ newMetrics }),
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

  async rebalancePool(contractId: string, newStrategy: any) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/pools/${contractId}/rebalance`, {
        method: "POST",
        body: JSON.stringify({ newStrategy }),
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

  // LP TOKEN OPERATIONS

  async getLPTokens() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/yield/lp-tokens");

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

  async transferLPToken(contractId: string, newOwner: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/yield/lp-tokens/${contractId}/transfer`, {
        method: "POST",
        body: JSON.stringify({ newOwner }),
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

  async splitLPToken(contractId: string, amounts: string[]) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/lp-tokens/${contractId}/split`, {
        method: "POST",
        body: JSON.stringify({ amounts }),
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

  // STAKING OPERATIONS

  async unstake(contractId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/yield/staking/${contractId}/unstake`, {
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

  async accrueRewards(contractId: string, rewardAmount: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/staking/${contractId}/accrue`, {
        method: "POST",
        body: JSON.stringify({ rewardAmount }),
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

  // YIELD OPTIMIZERS

  async getYieldOptimizers() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/yield/optimizers");

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

  async optimizeYield(contractId: string, newAllocations: any) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/optimizers/${contractId}/optimize`, {
        method: "POST",
        body: JSON.stringify({ newAllocations }),
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

  async updateOptimizerStrategy(
    contractId: string,
    newStrategy: string,
    newTargetYield: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/optimizers/${contractId}/update-strategy`, {
        method: "POST",
        body: JSON.stringify({ newStrategy, newTargetYield }),
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

  async addManagedPool(contractId: string, poolId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/optimizers/${contractId}/add-pool`, {
        method: "POST",
        body: JSON.stringify({ poolId }),
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

  async removeManagedPool(contractId: string, poolId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/optimizers/${contractId}/remove-pool`, {
        method: "POST",
        body: JSON.stringify({ poolId }),
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

  // PERFORMANCE BONUSES

  async getPerformanceBonuses() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/yield/bonuses");

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

  async claimBonus(contractId: string, participant: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/bonuses/${contractId}/claim`, {
        method: "POST",
        body: JSON.stringify({ participant }),
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

  async markBonusDistributed(contractId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/yield/bonuses/${contractId}/mark-distributed`, {
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
}

export const yieldApi = new YieldApi();
