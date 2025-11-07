/**
 * Yield Generation Service
 *
 * Advanced liquidity pool and yield farming management with DAML integration including
 * automated market making, reward distribution, LP token management, and dynamic
 * yield optimization for decentralized lending protocol participants.
 */

import { DamlService, DamlResponse, DamlContract } from "./daml";
import { getTemplateId, DAML_CONFIG } from "../config/daml";
import { ConsoleLogger } from "../utils/logger";

export interface PoolParticipant {
  participant: string;
  contribution: string;
  lpTokens: string;
  joinedAt: string;
  lastRewardClaim: string;
  accumulatedYield: string;
}

export interface PoolPerformanceMetrics {
  currentAPY: string;
  totalReturn: string;
  sharpeRatio: string;
  volatility: string;
  maxDrawdown: string;
  utilizationRate: string;
}

export interface YieldStrategy {
  strategyType: string;
  targetAPY: string;
  riskLevel: string;
  rebalanceFrequency: string;
}

export interface RiskTolerance {
  level: string;
  maxDrawdown: string;
  minLiquidity: string;
}

export interface LiquidityPoolData {
  poolId: string;
  poolManager: string;
  poolName: string;
  poolStrategy: YieldStrategy;
  participants: PoolParticipant[];
  totalLiquidity: string;
  totalLPTokens: string;
  activeLoans: string[];
  totalDeployed: string;
  totalYieldEarned: string;
  performanceMetrics: PoolPerformanceMetrics;
  createdAt: string;
  lastRebalanceDate: string;
}

export interface LPTokenData {
  tokenId: string;
  poolId: string;
  owner: string;
  amount: string;
  poolManager: string;
}

export interface YieldOptimizerData {
  optimizerId: string;
  owner: string;
  strategy: YieldStrategy;
  managedPools: string[];
  totalValue: string;
  targetYield: string;
  riskTolerance: RiskTolerance;
  autoRebalance: boolean;
  lastOptimizationDate: string;
}

export interface StakingRewardsData {
  stakingId: string;
  poolId: string;
  staker: string;
  poolManager: string;
  stakedLPTokens: string;
  stakingStartDate: string;
  lockupPeriod: { microseconds: string };
  rewardRate: string;
  accumulatedRewards: string;
}

export interface PerformanceBonusData {
  bonusId: string;
  poolId: string;
  poolManager: string;
  participants: Array<[string, string]>;
  totalBonusPool: string;
  performancePeriodStart: string;
  performancePeriodEnd: string;
  distributed: boolean;
}

export class YieldService {
  private damlService: DamlService;

  constructor() {
    this.damlService = DamlService.getInstance();
  }

