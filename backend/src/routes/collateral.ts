/**
 * Collateral Management Routes
 *
 * DAML-integrated endpoints for collateral pool management, valuation updates,
 * margin calls, liquidation processes, and collateral monitoring.
 */

import { Hono } from "hono";
import { CollateralService } from "../services/collateral";
import { ConsoleLogger } from "../utils/logger";
import { requireAuth } from "../middleware/auth";
import { auth } from "../lib/auth";
import { generateDamlToken } from "../utils/daml-token";

const collateral = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const collateralService = new CollateralService();

collateral.use("*", requireAuth);
collateral.get("/pools", async (c) => {
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
    const result = await collateralService.getCollateralPools(authToken, user);

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
      { success: false, error: "Failed to fetch collateral pools" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get collateral pools error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

collateral.get("/pools/:poolId", async (c) => {
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
    const result = await collateralService.getCollateralPoolById(
      poolId,
      authToken,
      user
    );

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
      { success: false, error: "Failed to fetch collateral pool" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get collateral pool error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

collateral.post("/pools", async (c) => {
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
    const result = await collateralService.createCollateralPool(
      body,
      authToken,
      user
    );

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
      { success: false, error: "Failed to create collateral pool" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Create collateral pool error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

collateral.post("/pools/:contractId/update-valuation", async (c) => {
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
    const result = await collateralService.updateValuation(
      contractId,
      body.newAssetValues,
      body.valuationSource,
      authToken,
      user
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Valuation updated successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to update valuation" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Update valuation error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

collateral.post("/pools/:contractId/margin-call", async (c) => {
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
    const result = await collateralService.triggerMarginCall(
      contractId,
      body.deadline,
      body.requiredAmount,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Margin call triggered successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to trigger margin call" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Trigger margin call error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

collateral.post("/pools/:contractId/respond-margin-call", async (c) => {
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
    const result = await collateralService.respondToMarginCall(
      contractId,
      body.additionalAssets,
      authToken,
      user
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Margin call response submitted successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to respond to margin call" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Respond to margin call error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

collateral.post("/pools/:contractId/liquidate", async (c) => {
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
    const result = await collateralService.initiateLiquidation(
      contractId,
      body.reason,
      authToken,
      user
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Liquidation initiated successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to initiate liquidation" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Initiate liquidation error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// COLLATERAL POOL - ADDITIONAL CHOICES

// Request emergency liquidity support from Aegis platform
collateral.post("/pools/:contractId/request-emergency-support", async (c) => {
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
    const result = await collateralService.requestEmergencySupport(
      contractId,
      body.platformCid,
      body.supportAmount,
      body.assetType,
      body.repaymentTerms,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Emergency support requested successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to request emergency support" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Request emergency support error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Request collateral substitution
collateral.post("/pools/:contractId/request-substitution", async (c) => {
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
    const result = await collateralService.requestSubstitution(
      contractId,
      body.assetToRemove,
      body.assetToAdd,
      body.reason,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Substitution request created successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to request substitution" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Request substitution error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Release collateral (when loan is repaid)
collateral.post("/pools/:contractId/release", async (c) => {
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
    const result = await collateralService.releaseCollateral(
      contractId,
      authToken,
      user
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Collateral released successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to release collateral" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Release collateral error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Partial collateral release
collateral.post("/pools/:contractId/partial-release", async (c) => {
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
    const result = await collateralService.partialRelease(
      contractId,
      body.assetIdsToRelease,
      authToken,
      user
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Partial collateral release successful",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to partially release collateral" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Partial release error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// SUBSTITUTION REQUEST ENDPOINTS

// Get substitution requests
collateral.get("/substitution-requests", async (c) => {
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
    const result = await collateralService.getSubstitutionRequests(
      authToken,
      user
    );

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
      { success: false, error: "Failed to fetch substitution requests" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get substitution requests error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Approve substitution request
collateral.post("/substitution-requests/:contractId/approve", async (c) => {
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
    const result = await collateralService.approveSubstitution(
      contractId,
      authToken,
      user
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Substitution approved successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to approve substitution" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Approve substitution error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Reject substitution request
collateral.post("/substitution-requests/:contractId/reject", async (c) => {
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
    const result = await collateralService.rejectSubstitution(
      contractId,
      body.rejectionReason,
      authToken,
      user
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Substitution rejected successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to reject substitution" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Reject substitution error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// LIQUIDATION ENDPOINTS

// Get liquidations
collateral.get("/liquidations", async (c) => {
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
    const result = await collateralService.getLiquidations(authToken, user);

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
      { success: false, error: "Failed to fetch liquidations" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get liquidations error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Execute liquidation
collateral.post("/liquidations/:contractId/execute", async (c) => {
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
    const result = await collateralService.executeLiquidation(
      contractId,
      body.liquidationProceeds,
      body.liquidationCosts,
      body.platformCid,
      body.assetType,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Liquidation executed successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to execute liquidation" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Execute liquidation error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Cancel liquidation
collateral.post("/liquidations/:contractId/cancel", async (c) => {
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
    const result = await collateralService.cancelLiquidation(
      contractId,
      body.cancellationReason,
      authToken,
      user
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Liquidation cancelled successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to cancel liquidation" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Cancel liquidation error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// SETTLEMENT ENDPOINTS

// Get settlements
collateral.get("/settlements", async (c) => {
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
    const result = await collateralService.getSettlements(authToken, user);

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
      { success: false, error: "Failed to fetch settlements" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get settlements error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Acknowledge settlement
collateral.post("/settlements/:contractId/acknowledge", async (c) => {
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
    const result = await collateralService.acknowledgeSettlement(
      contractId,
      authToken,
      user
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Settlement acknowledged successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to acknowledge settlement" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Acknowledge settlement error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

export { collateral };
