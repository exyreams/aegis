/**
 * Aegis Platform Routes
 *
 * Platform treasury management, lender funding, asset authorization,
 * and central platform operations for the Aegis RFQ system.
 */

import { Hono } from "hono";
import { z } from "zod";
import { AegisService } from "../services/aegis";
import { ConsoleLogger } from "../utils/logger";
import { requireAuth, requireRole } from "../middleware/auth";
import { auth } from "../lib/auth";

const aegis = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const aegisService = AegisService.getInstance();

// Apply auth middleware to all routes
aegis.use("*", requireAuth);

// VALIDATION SCHEMAS

const AssetTypeSchema = z.union([
  z.object({ tag: z.literal("Cryptocurrency"), value: z.string() }),
  z.object({ tag: z.literal("Stablecoin"), value: z.string() }),
  z.object({ tag: z.literal("FiatCurrency"), value: z.string() }),
  z.object({ tag: z.literal("GovernmentBond"), value: z.string() }),
  z.object({ tag: z.literal("CorporateBond"), value: z.string() }),
  z.object({ tag: z.literal("Equity"), value: z.string() }),
  z.object({ tag: z.literal("RealEstateToken"), value: z.string() }),
  z.object({ tag: z.literal("Commodity"), value: z.string() }),
]);

const MintToTreasurySchema = z.object({
  assetType: AssetTypeSchema,
  mintAmount: z.string(),
  mintReason: z.string(),
});

const BulkMintSchema = z.object({
  mintingPlan: z.array(
    z.object({
      assetType: AssetTypeSchema,
      amount: z.string(),
    })
  ),
  bulkReason: z.string(),
});

const RegisterLenderSchema = z.object({
  newLender: z.string(),
  assetType: AssetTypeSchema,
});

const AdminFundLenderSchema = z.object({
  lender: z.string(),
  assetType: AssetTypeSchema,
  fundingAmount: z.string(),
  fundingReason: z.string(),
});

const ReimburseLenderSchema = z.object({
  lender: z.string(),
  assetType: AssetTypeSchema,
  amount: z.string(),
  reimbursementReason: z.string(),
});

const AuthorizeAssetsSchema = z.object({
  newAssets: z.array(AssetTypeSchema),
  authorizationReason: z.string(),
});

const UpdateFeeRateSchema = z.object({
  newFeeRate: z.string(),
  updateReason: z.string(),
});

const LiquiditySupportSchema = z.object({
  lender: z.string(),
  assetType: AssetTypeSchema,
  supportAmount: z.string(),
  supportReason: z.string(),
  repaymentTerms: z.object({
    interestRate: z.string(),
    repaymentDeadline: z.string(),
    collateralRequired: z.boolean(),
  }),
});

// PLATFORM CREATION & QUERY ROUTES

// Create Aegis Platform (Admin only - requires platform, emergency operator, and compliance officer)
const CreatePlatformSchema = z.object({
  platform: z.string(),
  emergencyOperator: z.string(),
  complianceOfficer: z.string(),
  authorizedAssets: z.array(AssetTypeSchema),
  platformFeeRate: z.string(),
});

