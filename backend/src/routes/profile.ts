/**
 * User Profile Management Routes
 *
 * Privacy-preserving lender profile management with tier-based categorization,
 * anonymous ID generation, and profile configuration options.
 */

import { Hono } from "hono";
import { userService } from "../services/user";
import { ConsoleLogger } from "../utils/logger";
import { requireAuth } from "../middleware/auth";
import { auth } from "../lib/auth";
import type { LenderProfile } from "../services/user";

const profile = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

profile.use("*", requireAuth);
profile.get("/lender", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");

  try {
    if (!user?.damlParty) {
      return c.json(
        {
          error: "No DAML party assigned to user",
        },
        400
      );
    }

    const lenderProfile = await userService.getLenderProfile(user.damlParty);
    const duration = Date.now() - startTime;

    ConsoleLogger.request("GET", "/api/profile/lender", 200, duration);

    if (lenderProfile) {
      ConsoleLogger.success(`Retrieved lender profile for ${user.damlParty}`);
      return c.json({
        data: lenderProfile,
      });
    } else {
      return c.json(
        {
          error: "Lender profile not found",
          message: "No lender profile exists for this user",
        },
        404
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get lender profile error", error);
    ConsoleLogger.request("GET", "/api/profile/lender", 500, duration);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to retrieve lender profile",
      },
      500
    );
  }
});

profile.put("/lender", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");

  try {
    if (!user?.damlParty) {
      return c.json(
        {
          error: "No DAML party assigned to user",
        },
        400
      );
    }

    if (user.role !== "lender") {
      return c.json(
        {
          error: "Access denied",
          message: "Only lenders can update lender profiles",
        },
        403
      );
    }

    const body = await c.req.json();

    const validCategoryTiers = [
      "Tier1Bank",
      "RegionalBank",
      "InvestmentFund",
      "PrivateEquity",
      "InsuranceCompany",
      "PensionFund",
      "SpecialtyLender",
    ];
    const validRatingTiers = ["Premium", "Standard", "Basic"];
    const validCapacityTiers = ["Large", "Medium", "Small"];
    const validGeographicScopes = ["Global", "Regional", "Local"];

    if (body.categoryTier && !validCategoryTiers.includes(body.categoryTier)) {
      return c.json(
        {
          error: "Invalid category tier",
          validOptions: validCategoryTiers,
        },
        400
      );
    }

    if (body.ratingTier && !validRatingTiers.includes(body.ratingTier)) {
      return c.json(
        {
          error: "Invalid rating tier",
          validOptions: validRatingTiers,
        },
        400
      );
    }

    if (body.capacityTier && !validCapacityTiers.includes(body.capacityTier)) {
      return c.json(
        {
          error: "Invalid capacity tier",
          validOptions: validCapacityTiers,
        },
        400
      );
    }

    if (
      body.geographicScope &&
      !validGeographicScopes.includes(body.geographicScope)
    ) {
      return c.json(
        {
          error: "Invalid geographic scope",
          validOptions: validGeographicScopes,
        },
        400
      );
    }

    const profileUpdate: Partial<LenderProfile> = {};

    if (body.categoryTier) profileUpdate.categoryTier = body.categoryTier;
    if (body.ratingTier) profileUpdate.ratingTier = body.ratingTier;
    if (body.capacityTier) profileUpdate.capacityTier = body.capacityTier;
    if (body.geographicScope)
      profileUpdate.geographicScope = body.geographicScope;

    if (body.internalCategory)
      profileUpdate.internalCategory = body.internalCategory;
    if (body.internalRating) profileUpdate.internalRating = body.internalRating;
    if (body.internalCapacity)
      profileUpdate.internalCapacity = body.internalCapacity;
    if (body.internalAvailableCapacity)
      profileUpdate.internalAvailableCapacity = body.internalAvailableCapacity;
    if (body.activeLoans !== undefined)
      profileUpdate.activeLoans = parseInt(body.activeLoans);
    if (body.defaultRate) profileUpdate.defaultRate = body.defaultRate;

    const success = await userService.updateLenderProfile(
      user.damlParty,
      profileUpdate
    );
    const duration = Date.now() - startTime;

    ConsoleLogger.request(
      "PUT",
      "/api/profile/lender",
      success ? 200 : 500,
      duration
    );

    if (success) {
      ConsoleLogger.success(`Updated lender profile for ${user.damlParty}`);

      const updatedProfile = await userService.getLenderProfile(user.damlParty);
      return c.json({
        message: "Lender profile updated successfully",
        data: updatedProfile,
      });
    } else {
      return c.json(
        {
          error: "Failed to update lender profile",
        },
        500
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Update lender profile error", error);
    ConsoleLogger.request("PUT", "/api/profile/lender", 500, duration);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to update lender profile",
      },
      500
    );
  }
});

