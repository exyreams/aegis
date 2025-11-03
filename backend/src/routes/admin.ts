/**
 * Admin Routes and System Management
 *
 * Administrative endpoints for user management, system monitoring,
 * analytics, health checks, and configuration management.
 */

import { Hono } from "hono";
import { auditLoggingMiddleware } from "../middleware/logging";
import { requireAuth, requireRole } from "../middleware/auth";
import { userService } from "../services/user";
import { CacheService } from "../services/cache";
import { DatabaseService } from "../db";
import { ConsoleLogger } from "../utils/logger";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "../lib/auth";
import config from "../config/env";
import { DAML_CONFIG } from "../config/daml";
const admin = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// All admin routes require admin authentication
admin.use("*", requireAuth);
admin.use("*", requireRole("admin"));

// System overview dashboard
admin.get(
  "/dashboard",
  auditLoggingMiddleware("VIEW_ADMIN_DASHBOARD"),
  async (c) => {
    try {
      const userStats = await userService.getUserStats();
      const dbStats = await DatabaseService.getStats();
      const apiAnalytics = await CacheService.getApiAnalytics(24);

      const systemInfo = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || "development",
      };

      return c.json({
        success: true,
        dashboard: {
          system: systemInfo,
          users: userStats,
          database: dbStats,
          api: apiAnalytics,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      ConsoleLogger.error("Failed to get admin dashboard", error);
      return c.json(
        {
          success: false,
          error: "Failed to load dashboard",
        },
        500
      );
    }
  }
);

// System health check (detailed)
admin.get(
  "/health",
  auditLoggingMiddleware("VIEW_SYSTEM_HEALTH"),
  async (c) => {
    try {
      const dbHealth = await DatabaseService.healthCheck();
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      const health = {
        status: dbHealth.healthy ? "healthy" : "unhealthy",
        checks: {
          database: dbHealth,
          memory: {
            healthy: memoryUsage.heapUsed < memoryUsage.heapTotal * 0.9,
            usage: memoryUsage,
            threshold: "90%",
          },
          cpu: {
            healthy: cpuUsage.user < 80000000,
            usage: {
              user: Math.round(cpuUsage.user / 1000),
              system: Math.round(cpuUsage.system / 1000),
            },
            threshold: "80ms per 100ms window",
          },
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };

      return c.json({
        success: true,
        health,
      });
    } catch (error) {
      ConsoleLogger.error("Failed to get system health", error);
      return c.json(
        {
          success: false,
          error: "Failed to get system health",
        },
        500
      );
    }
  }
);

// API analytics with detailed breakdown
admin.get(
  "/analytics",
  auditLoggingMiddleware("VIEW_API_ANALYTICS"),
  async (c) => {
    try {
      const hours = parseInt(c.req.query("hours") || "24");
      const analytics = await CacheService.getApiAnalytics(hours);

      return c.json({
        success: true,
        analytics,
        period: `${hours} hours`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      ConsoleLogger.error("Failed to get analytics", error);
      return c.json(
        {
          success: false,
          error: "Failed to get analytics",
        },
        500
      );
    }
  }
);

admin.post(
  "/users/create",
  auditLoggingMiddleware("CREATE_USER"),
  zValidator(
    "json",
    z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      name: z.string().min(2, "Name must be at least 2 characters"),
      damlParty: z.string().min(1, "DAML Party is required"),
      role: z.enum([
        "borrower",
        "lender",
        "admin",
        "risk_analyst",
        "compliance_officer",
        "market_maker",
        "auditor",
      ]),
      image: z.string().optional(),
      lenderProfile: z
        .object({
          categoryTier: z.enum([
            "Tier1Bank",
            "RegionalBank",
            "InvestmentFund",
            "PrivateEquity",
            "InsuranceCompany",
            "PensionFund",
            "SpecialtyLender",
          ]),
          ratingTier: z.enum(["Premium", "Standard", "Basic"]).optional(),
          capacityTier: z.enum(["Large", "Medium", "Small"]).optional(),
          geographicScope: z.enum(["Global", "Regional", "Local"]).optional(),
        })
        .optional(),
    })
  ),
  async (c) => {
    try {
      const userData = c.req.valid("json");
      const adminUser = c.get("user");

      ConsoleLogger.info("Admin creating new user", {
        adminParty: adminUser?.damlParty,
        newUserEmail: userData.email,
        newUserRole: userData.role,
      });

      // Use Better-Auth to create user (ensures consistent ID generation)
      const signUpResult = await auth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          damlParty: userData.damlParty,
          role: userData.role,
          image: userData.image,
        },
      });

      if (!signUpResult || !signUpResult.user) {
        throw new Error("Failed to create user via Better-Auth");
      }

      // Fetch the complete user data from database to get custom fields
      const completeUser = await userService.getUserById(signUpResult.user.id);
      if (!completeUser) {
        throw new Error("Failed to retrieve complete user data");
      }

      const newUser = completeUser;

      ConsoleLogger.success("User created successfully by admin", {
        adminParty: adminUser?.damlParty,
        newUserId: newUser.id,
        newUserEmail: newUser.email,
        newUserRole: newUser.role,
      });

      // If lender profile data is provided in the request, create it
      if (
        userData.role === "lender" &&
        userData.lenderProfile &&
        newUser.damlParty
      ) {
        try {
          const profileSuccess = await userService.updateLenderProfile(
            newUser.damlParty,
            userData.lenderProfile
          );

          if (profileSuccess) {
            ConsoleLogger.success(
              `Created lender profile for ${newUser.damlParty}`
            );
          }
        } catch (profileError) {
          ConsoleLogger.error("Failed to create lender profile", profileError);
          // Don't fail user creation if profile creation fails
        }
      }

      return c.json(
        {
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            damlParty: newUser.damlParty,
            role: newUser.role,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
          },
        },
        201
      );
    } catch (error) {
      ConsoleLogger.error("Failed to create user", error);

      if (error instanceof Error) {
        if (
          error.message.includes("duplicate key") ||
          error.message.includes("unique constraint")
        ) {
          return c.json(
            {
              success: false,
              error: "User with this email already exists",
            },
            409
          );
        }
      }

      return c.json(
        {
          success: false,
          error: "Failed to create user",
        },
        500
      );
    }
  }
);