aegis.post("/platform", requireRole("admin"), async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const authToken = "user-token"; // Placeholder to trigger user-based token generation

  try {
    const body = await c.req.json();
    const validated = CreatePlatformSchema.parse(body);

    // Convert fee rate from percentage to decimal (e.g., 0.5% -> 0.005)
    const feeRateDecimal = (
      parseFloat(validated.platformFeeRate) / 100
    ).toString();

    // Validate fee rate is within DAML constraints (0% to 10%)
    const feeRateNum = parseFloat(feeRateDecimal);
    if (feeRateNum < 0 || feeRateNum > 0.1) {
      return c.json(
        {
          success: false,
          error: "Platform fee rate must be between 0% and 10%",
        },
        400
      );
    }

    // Create initial empty treasury
    const initialTreasury = {
      treasuryBalances: [],
      reserveRatio: "0.15",
      lastAuditDate: new Date().toISOString(),
    };

    const result = await aegisService.createPlatform(
      {
        platform: validated.platform,
        treasury: initialTreasury,
        authorizedAssets: validated.authorizedAssets,
        platformFeeRate: feeRateDecimal,
        emergencyOperator: validated.emergencyOperator,
        complianceOfficer: validated.complianceOfficer,
        totalLoansOriginated: "0.0",
        totalFeesCollected: "0.0",
        activeLenders: [],
        platformStatus: "PlatformActive" as any,
      },
      authToken,
      user
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/aegis/platform",
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Aegis Platform created successfully", {
        platform: validated.platform,
      });
      return c.json({
        success: true,
        result: result.result,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to create platform",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Create platform error", error);
    ConsoleLogger.request("POST", "/api/aegis/platform", 500, duration);

    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        400
      );
    }

    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Get platform details
aegis.get("/platform", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const authToken = "user-token"; // Placeholder to trigger user-based token generation

  try {
    const result = await aegisService.queryPlatform(authToken, user);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/aegis/platform",
      result.status,
      duration
    );

    if (result.status === 200 && result.result) {
      const platformContract = result.result[0];
      return c.json({
        success: true,
        data: {
          platform: platformContract
            ? {
                ...platformContract.payload,
                contractId: platformContract.contractId,
              }
            : null,
        },
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch platform",
        data: null,
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get platform error", error);
    ConsoleLogger.request("GET", "/api/aegis/platform", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Get asset balances
aegis.get("/balances", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;
  const owner = c.req.query("owner");

  try {
    const result = await aegisService.queryAssetBalances(authToken, owner);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/aegis/balances",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        balances: result.result || [],
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch balances",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get balances error", error);
    ConsoleLogger.request("GET", "/api/aegis/balances", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Get liquidity support records
aegis.get("/liquidity-support", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;
  const lender = c.req.query("lender");

  try {
    const result = await aegisService.queryLiquiditySupport(authToken, lender);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/aegis/liquidity-support",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        supports: result.result || [],
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch liquidity support",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get liquidity support error", error);
    ConsoleLogger.request("GET", "/api/aegis/liquidity-support", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// TREASURY MANAGEMENT ROUTES

// Mint funds to treasury (Admin only - platform owner)
aegis.post("/platform/:contractId/mint", requireRole("admin"), async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const user = c.get("user");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const validated = MintToTreasurySchema.parse(body);

    const result = await aegisService.mintToTreasury(
      contractId,
      validated.assetType,
      validated.mintAmount,
      validated.mintReason,
      user?.damlParty || "",
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/aegis/platform/:id/mint",
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Treasury minted successfully", {
        amount: validated.mintAmount,
        asset: validated.assetType,
      });
      return c.json({
        success: true,
        result: result.result,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to mint treasury",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Mint treasury error", error);
    ConsoleLogger.request(
      "POST",
      "/api/aegis/platform/:id/mint",
      500,
      duration
    );

    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        400
      );
    }

    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Bulk mint to treasury (Admin only - platform owner)
aegis.post(
  "/platform/:contractId/bulk-mint",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const validated = BulkMintSchema.parse(body);

      const mintingPlan = validated.mintingPlan.map(
        (item) => [item.assetType, item.amount] as [any, string]
      );

      const result = await aegisService.bulkMintToTreasury(
        contractId,
        mintingPlan,
        validated.bulkReason,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/bulk-mint",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Bulk treasury mint successful", {
          assets: validated.mintingPlan.length,
        });
        return c.json({
          success: true,
          result: result.result,
        });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to bulk mint",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Bulk mint error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/bulk-mint",
        500,
        duration
      );

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: "Validation error",
            details: error.issues,
          },
          400
        );
      }

      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// LENDER MANAGEMENT ROUTES

// Register new lender (Admin only - platform owner)
aegis.post(
  "/platform/:contractId/register-lender",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const validated = RegisterLenderSchema.parse(body);

      const result = await aegisService.registerNewLender(
        contractId,
        validated.newLender,
        validated.assetType,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/register-lender",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Lender registered successfully", {
          lender: validated.newLender,
        });
        return c.json({
          success: true,
          result: result.result,
        });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to register lender",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Register lender error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/register-lender",
        500,
        duration
      );

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: "Validation error",
            details: error.issues,
          },
          400
        );
      }

      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Admin fund lender (Admin only - requires emergency operator or compliance officer)
aegis.post(
  "/platform/:contractId/fund-lender",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const user = c.get("user");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const validated = AdminFundLenderSchema.parse(body);

      const result = await aegisService.adminFundLender(
        contractId,
        validated.lender,
        validated.assetType,
        validated.fundingAmount,
        validated.fundingReason,
        user?.damlParty || "",
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/fund-lender",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Lender funded successfully", {
          lender: validated.lender,
          amount: validated.fundingAmount,
        });
        return c.json({
          success: true,
          result: result.result,
        });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to fund lender",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Fund lender error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/fund-lender",
        500,
        duration
      );

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: "Validation error",
            details: error.issues,
          },
          400
        );
      }

      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Reimburse lender (Admin only - requires emergency operator or compliance officer approval)