profile.get("/lender/options", async (c) => {
  const startTime = Date.now();

  try {
    const options = {
      categoryTiers: [
        {
          value: "Tier1Bank" as const,
          label: "Tier 1 Bank",
          description: "Major international banks with global operations",
        },
        {
          value: "RegionalBank" as const,
          label: "Regional Bank",
          description: "Regional and community banks serving specific markets",
        },
        {
          value: "InvestmentFund" as const,
          label: "Investment Fund",
          description: "Hedge funds and investment vehicles",
        },
        {
          value: "PrivateEquity" as const,
          label: "Private Equity",
          description: "PE firms and private lending institutions",
        },
        {
          value: "InsuranceCompany" as const,
          label: "Insurance Company",
          description: "Insurance companies providing lending services",
        },
        {
          value: "PensionFund" as const,
          label: "Pension Fund",
          description: "Pension and retirement funds",
        },
        {
          value: "SpecialtyLender" as const,
          label: "Specialty Lender",
          description: "Niche or specialty lending institutions",
        },
      ],
      ratingTiers: [
        {
          value: "Premium" as const,
          label: "Premium",
          description: "Highest quality lenders with excellent track record",
        },
        {
          value: "Standard" as const,
          label: "Standard",
          description: "Established lenders with good track record",
        },
        {
          value: "Basic" as const,
          label: "Basic",
          description: "Newer or smaller lenders building track record",
        },
      ],
      capacityTiers: [
        {
          value: "Large" as const,
          label: "Large Capacity",
          description: "Can handle large loan amounts (>$10M)",
        },
        {
          value: "Medium" as const,
          label: "Medium Capacity",
          description: "Can handle medium loan amounts ($1M-$10M)",
        },
        {
          value: "Small" as const,
          label: "Small Capacity",
          description: "Focused on smaller loan amounts (<$1M)",
        },
      ],
      geographicScopes: [
        {
          value: "Global" as const,
          label: "Global",
          description: "Operates worldwide",
        },
        {
          value: "Regional" as const,
          label: "Regional",
          description: "Operates in specific regions",
        },
        {
          value: "Local" as const,
          label: "Local",
          description: "Operates in specific countries/markets",
        },
      ],
    };

    const duration = Date.now() - startTime;
    ConsoleLogger.request("GET", "/api/profile/lender/options", 200, duration);

    return c.json({
      data: options,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get lender profile options error", error);
    ConsoleLogger.request("GET", "/api/profile/lender/options", 500, duration);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to retrieve profile options",
      },
      500
    );
  }
});

profile.post("/lender/generate-id", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");

  try {
    if (!user?.damlParty) {
      return c.json(
        {
          error: "No DAML party assigned to user",
        },
        400
      );
    }

    if (user.role !== "lender") {
      return c.json(
        {
          error: "Access denied",
          message: "Only lenders can generate anonymous IDs",
        },
        403
      );
    }

    const anonymousId = await userService.ensureLenderAnonymousId(
      user.damlParty,
      "undefined" // Default to undefined for new signups
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/profile/lender/generate-id",
      200,
      duration
    );

    if (anonymousId) {
      ConsoleLogger.success(
        `Generated anonymous ID: ${anonymousId} for ${user.damlParty}`
      );
      return c.json({
        message: "Anonymous ID generated successfully",
        anonymousId,
      });
    } else {
      return c.json(
        {
          error: "Failed to generate anonymous ID or ID already exists",
        },
        400
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Generate anonymous ID error", error);
    ConsoleLogger.request(
      "POST",
      "/api/profile/lender/generate-id",
      500,
      duration
    );
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to generate anonymous ID",
      },
      500
    );
  }
});

export { profile };
