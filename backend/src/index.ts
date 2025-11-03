/**
 * Aegis RFQ Backend Server
 *
 * Privacy-preserving institutional lending platform built on DAML smart contracts
 * with Hono.js API server, Better-Auth integration, and comprehensive RBAC system.
 * Provides secure RFQ workflows, collateral management, syndication, and yield generation
 * for Canton Network-based decentralized finance operations.
 */

import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { health } from "./routes/health";
import { daml } from "./routes/daml";
import { rfq } from "./routes/rfq";
import { admin } from "./routes/admin";
import { credit } from "./routes/credit";
import { collateral } from "./routes/collateral";
import { syndication } from "./routes/syndication";
import { yieldRoutes } from "./routes/yield";
import { authRoutes } from "./routes/auth";
import { profile } from "./routes/profile";
import { bids } from "./routes/bids";
import { loans } from "./routes/loans";
import { aegis } from "./routes/aegis";
import { audit } from "./routes/audit";
import { secondaryMarket } from "./routes/secondary-market";
import { auth } from "./lib/auth";
import { ConsoleLogger } from "./utils/logger";
import { validateDamlConfig, DAML_CONFIG, getEnvConfig } from "./config/daml";
import { DatabaseService } from "./db";
import { rateLimitMiddleware } from "./middleware/rateLimit";
import {
  requestLoggingMiddleware,
  securityLoggingMiddleware,
  performanceLoggingMiddleware,
} from "./middleware/logging";
import { CacheService } from "./services/cache";
import config from "./config/env";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use(
  "/api/auth/*",
  cors({
    origin: config.security.corsOrigins,
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

app.use(
  "*",
  cors({
    origin: config.security.corsOrigins,
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use("*", async (c, next) => {
  try {
    const sessionData = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (sessionData?.user && sessionData?.session) {
      c.set("user", sessionData.user);
      c.set("session", sessionData.session);

      ConsoleLogger.info("Session authenticated", {
        userId: sessionData.user.id,
        email: sessionData.user.email,
        damlParty: sessionData.user.damlParty,
      });
    } else {
      c.set("user", null);
      c.set("session", null);
    }
  } catch (error) {
    ConsoleLogger.warning("Session middleware error", {
      error: error instanceof Error ? error.message : "Unknown error",
      path: c.req.path,
    });
    c.set("user", null);
    c.set("session", null);
  }

  return next();
});

app.use("*", rateLimitMiddleware());

app.use("*", requestLoggingMiddleware);
app.use("*", securityLoggingMiddleware);
app.use("*", performanceLoggingMiddleware);

app.route("/api/auth", authRoutes);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.route("/health", health);
app.route("/api/admin", admin);
app.route("/api/daml", daml);
app.route("/api/rfqs", rfq);
app.route("/api/bids", bids);
app.route("/api/loans", loans);

app.route("/api/credit", credit);
app.route("/api/collateral", collateral);
app.route("/api/syndication", syndication);
app.route("/api/yield", yieldRoutes);
app.route("/api/profile", profile);
app.route("/api/aegis", aegis);
app.route("/api/audit", audit);
app.route("/api/secondary-market", secondaryMarket);

app.post("/api/create-party", async (c) => {
  try {
    const body = await c.req.json();
    const { identifierHint, displayName } = body;

    if (!identifierHint || !displayName) {
      return c.json(
        { error: "identifierHint and displayName are required" },
        400
      );
    }

    const { PartyManager } = await import("./utils/party-id");
    const party = await PartyManager.createParty({
      identifierHint,
      displayName,
    });

    if (party) {
      return c.json({ party });
    } else {
      return c.json({ error: "Failed to create party" }, 500);
    }
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

app.get("/api/lenders", async (c) => {
  try {
    const { UserService } = await import("./services/user");
    const userService = UserService.getInstance();
    const lenders = await userService.listUsers({
      role: "lender",
      limit: 100,
      offset: 0,
    });

    return c.json({
      success: true,
      users: lenders.map((user) => ({
        id: user.id,
        name: user.name,
        damlParty: user.damlParty,
      })),
    });
  } catch (error) {
    ConsoleLogger.error("Failed to get lenders", error);
    return c.json(
      {
        success: false,
        error: "Failed to get lenders",
      },
      500
    );
  }
});

app.get("/api/session", async (c) => {
  try {
    const contextSession = c.get("session");
    const contextUser = c.get("user");

    if (contextUser && contextUser.id) {
      try {
        const { db } = await import("./db");
        const { user } = await import("./db/schema");
        const { eq } = await import("drizzle-orm");

        const dbUsers = await db
          .select()
          .from(user)
          .where(eq(user.id, contextUser.id));
        const dbUser = dbUsers[0];

        if (dbUser) {
          let lenderProfile = null;
          if (dbUser.role === "lender" && dbUser.damlParty) {
            try {
              const { userService } = await import("./services/user");
              lenderProfile = await userService.getLenderProfile(
                dbUser.damlParty
              );
            } catch (profileError) {
              ConsoleLogger.error(
                "Failed to fetch lender profile in session",
                profileError
              );
            }
          }

          return c.json({
            authenticated: true,
            user: {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              damlParty: dbUser.damlParty,
              role: dbUser.role,
              emailVerified: dbUser.emailVerified,
              image: dbUser.image,
              createdAt: dbUser.createdAt,
              updatedAt: dbUser.updatedAt,
              lenderProfile: lenderProfile,
            },
            session: contextSession,
          });
        }
      } catch (dbError) {
        ConsoleLogger.error("Database lookup failed in session", dbError);
      }
    }

    return c.json({
      authenticated: false,
      user: null,
      session: null,
    });
  } catch (error) {
    return c.json({
      authenticated: false,
      user: null,
      session: null,
      error: (error as Error).message,
    });
  }
});

app.get("/api/analytics", async (c) => {
  try {
    const hours = parseInt(c.req.query("hours") || "24");
    const analytics = await CacheService.getApiAnalytics(hours);

    return c.json({
      analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    ConsoleLogger.error("Analytics error", error);
    return c.json({ error: "Failed to get analytics" }, 500);
  }
});

app.get("/api/info", (c) => {
  const envConfig = getEnvConfig();
  return c.json({
    name: "Aegis RFQ Platform",
    version: "3.0.0",
    description:
      "Enterprise DAML-powered lending platform with credit scoring, syndication, collateral management, and yield generation",
    environment: process.env.NODE_ENV ?? "development",
    endpoints: {
      health: "/health",
      rfqs: "/api/rfqs",
      credit: "/api/credit/*",
      collateral: "/api/collateral/*",
      syndication: "/api/syndication/*",
      yield: "/api/yield/*",
      aegis: "/api/aegis/*",
      daml: "/api/daml/*",
      info: "/api/info",
    },
    features: {
      businessRuleValidation: true,
      requestRetries: true,
      performanceMetrics: true,
      structuredLogging: true,

      creditScoring: true,
      riskAssessment: true,
      syndicatedLending: true,
      collateralManagement: true,
      yieldGeneration: true,
      liquidityPools: true,
      stakingRewards: true,
      lpTokens: true,
    },
    config: {
      supportedAssets: DAML_CONFIG.business.supportedAssets,
      minCollateralRatio: DAML_CONFIG.business.minCollateralRatio,
      maxInterestRate: `${(DAML_CONFIG.business.maxInterestRate * 100).toFixed(
        1
      )}%`,
      defaultRFQExpiryDays: DAML_CONFIG.business.defaultRFQExpiryDays,
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.notFound((c) => {
  ConsoleLogger.warning(`404 Not Found: ${c.req.method} ${c.req.path}`);
  return c.json(
    {
      error: "Not Found",
      message: `Endpoint ${c.req.method} ${c.req.path} not found`,
      availableEndpoints: [
        "/health",
        "/api/info",
        "/api/analytics",
        "/api/session",
        "/api/auth/*",
        "/api/daml/*",
        "/api/rfqs/*",
      ],
    },
    404
  );
});

app.onError((err, c) => {
  ConsoleLogger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  return c.json(
    {
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    },
    500
  );
});

const port = config.server.port;

async function startServer() {
  try {
    await DatabaseService.initialize();

    const validation = validateDamlConfig();
    if (!validation.valid) {
      ConsoleLogger.error("Configuration validation failed", validation.errors);
      process.exit(1);
    }
    ConsoleLogger.success("Configuration validated");

    ConsoleLogger.startup(`Aegis RFQ Platform v1.0 starting on port ${port}`);
    ConsoleLogger.damlInfo(DAML_CONFIG.jsonApiUrl ?? "Not configured");
    ConsoleLogger.info(`Environment: ${process.env.NODE_ENV ?? "development"}`);
    ConsoleLogger.info(
      "CORS enabled for:",
      DAML_CONFIG.security.allowedOrigins
    );
    ConsoleLogger.info(
      "Supported assets:",
      DAML_CONFIG.business.supportedAssets
    );
    ConsoleLogger.info("RFQ Template ID:", DAML_CONFIG.templates.RFQ);
    ConsoleLogger.info("Available endpoints:");
    console.log("  ￫ GET  /health                        - Health check");
    console.log(
      "  ￫ GET  /api/info                      - Platform information"
    );
    console.log("  ￫ GET  /api/analytics                 - API analytics");
    console.log(
      "  ￫ GET  /api/session                   - Current session info"
    );
    console.log("");
    console.log("  Authentication:");
    console.log("  ￫ POST /api/auth/register             - User registration");
    console.log(
      "  ￫ POST /api/auth/login                - User authentication"
    );
    console.log("  ￫ POST /api/auth/logout               - User logout");
    console.log("  ￫ GET  /api/auth/me                   - Current user info");
    console.log("");
    console.log("  Admin Operations (Admin Auth Required):");
    console.log(
      "  ￫ GET  /api/admin/dashboard           - System overview dashboard"
    );
    console.log(
      "  ￫ GET  /api/admin/health              - Detailed system health check"
    );
    console.log(
      "  ￫ GET  /api/admin/analytics           - API analytics with breakdown"
    );
    console.log(
      "  ￫ GET  /api/admin/users               - List all users with filtering"
    );
    console.log(
      "  ￫ POST /api/admin/users/create        - Create user (admin only, no auto-login)"
    );
    console.log(
      "  ￫ POST /api/admin/users/regenerate-parties - Bulk regenerate DAML parties"
    );
    console.log(
      "  ￫ GET  /api/admin/users/party-status  - Check DAML party sync status"
    );
    console.log(
      "  ￫ POST /api/admin/cache/cleanup       - Clean old cache data"
    );
    console.log(
      "  ￫ GET  /api/admin/config              - System configuration (safe)"
    );
    console.log(
      "  ￫ GET  /api/admin/database/stats      - Database statistics"
    );
    console.log(
      "  ￫ GET  /api/admin/logs                - System logs (recent entries)"
    );
    console.log("");
    console.log("  DAML Operations (Auth Required):");
    console.log("  ￫ GET  /api/daml/parties              - List DAML parties");
    console.log(
      "  ￫ POST /api/daml/query                - Query DAML contracts"
    );
    console.log(
      "  ￫ POST /api/daml/create               - Create DAML contract"
    );
    console.log(
      "  ￫ POST /api/daml/exercise             - Exercise contract choice"
    );
    console.log("  ￫ GET  /api/daml/rfqs                 - Get RFQs from DAML");
    console.log("  ￫ GET  /api/daml/bids                 - Get bids from DAML");
    console.log(
      "  ￫ GET  /api/daml/loans                - Get loans from DAML"
    );
    console.log("");
    console.log("  RFQ Management (Auth Required):");
    console.log(
      "  ￫ GET  /api/rfqs                      - List RFQs with filtering"
    );
    console.log("  ￫ POST /api/rfqs                      - Create new RFQ");
    console.log("  ￫ GET  /api/rfqs/:id                  - Get RFQ details");
    console.log("  ￫ POST /api/rfqs/:id/bids             - Submit bid on RFQ");
    console.log("");
    console.log("  Credit System (Auth Required):");
    console.log(
      "  ￫ GET  /api/credit/profiles           - List credit profiles"
    );
    console.log(
      "  ￫ POST /api/credit/profiles           - Create credit profile"
    );
    console.log(
      "  ￫ GET  /api/credit/risk-assessments   - List risk assessments"
    );
    console.log(
      "  ￫ POST /api/credit/risk-assessments   - Create risk assessment"
    );
    console.log("");
    console.log("  Collateral Management (Auth Required):");
    console.log(
      "  ￫ GET  /api/collateral/pools          - List collateral pools"
    );
    console.log(
      "  ￫ POST /api/collateral/pools          - Create collateral pool"
    );
    console.log("  ￫ POST /api/collateral/pools/:id/update-valuation");
    console.log("  ￫ POST /api/collateral/pools/:id/margin-call");
    console.log("  ￫ POST /api/collateral/pools/:id/liquidate");
    console.log("");
    console.log("  Syndication (Auth Required):");
    console.log(
      "  ￫ GET  /api/syndication/loans         - List syndicated loans"
    );
    console.log(
      "  ￫ GET  /api/syndication/formations    - List syndicate formations"
    );
    console.log(
      "  ￫ POST /api/syndication/formations    - Create syndicate formation"
    );
    console.log("  ￫ POST /api/syndication/formations/:id/commit");
    console.log("  ￫ POST /api/syndication/formations/:id/finalize");
    console.log(
      "  ￫ GET  /api/syndication/votes         - List syndicate votes"
    );
    console.log("");
    console.log("  Yield Generation (Auth Required):");
    console.log(
      "  ￫ GET  /api/yield/pools               - List liquidity pools"
    );
    console.log(
      "  ￫ POST /api/yield/pools               - Create liquidity pool"
    );
    console.log("  ￫ POST /api/yield/pools/:id/join      - Join pool");
    console.log("  ￫ POST /api/yield/pools/:id/withdraw  - Withdraw from pool");
    console.log("  ￫ POST /api/yield/pools/:id/claim-yield");
    console.log("  ￫ GET  /api/yield/lp-tokens           - List LP tokens");
    console.log(
      "  ￫ GET  /api/yield/staking             - List staking rewards"
    );
    console.log("");
    console.log("  Aegis Platform (Auth Required):");
    console.log(
      "  ￫ GET  /api/aegis/platform            - Get platform details"
    );
    console.log("  ￫ GET  /api/aegis/balances            - Get asset balances");
    console.log(
      "  ￫ GET  /api/aegis/liquidity-support   - Get liquidity support records"
    );
    console.log(
      "  ￫ POST /api/aegis/platform/:id/mint   - Mint treasury funds"
    );
    console.log(
      "  ￫ POST /api/aegis/platform/:id/bulk-mint - Bulk mint treasury"
    );
    console.log(
      "  ￫ POST /api/aegis/platform/:id/register-lender - Register new lender"
    );
    console.log(
      "  ￫ POST /api/aegis/platform/:id/fund-lender - Admin fund lender"
    );
    console.log(
      "  ￫ POST /api/aegis/platform/:id/reimburse-lender - Reimburse lender"
    );
    console.log(
      "  ￫ POST /api/aegis/platform/:id/authorize-assets - Authorize assets"
    );
    console.log(
      "  ￫ POST /api/aegis/platform/:id/update-fee-rate - Update fee rate"
    );
    console.log(
      "  ￫ POST /api/aegis/platform/:id/liquidity-support - Provide liquidity support"
    );
    console.log(
      "  ￫ POST /api/aegis/liquidity-support/:id/repay - Repay support"
    );
    console.log("  ￫ POST /api/aegis/balances/:id/receive - Receive funds");
    console.log("  ￫ POST /api/aegis/balances/:id/lock - Lock funds");
    console.log("");
    console.log("  Audit Logging (Auth Required):");
    console.log(
      "  ￫ GET  /api/audit/platform            - Get platform audit logs"
    );
    console.log(
      "  ￫ GET  /api/audit/lender              - Get lender audit logs"
    );
    console.log(
      "  ￫ GET  /api/audit/borrower            - Get borrower audit logs"
    );
    console.log(
      "  ￫ GET  /api/audit/loan-trails         - Get loan audit trails"
    );
    console.log(
      "  ￫ GET  /api/audit/compliance          - Get compliance audit logs"
    );
    console.log(
      "  ￫ GET  /api/audit/activity-monitors   - Get activity monitors"
    );
    console.log(
      "  ￫ DELETE /api/audit/platform/:id      - Archive platform log"
    );
    console.log("  ￫ DELETE /api/audit/lender/:id        - Archive lender log");
    console.log(
      "  ￫ DELETE /api/audit/borrower/:id      - Archive borrower log"
    );
    console.log("");

    serve({
      fetch: app.fetch,
      port,
    });

    ConsoleLogger.success(
      `Aegis RFQ Platform running on http://localhost:${port}`
    );

    if (config.server.isProduction) {
      setInterval(async () => {
        ConsoleLogger.info("Running cache cleanup...");
        await CacheService.cleanupCache(30);
      }, 24 * 60 * 60 * 1000);
    }
  } catch (error) {
    ConsoleLogger.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