aegis.post(
  "/platform/:contractId/reimburse-lender",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const user = c.get("user");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const validated = ReimburseLenderSchema.parse(body);

      const result = await aegisService.reimburseLender(
        contractId,
        validated.lender,
        validated.assetType,
        validated.amount,
        validated.reimbursementReason,
        user?.damlParty || "",
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/reimburse-lender",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Lender reimbursed successfully", {
          lender: validated.lender,
          amount: validated.amount,
        });
        return c.json({
          success: true,
          result: result.result,
        });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to reimburse lender",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Reimburse lender error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/reimburse-lender",
        500,
        duration
      );

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: "Validation error",
            details: error.issues,
          },
          400
        );
      }

      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// ASSET AUTHORIZATION ROUTES

// Authorize new assets (Admin only - requires platform and compliance officer)
aegis.post(
  "/platform/:contractId/authorize-assets",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const validated = AuthorizeAssetsSchema.parse(body);

      const result = await aegisService.authorizeNewAssets(
        contractId,
        validated.newAssets,
        validated.authorizationReason,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/authorize-assets",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Assets authorized successfully", {
          count: validated.newAssets.length,
        });
        return c.json({
          success: true,
          result: result.result,
        });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to authorize assets",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Authorize assets error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/authorize-assets",
        500,
        duration
      );

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: "Validation error",
            details: error.issues,
          },
          400
        );
      }

      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Update platform fee rate (Admin only - requires platform and compliance officer)
aegis.post(
  "/platform/:contractId/update-fee-rate",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const user = c.get("user");
    const authToken = "user-token"; // Placeholder to trigger user-based token generation
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const validated = UpdateFeeRateSchema.parse(body);

      // Convert fee rate from percentage to decimal (e.g., 0.5% -> 0.005)
      const feeRateDecimal = (
        parseFloat(validated.newFeeRate) / 100
      ).toString();

      // Validate fee rate is within DAML constraints (0% to 10%)
      const feeRateNum = parseFloat(feeRateDecimal);
      if (feeRateNum < 0 || feeRateNum > 0.1) {
        return c.json(
          {
            success: false,
            error: "Platform fee rate must be between 0% and 10%",
          },
          400
        );
      }

      const result = await aegisService.updatePlatformFeeRate(
        contractId,
        feeRateDecimal,
        validated.updateReason,
        authToken,
        user
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/update-fee-rate",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Fee rate updated successfully", {
          newRate: validated.newFeeRate,
        });
        return c.json({
          success: true,
          result: result.result,
        });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to update fee rate",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Update fee rate error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/update-fee-rate",
        500,
        duration
      );

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: "Validation error",
            details: error.issues,
          },
          400
        );
      }

      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// LIQUIDITY SUPPORT ROUTES