admin.get("/users", auditLoggingMiddleware("LIST_USERS"), async (c) => {
  try {
    const role = c.req.query("role");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");

    const users = await userService.listUsers({ role, limit, offset });

    // For lenders, include their anonymous IDs and profile info
    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        const baseUser = {
          id: user.id,
          damlParty: user.damlParty,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };

        if (user.role === "lender" && user.damlParty) {
          const lenderProfile = await userService.getLenderProfile(
            user.damlParty
          );
          return {
            ...baseUser,
            lenderProfile: lenderProfile
              ? {
                  anonymousId: lenderProfile.anonymousId,
                  categoryTier: lenderProfile.categoryTier,
                  ratingTier: lenderProfile.ratingTier,
                  capacityTier: lenderProfile.capacityTier,
                  geographicScope: lenderProfile.geographicScope,
                }
              : null,
          };
        }

        return baseUser;
      })
    );

    return c.json({
      success: true,
      users: enhancedUsers,
      pagination: {
        limit,
        offset,
        total: users.length,
      },
      message: `Retrieved ${enhancedUsers.length} users${
        role ? ` with role: ${role}` : ""
      }`,
    });
  } catch (error) {
    ConsoleLogger.error("Failed to list users", error);
    return c.json(
      {
        success: false,
        error: "Failed to list users",
      },
      500
    );
  }
});