  async getLiquidityPools(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<LiquidityPoolData>[]>> {
    ConsoleLogger.info("Fetching liquidity pools");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("LiquidityPool")],
      },
      authToken
    );
  }

  async getLiquidityPoolById(
    poolId: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<LiquidityPoolData> | null>> {
    ConsoleLogger.info(`Fetching liquidity pool: ${poolId}`);

    const result = await this.damlService.queryContracts<LiquidityPoolData>(
      {
        templateIds: [getTemplateId("LiquidityPool")],
      },
      authToken
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

  async createLiquidityPool(
    poolData: LiquidityPoolData,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<LiquidityPoolData>>> {
    ConsoleLogger.info(`Creating liquidity pool: ${poolData.poolId}`);

    return this.damlService.createContract(
      {
        templateId: getTemplateId("LiquidityPool"),
        payload: poolData,
      },
      authToken
    );
  }

  async joinPool(
    contractId: string,
    participant: string,
    contributionAmount: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Joining pool: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LiquidityPool"),
        contractId,
        choice: DAML_CONFIG.choices.LiquidityPool.JoinPool,
        argument: {
          participant,
          contributionAmount,
        },
      },
      authToken
    );
  }

  async withdrawFromPool(
    contractId: string,
    participant: string,
    lpTokensToRedeem: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Withdrawing from pool: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LiquidityPool"),
        contractId,
        choice: DAML_CONFIG.choices.LiquidityPool.WithdrawFromPool,
        argument: {
          participant,
          lpTokensToRedeem,
        },
      },
      authToken
    );
  }

  async distributeYield(
    contractId: string,
    yieldAmount: string,
    source: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Distributing yield: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LiquidityPool"),
        contractId,
        choice: DAML_CONFIG.choices.LiquidityPool.DistributeYield,
        argument: {
          yieldAmount,
          source,
        },
      },
      authToken
    );
  }

  async claimYield(
    contractId: string,
    participant: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Claiming yield: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LiquidityPool"),
        contractId,
        choice: DAML_CONFIG.choices.LiquidityPool.ClaimYield,
        argument: {
          participant,
        },
      },
      authToken
    );
  }

  async reinvestYield(
    contractId: string,
    participant: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Reinvesting yield: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LiquidityPool"),
        contractId,
        choice: DAML_CONFIG.choices.LiquidityPool.ReinvestYield,
        argument: {
          participant,
        },
      },
      authToken
    );
  }

  async deployLiquidity(
    contractId: string,
    loanId: string,
    amount: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Deploying liquidity: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LiquidityPool"),
        contractId,
        choice: DAML_CONFIG.choices.LiquidityPool.DeployLiquidity,
        argument: {
          loanId,
          amount,
        },
      },
      authToken
    );
  }

  async receiveRepayment(
    contractId: string,
    loanId: string,
    principalAmount: string,
    interestAmount: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Receiving repayment: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LiquidityPool"),
        contractId,
        choice: DAML_CONFIG.choices.LiquidityPool.ReceiveRepayment,
        argument: {
          loanId,
          principalAmount,
          interestAmount,
        },
      },
      authToken
    );
  }

  async updatePerformanceMetrics(
    contractId: string,
    newMetrics: PoolPerformanceMetrics,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Updating performance metrics: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LiquidityPool"),
        contractId,
        choice: DAML_CONFIG.choices.LiquidityPool.UpdatePerformanceMetrics,
        argument: {
          newMetrics,
        },
      },
      authToken
    );
  }

  async rebalancePool(
    contractId: string,
    newStrategy: YieldStrategy,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Rebalancing pool: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LiquidityPool"),
        contractId,
        choice: DAML_CONFIG.choices.LiquidityPool.RebalancePool,
        argument: {
          newStrategy,
        },
      },
      authToken
    );
  }

  async getLPTokens(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<LPTokenData>[]>> {
    ConsoleLogger.info("Fetching LP tokens");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("LPToken")],
      },
      authToken
    );
  }

  async createLPToken(
    tokenData: LPTokenData,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<LPTokenData>>> {
    ConsoleLogger.info(`Creating LP token: ${tokenData.tokenId}`);

    return this.damlService.createContract(
      {
        templateId: getTemplateId("LPToken"),
        payload: tokenData,
      },
      authToken
    );
  }

  async transferLPToken(
    contractId: string,
    newOwner: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Transferring LP token: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LPToken"),
        contractId,
        choice: DAML_CONFIG.choices.LPToken.TransferLPToken,
        argument: {
          newOwner,
        },
      },
      authToken
    );
  }

  async splitLPToken(
    contractId: string,
    amounts: string[],
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Splitting LP token: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("LPToken"),
        contractId,
        choice: DAML_CONFIG.choices.LPToken.SplitLPToken,
        argument: {
          amounts,
        },
      },
      authToken
    );
  }

  async getYieldOptimizers(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<YieldOptimizerData>[]>> {
    ConsoleLogger.info("Fetching yield optimizers");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("YieldOptimizer")],
      },
      authToken
    );
  }

  async createYieldOptimizer(
    optimizerData: YieldOptimizerData,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<YieldOptimizerData>>> {
    ConsoleLogger.info(
      `Creating yield optimizer: ${optimizerData.optimizerId}`
    );

    return this.damlService.createContract(
      {
        templateId: getTemplateId("YieldOptimizer"),
        payload: optimizerData,
      },
      authToken
    );
  }

  async optimizeYield(
    contractId: string,
    newAllocations: Array<[string, string]>,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Optimizing yield: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("YieldOptimizer"),
        contractId,
        choice: DAML_CONFIG.choices.YieldOptimizer.OptimizeYield,
        argument: {
          newAllocations,
        },
      },
      authToken
    );
  }

  async updateStrategy(
    contractId: string,
    newStrategy: YieldStrategy,
    newTargetYield: string,
    newRiskTolerance: RiskTolerance,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Updating optimizer strategy: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("YieldOptimizer"),
        contractId,
        choice: DAML_CONFIG.choices.YieldOptimizer.UpdateStrategy,
        argument: {
          newStrategy,
          newTargetYield,
          newRiskTolerance,
        },
      },
      authToken
    );
  }

  async addManagedPool(
    contractId: string,
    poolId: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Adding managed pool: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("YieldOptimizer"),
        contractId,
        choice: DAML_CONFIG.choices.YieldOptimizer.AddManagedPool,
        argument: {
          poolId,
        },
      },
      authToken
    );
  }

  async removeManagedPool(
    contractId: string,
    poolId: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Removing managed pool: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("YieldOptimizer"),
        contractId,
        choice: DAML_CONFIG.choices.YieldOptimizer.RemoveManagedPool,
        argument: {
          poolId,
        },
      },
      authToken
    );
  }

  async getStakingRewards(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<StakingRewardsData>[]>> {
    ConsoleLogger.info("Fetching staking rewards");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("StakingRewards")],
      },
      authToken
    );
  }

  async createStakingRewards(
    stakingData: StakingRewardsData,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<StakingRewardsData>>> {
    ConsoleLogger.info(`Creating staking rewards: ${stakingData.stakingId}`);

    return this.damlService.createContract(
      {
        templateId: getTemplateId("StakingRewards"),
        payload: stakingData,
      },
      authToken
    );
  }

  async claimStakingRewards(
    contractId: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Claiming staking rewards: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("StakingRewards"),
        contractId,
        choice: DAML_CONFIG.choices.StakingRewards.ClaimStakingRewards,
        argument: {},
      },
      authToken
    );
  }

  async unstake(
    contractId: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Unstaking: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("StakingRewards"),
        contractId,
        choice: DAML_CONFIG.choices.StakingRewards.Unstake,
        argument: {},
      },
      authToken
    );
  }

  async accrueRewards(
    contractId: string,
    rewardAmount: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Accruing rewards: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("StakingRewards"),
        contractId,
        choice: DAML_CONFIG.choices.StakingRewards.AccrueRewards,
        argument: {
          rewardAmount,
        },
      },
      authToken
    );
  }

  async getPerformanceBonuses(
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<PerformanceBonusData>[]>> {
    ConsoleLogger.info("Fetching performance bonuses");
    return this.damlService.queryContracts(
      {
        templateIds: [getTemplateId("PerformanceBonus")],
      },
      authToken
    );
  }

  async createPerformanceBonus(
    bonusData: PerformanceBonusData,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<DamlContract<PerformanceBonusData>>> {
    ConsoleLogger.info(`Creating performance bonus: ${bonusData.bonusId}`);

    return this.damlService.createContract(
      {
        templateId: getTemplateId("PerformanceBonus"),
        payload: bonusData,
      },
      authToken
    );
  }

  async claimBonus(
    contractId: string,
    participant: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Claiming bonus: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("PerformanceBonus"),
        contractId,
        choice: DAML_CONFIG.choices.PerformanceBonus.ClaimBonus,
        argument: {
          participant,
        },
      },
      authToken
    );
  }

  async markDistributed(
    contractId: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    ConsoleLogger.info(`Marking bonus as distributed: ${contractId}`);

    return this.damlService.exerciseChoice(
      {
        templateId: getTemplateId("PerformanceBonus"),
        contractId,
        choice: DAML_CONFIG.choices.PerformanceBonus.MarkDistributed,
        argument: {},
      },
      authToken
    );
  }

  // Alias methods for route compatibility
  async updateOptimizerStrategy(
    contractId: string,
    newStrategy: YieldStrategy,
    newTargetYield: string,
    authToken: string,
    user?: any
  ): Promise<DamlResponse<any>> {
    const defaultRiskTolerance: RiskTolerance = {
      level: "Moderate",
      maxDrawdown: "0.15",
      minLiquidity: "0.10",
    };

    return this.updateStrategy(
      contractId,
      newStrategy,
      newTargetYield,
      defaultRiskTolerance,
      authToken
    );
  }

  async markBonusDistributed(
    contractId: string,
    authToken: string
  ): Promise<DamlResponse<any>> {
    return this.markDistributed(contractId, authToken);
  }

  calculateUtilizationRate(
    totalDeployed: number,
    totalLiquidity: number
  ): number {
    if (totalLiquidity === 0) return 0;
    return totalDeployed / totalLiquidity;
  }

  calculateAPY(
    yieldEarned: number,
    principal: number,
    daysElapsed: number
  ): number {
    if (principal === 0 || daysElapsed === 0) return 0;
    const periodReturn = yieldEarned / principal;
    const yearsElapsed = daysElapsed / 365;
    return periodReturn / yearsElapsed;
  }

  calculatePoolShare(
    participantLPTokens: number,
    totalLPTokens: number
  ): number {
    if (totalLPTokens === 0) return 0;
    return participantLPTokens / totalLPTokens;
  }

  calculateLPTokensToIssue(
    contributionAmount: number,
    totalLiquidity: number,
    totalLPTokens: number
  ): number {
    if (totalLiquidity === 0) {
      return contributionAmount;
    }
    return (contributionAmount / totalLiquidity) * totalLPTokens;
  }

  calculateWithdrawalAmount(
    lpTokensToRedeem: number,
    totalLPTokens: number,
    totalLiquidity: number
  ): number {
    if (totalLPTokens === 0) return 0;
    return (lpTokensToRedeem / totalLPTokens) * totalLiquidity;
  }
}