// Provide liquidity support (Admin only - platform owner)
aegis.post(
  "/platform/:contractId/liquidity-support",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const validated = LiquiditySupportSchema.parse(body);

      const result = await aegisService.provideLiquiditySupport(
        contractId,
        validated.lender,
        validated.assetType,
        validated.supportAmount,
        validated.supportReason,
        validated.repaymentTerms,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/liquidity-support",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Liquidity support provided", {
          lender: validated.lender,
          amount: validated.supportAmount,
        });
        return c.json({
          success: true,
          result: result.result,
        });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to provide liquidity support",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Liquidity support error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/liquidity-support",
        500,
        duration
      );

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: "Validation error",
            details: error.issues,
          },
          400
        );
      }

      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Repay liquidity support
aegis.post("/liquidity-support/:contractId/repay", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const { repaymentAmount } = body;

    if (!repaymentAmount) {
      return c.json(
        {
          success: false,
          error: "repaymentAmount is required",
        },
        400
      );
    }

    const result = await aegisService.repaySupport(
      contractId,
      repaymentAmount,
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/aegis/liquidity-support/:id/repay",
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Liquidity support repaid", {
        amount: repaymentAmount,
      });
      return c.json({
        success: true,
        result: result.result,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to repay support",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Repay support error", error);
    ConsoleLogger.request(
      "POST",
      "/api/aegis/liquidity-support/:id/repay",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// ASSET BALANCE ROUTES

// Receive funds
aegis.post("/balances/:contractId/receive", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const { amount, sender, receiptReason } = body;

    if (!amount || !sender || !receiptReason) {
      return c.json(
        {
          success: false,
          error: "amount, sender, and receiptReason are required",
        },
        400
      );
    }

    const result = await aegisService.receiveFunds(
      contractId,
      amount,
      sender,
      receiptReason,
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/aegis/balances/:id/receive",
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Funds received", { amount });
      return c.json({
        success: true,
        result: result.result,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to receive funds",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Receive funds error", error);
    ConsoleLogger.request(
      "POST",
      "/api/aegis/balances/:id/receive",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Lock funds
aegis.post("/balances/:contractId/lock", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const { amount, purpose, lockDuration } = body;

    if (!amount || !purpose || !lockDuration) {
      return c.json(
        {
          success: false,
          error: "amount, purpose, and lockDuration are required",
        },
        400
      );
    }

    const result = await aegisService.lockFunds(
      contractId,
      amount,
      purpose,
      lockDuration,
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/aegis/balances/:id/lock",
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Funds locked", { amount });
      return c.json({
        success: true,
        result: result.result,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to lock funds",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Lock funds error", error);
    ConsoleLogger.request(
      "POST",
      "/api/aegis/balances/:id/lock",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// MISSING PLATFORM CHOICES - ADDING NOW

// Emergency mint (Emergency operator only)
aegis.post(
  "/platform/:contractId/emergency-mint",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { assetType, emergencyAmount, emergencyReason } = body;

      const result = await aegisService.emergencyMint(
        contractId,
        assetType,
        emergencyAmount,
        emergencyReason,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/emergency-mint",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Emergency mint successful", {
          amount: emergencyAmount,
        });
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to emergency mint",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Emergency mint error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/emergency-mint",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Deauthorize assets
aegis.post(
  "/platform/:contractId/deauthorize-assets",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { assetsToRemove, deauthorizationReason } = body;

      const result = await aegisService.deauthorizeAssets(
        contractId,
        assetsToRemove,
        deauthorizationReason,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/deauthorize-assets",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Assets deauthorized", {
          count: assetsToRemove.length,
        });
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to deauthorize assets",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Deauthorize assets error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/deauthorize-assets",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Collect platform fee from loan
aegis.post(
  "/platform/:contractId/collect-fee",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { loanId, loanAmount, lender, assetType } = body;

      const result = await aegisService.collectPlatformFee(
        contractId,
        loanId,
        loanAmount,
        lender,
        assetType,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/collect-fee",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Platform fee collected", { loanId });
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to collect fee",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Collect fee error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/collect-fee",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Collect secondary market fee
aegis.post(
  "/platform/:contractId/collect-secondary-fee",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { transferId, transferAmount, seller, buyer, assetType } = body;

      const result = await aegisService.collectSecondaryMarketFee(
        contractId,
        transferId,
        transferAmount,
        seller,
        buyer,
        assetType,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/collect-secondary-fee",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Secondary market fee collected", { transferId });
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to collect secondary fee",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Collect secondary fee error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/collect-secondary-fee",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Collect syndication fee
aegis.post(
  "/platform/:contractId/collect-syndication-fee",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { loanId, loanAmount, leadLender, participantCount, assetType } =
        body;

      const result = await aegisService.collectSyndicationFee(
        contractId,
        loanId,
        loanAmount,
        leadLender,
        participantCount,
        assetType,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/collect-syndication-fee",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Syndication fee collected", { loanId });
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to collect syndication fee",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Collect syndication fee error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/collect-syndication-fee",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Register liquidity pool
aegis.post(
  "/platform/:contractId/register-pool",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { poolId, poolManager, initialLiquidity, assetType } = body;

      const result = await aegisService.registerLiquidityPool(
        contractId,
        poolId,
        poolManager,
        initialLiquidity,
        assetType,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/register-pool",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Pool registered", { poolId });
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to register pool",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Register pool error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/register-pool",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Collect pool management fee
aegis.post(
  "/platform/:contractId/collect-pool-fee",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { poolId, poolManager, managementFee, totalLiquidity, assetType } =
        body;

      const result = await aegisService.collectPoolManagementFee(
        contractId,
        poolId,
        poolManager,
        managementFee,
        totalLiquidity,
        assetType,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/collect-pool-fee",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Pool management fee collected", { poolId });
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to collect pool fee",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Collect pool fee error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/collect-pool-fee",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Provide pool performance bonus
aegis.post(
  "/platform/:contractId/pool-bonus",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { poolId, poolManager, bonusAmount, performanceMetric, assetType } =
        body;

      const result = await aegisService.providePoolPerformanceBonus(
        contractId,
        poolId,
        poolManager,
        bonusAmount,
        performanceMetric,
        assetType,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/pool-bonus",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Pool bonus provided", {
          poolId,
          amount: bonusAmount,
        });
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to provide bonus",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Pool bonus error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/pool-bonus",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Inject treasury funds
aegis.post(
  "/platform/:contractId/inject-funds",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { assetType, injectionAmount, injectionReason } = body;

      const result = await aegisService.injectTreasuryFunds(
        contractId,
        assetType,
        injectionAmount,
        injectionReason,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/inject-funds",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Treasury funds injected", {
          amount: injectionAmount,
        });
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to inject funds",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Inject funds error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/inject-funds",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Emergency shutdown
aegis.post(
  "/platform/:contractId/emergency-shutdown",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { shutdownReason } = body;

      const result = await aegisService.emergencyShutdown(
        contractId,
        shutdownReason,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/emergency-shutdown",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Platform emergency shutdown initiated");
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to shutdown platform",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Emergency shutdown error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/emergency-shutdown",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Reactivate platform
aegis.post(
  "/platform/:contractId/reactivate",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { reactivationReason } = body;

      const result = await aegisService.reactivatePlatform(
        contractId,
        reactivationReason,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/reactivate",
        result.status,
        duration
      );

      if (result.status === 200) {
        ConsoleLogger.success("Platform reactivated");
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to reactivate platform",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Reactivate platform error", error);
      ConsoleLogger.request(
        "POST",
        "/api/aegis/platform/:id/reactivate",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

export { aegis };
