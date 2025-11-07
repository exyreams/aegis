/**
 * Yield Generation Routes
 *
 * Liquidity pool and yield farming management with DAML integration including
 * pool creation, liquidity provision, yield distribution, and automated
 * market making for decentralized lending protocols.
 */

import { Hono } from "hono";
import { YieldService } from "../services/yield";
import { ConsoleLogger } from "../utils/logger";
import { requireAuth } from "../middleware/auth";
import { auth } from "../lib/auth";
import { generateDamlToken } from "../utils/daml-token";

const yieldRoutes = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const yieldService = new YieldService();

yieldRoutes.use("*", requireAuth);

yieldRoutes.get("/pools", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.getLiquidityPools(authToken, user);

    if (result.status === 200) {
      const contracts = Array.isArray(result.result) ? result.result : [];
      return c.json({
        success: true,
        data: contracts.map((contract) => ({
          contractId: contract.contractId,
          ...contract.payload,
        })),
      });
    }

    return c.json(
      { success: false, error: "Failed to fetch liquidity pools" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get liquidity pools error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

yieldRoutes.get("/pools/:poolId", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const poolId = c.req.param("poolId");
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.getLiquidityPoolById(poolId, authToken, user);

    if (result.status === 200) {
      if (result.result) {
        return c.json({
          success: true,
          data: {
            contractId: result.result.contractId,
            ...result.result.payload,
          },
        });
      }
      return c.json({ success: false, error: "Pool not found" }, 404);
    }

    return c.json(
      { success: false, error: "Failed to fetch liquidity pool" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get liquidity pool error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

yieldRoutes.post("/pools", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.createLiquidityPool(body, authToken, user);

    if (result.status === 200 && result.result) {
      return c.json(
        {
          success: true,
          data: {
            contractId: result.result.contractId,
            ...result.result.payload,
          },
        },
        201
      );
    }

    return c.json(
      { success: false, error: "Failed to create liquidity pool" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Create liquidity pool error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

yieldRoutes.post("/pools/:contractId/join", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.joinPool(
      contractId,
      body.participant,
      body.contributionAmount,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Joined pool successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to join pool" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Join pool error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

yieldRoutes.post("/pools/:contractId/withdraw", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.withdrawFromPool(
      contractId,
      body.participant,
      body.lpTokensToRedeem,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Withdrawal successful",
      });
    }

    return c.json(
      { success: false, error: "Failed to withdraw from pool" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Withdraw from pool error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

yieldRoutes.post("/pools/:contractId/claim-yield", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.claimYield(
      contractId,
      body.participant,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Yield claimed successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to claim yield" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Claim yield error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

yieldRoutes.post("/pools/:contractId/reinvest", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.reinvestYield(
      contractId,
      body.participant,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Yield reinvested successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to reinvest yield" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Reinvest yield error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

yieldRoutes.get("/lp-tokens", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.getLPTokens(authToken, user);

    if (result.status === 200) {
      const contracts = Array.isArray(result.result) ? result.result : [];
      return c.json({
        success: true,
        data: contracts.map((contract) => ({
          contractId: contract.contractId,
          ...contract.payload,
        })),
      });
    }

    return c.json(
      { success: false, error: "Failed to fetch LP tokens" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get LP tokens error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

yieldRoutes.post("/lp-tokens/:contractId/transfer", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.transferLPToken(
      contractId,
      body.newOwner,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "LP token transferred successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to transfer LP token" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Transfer LP token error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

yieldRoutes.get("/staking", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.getStakingRewards(authToken, user);

    if (result.status === 200) {
      const contracts = Array.isArray(result.result) ? result.result : [];
      return c.json({
        success: true,
        data: contracts.map((contract) => ({
          contractId: contract.contractId,
          ...contract.payload,
        })),
      });
    }

    return c.json(
      { success: false, error: "Failed to fetch staking rewards" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get staking rewards error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

yieldRoutes.post("/staking/:contractId/claim", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.claimStakingRewards(
      contractId,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Staking rewards claimed successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to claim staking rewards" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Claim staking rewards error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

yieldRoutes.post("/staking/:contractId/unstake", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.unstake(contractId, authToken, user);

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Unstaked successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to unstake" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Unstake error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Distribute yield to pool participants
yieldRoutes.post("/pools/:contractId/distribute-yield", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.distributeYield(
      contractId,
      body.yieldAmount,
      body.source,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Yield distributed successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to distribute yield" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Distribute yield error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Deploy liquidity to fund a loan
yieldRoutes.post("/pools/:contractId/deploy", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.deployLiquidity(
      contractId,
      body.loanId,
      body.amount,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Liquidity deployed successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to deploy liquidity" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Deploy liquidity error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Receive repayment from loan
yieldRoutes.post("/pools/:contractId/receive-repayment", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.receiveRepayment(
      contractId,
      body.loanId,
      body.principalAmount,
      body.interestAmount,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Repayment received successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to receive repayment" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Receive repayment error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Update pool performance metrics
yieldRoutes.post("/pools/:contractId/update-metrics", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.updatePerformanceMetrics(
      contractId,
      body.newMetrics,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Performance metrics updated successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to update metrics" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Update metrics error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Rebalance pool
yieldRoutes.post("/pools/:contractId/rebalance", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.rebalancePool(
      contractId,
      body.newStrategy,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Pool rebalanced successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to rebalance pool" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Rebalance pool error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Split LP token
yieldRoutes.post("/lp-tokens/:contractId/split", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.splitLPToken(
      contractId,
      body.amounts,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "LP token split successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to split LP token" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Split LP token error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Get yield optimizers
yieldRoutes.get("/optimizers", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.getYieldOptimizers(authToken, user);

    if (result.status === 200) {
      const contracts = Array.isArray(result.result) ? result.result : [];
      return c.json({
        success: true,
        data: contracts.map((contract: any) => ({
          contractId: contract.contractId,
          ...(contract.payload || {}),
        })),
      });
    }

    return c.json(
      { success: false, error: "Failed to fetch optimizers" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get optimizers error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Optimize yield
yieldRoutes.post("/optimizers/:contractId/optimize", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.optimizeYield(
      contractId,
      body.newAllocations,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Yield optimized successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to optimize yield" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Optimize yield error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Update optimizer strategy
yieldRoutes.post("/optimizers/:contractId/update-strategy", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.updateOptimizerStrategy(
      contractId,
      body.newStrategy,
      body.newTargetYield,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Strategy updated successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to update strategy" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Update strategy error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Add managed pool to optimizer
yieldRoutes.post("/optimizers/:contractId/add-pool", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.addManagedPool(
      contractId,
      body.poolId,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Pool added successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to add pool" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Add pool error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Remove managed pool from optimizer
yieldRoutes.post("/optimizers/:contractId/remove-pool", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.removeManagedPool(
      contractId,
      body.poolId,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Pool removed successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to remove pool" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Remove pool error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Accrue staking rewards
yieldRoutes.post("/staking/:contractId/accrue", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.accrueRewards(
      contractId,
      body.rewardAmount,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Rewards accrued successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to accrue rewards" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Accrue rewards error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Get performance bonuses
yieldRoutes.get("/bonuses", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.getPerformanceBonuses(authToken, user);

    if (result.status === 200) {
      const contracts = Array.isArray(result.result) ? result.result : [];
      return c.json({
        success: true,
        data: contracts.map((contract: any) => ({
          contractId: contract.contractId,
          ...(contract.payload || {}),
        })),
      });
    }

    return c.json(
      { success: false, error: "Failed to fetch bonuses" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get bonuses error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Claim performance bonus
yieldRoutes.post("/bonuses/:contractId/claim", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const body = await c.req.json();
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.claimBonus(
      contractId,
      body.participant,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Bonus claimed successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to claim bonus" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Claim bonus error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Mark bonus as distributed
yieldRoutes.post("/bonuses/:contractId/mark-distributed", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const contractId = c.req.param("contractId");
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await yieldService.markBonusDistributed(
      contractId,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Bonus marked as distributed",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to mark bonus as distributed" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Mark distributed error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

export { yieldRoutes };