admin.post(
  "/users/regenerate-parties",
  auditLoggingMiddleware("BULK_REGENERATE_PARTIES"),
  zValidator(
    "json",
    z.object({
      userIds: z.array(z.string()).min(1, "At least one user ID required"),
      force: z.boolean().default(false), // Force regeneration even if party exists
    })
  ),
  async (c) => {
    try {
      const { userIds, force } = c.req.valid("json");
      const user = c.get("user");

      ConsoleLogger.info("Starting bulk party regeneration", {
        adminParty: user?.damlParty,
        userCount: userIds.length,
        force,
      });

      const results = {
        success: [] as Array<{
          userId: string;
          oldParty: string | null;
          newParty: string;
        }>,
        failed: [] as Array<{ userId: string; error: string }>,
        skipped: [] as Array<{ userId: string; reason: string }>,
      };

      for (const userId of userIds) {
        try {
          const existingUser = await userService.getUserById(userId);
          if (!existingUser) {
            results.failed.push({ userId, error: "User not found" });
            continue;
          }

          if (existingUser.damlParty && !force) {
            results.skipped.push({
              userId,
              reason:
                "User already has DAML party (use force=true to regenerate)",
            });
            continue;
          }

          const randomId =
            Math.random().toString(36).substring(2) +
            Math.random().toString(36).substring(2);
          const finalRandomId = randomId.substring(0, 12);
          const identifierHint = `aegis_${finalRandomId}`;
          const displayName = existingUser.role;

          const partyResponse = await fetch(
            `http://localhost:${config.server.port}/api/create-party`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                identifierHint,
                displayName,
              }),
            }
          );

          if (!partyResponse.ok) {
            const errorText = await partyResponse.text();
            results.failed.push({
              userId,
              error: `DAML party creation failed: ${errorText}`,
            });
            continue;
          }

          const partyData = await partyResponse.json();
          const newPartyId = partyData.party?.identifier;

          if (!newPartyId) {
            results.failed.push({
              userId,
              error: "No party identifier returned from DAML",
            });
            continue;
          }

          const updateSuccess = await userService.updateUserParty(
            userId,
            newPartyId
          );
          if (!updateSuccess) {
            results.failed.push({
              userId,
              error: "Failed to update user in database",
            });
            continue;
          }

          results.success.push({
            userId,
            oldParty: existingUser.damlParty,
            newParty: newPartyId,
          });

          ConsoleLogger.success("Party regenerated for user", {
            userId,
            userRole: existingUser.role,
            oldParty: existingUser.damlParty,
            newParty: newPartyId,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          results.failed.push({ userId, error: errorMessage });
          ConsoleLogger.error("Failed to regenerate party for user", {
            userId,
            error,
          });
        }
      }

      const summary = {
        total: userIds.length,
        successful: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
      };

      ConsoleLogger.info("Bulk party regeneration completed", {
        adminParty: user?.damlParty,
        summary,
      });

      return c.json({
        success: true,
        message: "Bulk party regeneration completed",
        summary,
        results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      ConsoleLogger.error("Bulk party regeneration failed", error);
      return c.json(
        {
          success: false,
          error: "Bulk party regeneration failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  }
);

admin.get(
  "/users/party-status",
  auditLoggingMiddleware("CHECK_PARTY_STATUS"),
  async (c) => {
    try {
      const user = c.get("user");

      const users = await userService.listUsers({ limit: 1000 });

      const { generateDamlToken } = await import("../utils/daml-token");
      const damlToken = generateDamlToken(user?.damlParty || "System", {
        scope: "daml:read daml:write daml:admin",
        admin: true,
        expiresIn: "3600",
      });

      let damlParties: string[] = [];
      try {
        const response = await fetch(
          `${config.daml.jsonApiUrl.replace("/v1/query", "")}/v1/parties`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${damlToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          damlParties = data.result?.map((p: any) => p.identifier) || [];
        } else {
          ConsoleLogger.warning("Failed to fetch DAML parties", {
            status: response.status,
          });
        }
      } catch (error) {
        ConsoleLogger.error("Error fetching DAML parties", error);
      }

      const partyStatus = users.map((user) => {
        const hasDbParty = !!(user.damlParty && user.damlParty.trim());
        const existsInDaml =
          hasDbParty && damlParties.includes(user.damlParty!);

        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          damlParty: user.damlParty,
          hasDbParty,
          existsInDaml,
          status: !hasDbParty ? "no_party" : existsInDaml ? "valid" : "invalid",
        };
      });

      const stats = {
        total: users.length,
        validParties: partyStatus.filter((p) => p.status === "valid").length,
        invalidParties: partyStatus.filter((p) => p.status === "invalid")
          .length,
        noParties: partyStatus.filter((p) => p.status === "no_party").length,
        damlLedgerParties: damlParties.length,
      };

      return c.json({
        success: true,
        stats,
        partyStatus,
        message: `Found ${
          stats.invalidParties + stats.noParties
        } users needing party regeneration`,
      });
    } catch (error) {
      ConsoleLogger.error("Failed to check party status", error);
      return c.json(
        {
          success: false,
          error: "Failed to check party status",
        },
        500
      );
    }
  }
);

admin.post(
  "/cache/cleanup",
  auditLoggingMiddleware("CLEANUP_CACHE"),
  zValidator(
    "json",
    z.object({
      daysOld: z.number().min(1).max(365).default(30),
    })
  ),
  async (c) => {
    try {
      const { daysOld } = c.req.valid("json");
      const result = await CacheService.cleanupCache(daysOld);

      const user = c.get("user");
      ConsoleLogger.success("Cache cleanup completed by admin", {
        adminParty: user?.damlParty,
        daysOld,
        result,
      });

      return c.json({
        success: true,
        message: "Cache cleanup completed",
        result,
      });
    } catch (error) {
      ConsoleLogger.error("Cache cleanup failed", error);
      return c.json(
        {
          success: false,
          error: "Cache cleanup failed",
        },
        500
      );
    }
  }
);

admin.get(
  "/config",
  auditLoggingMiddleware("VIEW_SYSTEM_CONFIG"),
  async (c) => {
    try {
      const safeConfig = {
        server: {
          port: config.server.port,
          nodeEnv: config.server.nodeEnv,
          isDevelopment: config.server.isDevelopment,
          isProduction: config.server.isProduction,
        },
        daml: {
          jsonApiUrl: config.daml.jsonApiUrl,
          ledgerId: config.daml.ledgerId,
          applicationId: config.daml.applicationId,
        },
        security: {
          corsOrigins: config.security.corsOrigins,
          rateLimit: {
            windowMs: config.security.rateLimit.windowMs,
            maxRequests: config.security.rateLimit.maxRequests,
          },
        },
        logging: {
          level: config.logging.level,
          enableAudit: config.logging.enableAudit,
          enableSecurity: config.logging.enableSecurity,
        },
        business: {
          minCollateralRatio: config.business.minCollateralRatio,
          maxInterestRate: config.business.maxInterestRate,
          defaultRFQExpiryDays: config.business.defaultRFQExpiryDays,
          maxLoanDurationDays: config.business.maxLoanDurationDays,
          supportedAssets: DAML_CONFIG.business.supportedAssets,
        },
        performance: {
          slowRequestThreshold: config.performance.slowRequestThreshold,
          performanceThreshold: config.performance.performanceThreshold,
        },
        app: {
          version: config.app.version,
        },
      };

      return c.json({
        success: true,
        config: safeConfig,
      });
    } catch (error) {
      ConsoleLogger.error("Failed to get system config", error);
      return c.json(
        {
          success: false,
          error: "Failed to get system config",
        },
        500
      );
    }
  }
);

admin.get(
  "/database/stats",
  auditLoggingMiddleware("VIEW_DATABASE_STATS"),
  async (c) => {
    try {
      const stats = await DatabaseService.getStats();
      const health = await DatabaseService.healthCheck();

      return c.json({
        success: true,
        database: {
          stats,
          health,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      ConsoleLogger.error("Failed to get database stats", error);
      return c.json(
        {
          success: false,
          error: "Failed to get database stats",
        },
        500
      );
    }
  }
);

admin.get("/logs", auditLoggingMiddleware("VIEW_SYSTEM_LOGS"), async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "100");
    const level = c.req.query("level") || "info";

    const apiLogs = await DatabaseService.getStats();

    const logs = {
      apiLogs: apiLogs?.log_count || 0,
      limit,
      level,
      message:
        "API request logs are stored in database. For application logs, configure external log management.",
      recommendation:
        "Consider implementing structured logging with database storage or external services like ELK stack",
    };

    return c.json({
      success: true,
      logs,
    });
  } catch (error) {
    ConsoleLogger.error("Failed to get logs", error);
    return c.json(
      {
        success: false,
        error: "Failed to get logs",
      },
      500
    );
  }
});

// Migrate lender categories to internal categories
admin.post(
  "/migrate/lender-categories",
  auditLoggingMiddleware("MIGRATE_LENDER_CATEGORIES"),
  async (c) => {
    const startTime = Date.now();

    try {
      const migratedCount = await userService.migrateLenderCategories();
      const duration = Date.now() - startTime;

      ConsoleLogger.request(
        "POST",
        "/api/admin/migrate/lender-categories",
        200,
        duration
      );

      return c.json({
        message: "Lender category migration completed successfully",
        migratedCount,
        duration: `${duration}ms`,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Lender category migration failed", error);
      ConsoleLogger.request(
        "POST",
        "/api/admin/migrate/lender-categories",
        500,
        duration
      );

      return c.json(
        {
          error: "Migration failed",
          message: "Failed to migrate lender categories",
        },
        500
      );
    }
  }
);

// Update specific user by ID
admin.put(
  "/users/:userId",
  auditLoggingMiddleware("UPDATE_USER"),
  zValidator(
    "json",
    z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      role: z.enum(["admin", "borrower", "lender"]).optional(),
      lenderProfile: z
        .object({
          categoryTier: z.string().optional(),
          ratingTier: z.string().optional(),
          internalRating: z.string().optional(),
          capacityTier: z.string().optional(),
          geographicScope: z.string().optional(),
        })
        .optional(),
    })
  ),
  async (c) => {
    const startTime = Date.now();
    const userId = c.req.param("userId");
    const updateData = c.req.valid("json");

    try {
      // Check if user exists
      const existingUser = await userService.getUserById(userId);
      if (!existingUser) {
        const duration = Date.now() - startTime;
        ConsoleLogger.request(
          "PUT",
          `/api/admin/users/${userId}`,
          404,
          duration
        );
        return c.json(
          {
            error: "User not found",
            message: `User with ID ${userId} does not exist`,
          },
          404
        );
      }

      // Update user
      const updatedUser = await userService.updateUser(userId, updateData);

      const duration = Date.now() - startTime;
      ConsoleLogger.success("User updated successfully", {
        userId,
        updatedFields: Object.keys(updateData),
        duration: `${duration}ms`,
      });
      ConsoleLogger.request("PUT", `/api/admin/users/${userId}`, 200, duration);

      return c.json({
        message: "User updated successfully",
        user: updatedUser,
        duration: `${duration}ms`,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Update user error", error);
      ConsoleLogger.request("PUT", `/api/admin/users/${userId}`, 500, duration);

      return c.json(
        {
          error: "Update failed",
          message: "Failed to update user",
        },
        500
      );
    }
  }
);

// Delete specific user by ID
admin.delete(
  "/users/:userId",
  auditLoggingMiddleware("DELETE_USER"),
  async (c) => {
    const startTime = Date.now();
    const userId = c.req.param("userId");

    try {
      const success = await userService.deleteUser(userId);
      const duration = Date.now() - startTime;

      if (success) {
        ConsoleLogger.request(
          "DELETE",
          `/api/admin/users/${userId}`,
          200,
          duration
        );
        return c.json({
          message: "User deleted successfully",
          userId,
          duration: `${duration}ms`,
        });
      } else {
        ConsoleLogger.request(
          "DELETE",
          `/api/admin/users/${userId}`,
          404,
          duration
        );
        return c.json(
          {
            error: "User not found",
            message: `User with ID ${userId} not found`,
          },
          404
        );
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Delete user failed", error);
      ConsoleLogger.request(
        "DELETE",
        `/api/admin/users/${userId}`,
        500,
        duration
      );

      return c.json(
        {
          error: "Delete failed",
          message: "Failed to delete user",
        },
        500
      );
    }
  }
);

// Delete user by DAML party
admin.delete(
  "/users/party/:damlParty",
  auditLoggingMiddleware("DELETE_USER_BY_PARTY"),
  async (c) => {
    const startTime = Date.now();
    const damlParty = c.req.param("damlParty");

    try {
      const success = await userService.deleteUserByDamlParty(damlParty);
      const duration = Date.now() - startTime;

      if (success) {
        ConsoleLogger.request(
          "DELETE",
          `/api/admin/users/party/${damlParty}`,
          200,
          duration
        );
        return c.json({
          message: "User deleted successfully",
          damlParty,
          duration: `${duration}ms`,
        });
      } else {
        ConsoleLogger.request(
          "DELETE",
          `/api/admin/users/party/${damlParty}`,
          404,
          duration
        );
        return c.json(
          {
            error: "User not found",
            message: `User with DAML party ${damlParty} not found`,
          },
          404
        );
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Delete user by party failed", error);
      ConsoleLogger.request(
        "DELETE",
        `/api/admin/users/party/${damlParty}`,
        500,
        duration
      );

      return c.json(
        {
          error: "Delete failed",
          message: "Failed to delete user by DAML party",
        },
        500
      );
    }
  }
);

// Delete all non-admin users (for testing)
admin.delete(
  "/users/non-admin",
  auditLoggingMiddleware("DELETE_ALL_NON_ADMIN_USERS"),
  async (c) => {
    const startTime = Date.now();

    try {
      const deletedCount = await userService.deleteAllNonAdminUsers();
      const duration = Date.now() - startTime;

      ConsoleLogger.request(
        "DELETE",
        "/api/admin/users/non-admin",
        200,
        duration
      );
      return c.json({
        message: "All non-admin users deleted successfully",
        deletedCount,
        duration: `${duration}ms`,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Delete all non-admin users failed", error);
      ConsoleLogger.request(
        "DELETE",
        "/api/admin/users/non-admin",
        500,
        duration
      );

      return c.json(
        {
          error: "Delete failed",
          message: "Failed to delete non-admin users",
        },
        500
      );
    }
  }
);

// Delete ALL users (nuclear option - use with extreme caution)
admin.delete(
  "/users/all",
  auditLoggingMiddleware("DELETE_ALL_USERS"),
  async (c) => {
    const startTime = Date.now();

    try {
      const deletedCount = await userService.deleteAllUsers();
      const duration = Date.now() - startTime;

      ConsoleLogger.request("DELETE", "/api/admin/users/all", 200, duration);
      return c.json({
        message: "ALL users deleted successfully",
        deletedCount,
        duration: `${duration}ms`,
        warning:
          "This action deleted ALL users including admins! All sessions, accounts, and related data have been permanently removed.",
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Delete all users failed", error);
      ConsoleLogger.request("DELETE", "/api/admin/users/all", 500, duration);

      return c.json(
        {
          error: "Delete failed",
          message: "Failed to delete all users",
        },
        500
      );
    }
  }
);

export { admin };
