/**
 * RFQ (Request for Quote) Routes
 *
 * Complete RFQ lifecycle management with DAML integration including
 * RFQ creation, bidding, acceptance, and privacy-preserving lender matching.
 */

import { Hono } from "hono";
import { RFQService } from "../services/rfq";
import { userService } from "../services/user";
import { ConsoleLogger } from "../utils/logger";
import { requireAuth } from "../middleware/auth";
import { auth } from "../lib/auth";
import { DAML_CONFIG } from "../config/daml";
import type { RFQData, BidData } from "../services/rfq";

interface CollateralAsset {
  assetId: string;
  assetType: any;
  quantity: number;
  currentValue: number;
  initialValue: number;
  volatilityScore: number;
  liquidityRating: string;
  lastValuationTime: string;
  valuationSource: string;
  haircut: number;
}

const rfq = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

async function generateDamlTokenForUser(
  user: typeof auth.$Infer.Session.user | null
) {
  const damlParty = user?.damlParty;

  if (!damlParty) {
    throw new Error(
      `No DAML party assigned to user: ${user?.name || "unknown"}`
    );
  }

  console.log(
    `Using DAML party: ${damlParty} for user: ${user?.name || "unknown"}`
  );

  try {
    const jwtPayload = {
      sub: user.damlParty,
      aud: process.env.DAML_JWT_AUDIENCE || "daml-ledger",
      iss: process.env.DAML_JWT_ISSUER || "aegis-rfq",
      iat: Math.floor(Date.now() / 1000),
      exp:
        Math.floor(Date.now() / 1000) +
        parseInt(process.env.DAML_JWT_EXPIRY || "86400"),

      "https://daml.com/ledger-api": {
        ledgerId: process.env.DAML_LEDGER_ID || "sandbox",
        applicationId: process.env.DAML_APPLICATION_ID || "aegis-rfq",
        actAs: [user.damlParty],
        readAs: [user.damlParty],
        admin: false,
      },

      scope: "daml:read daml:write",

      uid: user.id,
      role: user.role,
    };

    const jwt = await import("jsonwebtoken");

    const secret =
      process.env.DAML_JWT_SECRET || process.env.BETTER_AUTH_SECRET;
    if (!secret) {
      throw new Error("No JWT secret available");
    }

    const token = jwt.default.sign(jwtPayload, secret, {
      algorithm: "HS256",
    });

    return token;
  } catch (error) {
    console.error("Failed to generate Better Auth JWT token:", error);
    throw new Error("Failed to generate authentication token");
  }
}

const rfqService = RFQService.getInstance();

rfq.use("*", requireAuth);

rfq.get("/", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const status = c.req.query("status");
    const borrower = c.req.query("borrower");
    const asset = c.req.query("asset");
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");

    const result = await rfqService.queryRFQs(authToken);
    const duration = Date.now() - startTime;

    ConsoleLogger.request("GET", "/api/rfqs", result.status, duration);

    if (result.status === 200) {
      const contracts = Array.isArray(result.result) ? result.result : [];
      let rfqs = contracts.map((contract) => {
        const payload = contract.payload as RFQData;
        const now = new Date();
        const expiresAt = new Date(payload.expiresAt);

        const primaryCollateral = payload.collateralAssets[0];
        let collateralAssetType = "Unknown";

        if (primaryCollateral?.assetType) {
          const assetType = primaryCollateral.assetType as any;

          if (
            assetType.tag &&
            assetType.value &&
            typeof assetType.value === "string"
          ) {
            collateralAssetType = assetType.value;
          } else if (assetType.Cryptocurrency) {
            collateralAssetType = assetType.Cryptocurrency[0];
          } else if (assetType.Stablecoin) {
            collateralAssetType = assetType.Stablecoin[0];
          } else if (assetType.GovernmentBond) {
            collateralAssetType = assetType.GovernmentBond[0];
          } else if (assetType.CorporateBond) {
            collateralAssetType = assetType.CorporateBond[0];
          } else if (assetType.Equity) {
            collateralAssetType = assetType.Equity[0];
          } else if (assetType.RealEstateToken) {
            collateralAssetType = assetType.RealEstateToken[0];
          } else if (assetType.Commodity) {
            collateralAssetType = assetType.Commodity[0];
          }
        }

        return {
          contractId: contract.contractId,
          id: `RFQ-${payload.borrower.slice(-8)}`,
          title: `${collateralAssetType} Collateralized Loan`,
          borrower: payload.borrower,
          loanAmount: parseFloat(payload.loanAmount),
          collateralAmount: primaryCollateral?.currentValue || 0,
          collateralAsset: collateralAssetType,
          loanDuration: payload.loanDuration,
          approvedLenders: payload.lenderCriteria.preferredLenders,
          createdAt: payload.createdAt,
          expiresAt: payload.expiresAt,
          status: now > expiresAt ? "expired" : "active",
          collateralRatio: primaryCollateral
            ? (
                primaryCollateral.currentValue / parseFloat(payload.loanAmount)
              ).toFixed(2)
            : "0.00",
          daysRemaining: Math.max(
            0,
            Math.ceil(
              (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            )
          ),
        };
      });

      if (status) {
        rfqs = rfqs.filter((rfq) => rfq.status === status);
      }
      if (borrower) {
        rfqs = rfqs.filter((rfq) => rfq.borrower.includes(borrower));
      }
      if (asset) {
        rfqs = rfqs.filter(
          (rfq) => rfq.collateralAsset.toLowerCase() === asset.toLowerCase()
        );
      }

      const total = rfqs.length;
      const paginatedRfqs = rfqs.slice(offset, offset + limit);

      ConsoleLogger.success(`Retrieved ${paginatedRfqs.length}/${total} RFQs`, {
        filters: { status, borrower, asset },
        pagination: { limit, offset, total },
      });

      return c.json({
        data: paginatedRfqs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        filters: {
          status: status || "all",
          borrower: borrower || "all",
          asset: asset || "all",
        },
      });
    } else {
      ConsoleLogger.error("Failed to get RFQs", result.errors);
      return c.json(
        {
          error: "Failed to retrieve RFQs",
          details: result.errors,
        },
        result.status as any
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get RFQs error", error);
    ConsoleLogger.request("GET", "/api/rfqs", 500, duration);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to process RFQ request",
      },
      500
    );
  }
});

rfq.get("/:contractId", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;
    const result = await rfqService.queryRFQs(authToken);
    const duration = Date.now() - startTime;

    ConsoleLogger.request(
      "GET",
      `/api/rfqs/${contractId}`,
      result.status,
      duration
    );

    if (result.status === 200 && result.result) {
      const rfqContract = result.result.find(
        (contract) => contract.contractId === contractId
      );

      if (!rfqContract) {
        ConsoleLogger.warning(`RFQ not found: ${contractId}`);
        return c.json(
          {
            error: "Not Found",
            message: `RFQ with ID ${contractId} not found`,
          },
          404
        );
      }

      const payload = rfqContract.payload as RFQData;
      const now = new Date();
      const expiresAt = new Date(payload.expiresAt);

      const primaryCollateral = payload.collateralAssets[0];
      let collateralAssetType = "Unknown";

      if (primaryCollateral?.assetType) {
        const assetType = primaryCollateral.assetType as any;

        if (
          assetType.tag &&
          assetType.value &&
          typeof assetType.value === "string"
        ) {
          collateralAssetType = assetType.value;
        } else if (assetType.Cryptocurrency) {
          collateralAssetType = assetType.Cryptocurrency[0];
        } else if (assetType.Stablecoin) {
          collateralAssetType = assetType.Stablecoin[0];
        } else if (assetType.GovernmentBond) {
          collateralAssetType = assetType.GovernmentBond[0];
        } else if (assetType.CorporateBond) {
          collateralAssetType = assetType.CorporateBond[0];
        } else if (assetType.Equity) {
          collateralAssetType = assetType.Equity[0];
        } else if (assetType.RealEstateToken) {
          collateralAssetType = assetType.RealEstateToken[0];
        } else if (assetType.Commodity) {
          collateralAssetType = assetType.Commodity[0];
        }
      }

      const rfqDetails = {
        contractId: rfqContract.contractId,
        templateId: rfqContract.templateId,
        id: `RFQ-${payload.borrower.slice(-8)}`,
        title: `${collateralAssetType} Collateralized Loan`,
        borrower: payload.borrower,
        loanAmount: parseFloat(payload.loanAmount),
        collateralAmount: primaryCollateral?.currentValue || 0,
        collateralAsset: collateralAssetType,
        loanDuration: payload.loanDuration,
        approvedLenders: payload.lenderCriteria.preferredLenders,
        createdAt: payload.createdAt,
        expiresAt: payload.expiresAt,
        status: now > expiresAt ? "expired" : "active",
        collateralRatio: primaryCollateral
          ? (
              primaryCollateral.currentValue / parseFloat(payload.loanAmount)
            ).toFixed(2)
          : "0.00",
        daysRemaining: Math.max(
          0,
          Math.ceil(
            (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )
        ),
        signatories: rfqContract.signatories,
        observers: rfqContract.observers,
      };

      ConsoleLogger.success(`Retrieved RFQ details: ${contractId}`);
      return c.json({ data: rfqDetails });
    } else {
      ConsoleLogger.error("Failed to get RFQ details", result.errors);
      return c.json(
        {
          error: "Failed to retrieve RFQ",
          details: result.errors,
        },
        result.status as any
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get RFQ details error", error);
    ConsoleLogger.request("GET", `/api/rfqs/${contractId}`, 500, duration);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to process RFQ request",
      },
      500
    );
  }
});

rfq.post("/", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;
    const body = await c.req.json();

    const requiredFields = [
      "borrower",
      "loanAmount",
      "collateralAmount",
      "collateralAsset",
      "collateralCategory",
      "loanDurationDays",
      "approvedLenders",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      ConsoleLogger.warning("RFQ creation failed: missing fields", {
        missingFields,
      });
      return c.json(
        {
          error: "Validation Error",
          message: "Missing required fields",
          missingFields,
        },
        400
      );
    }

    if (!DAML_CONFIG.business.supportedAssets.includes(body.collateralAsset)) {
      return c.json(
        {
          error: "Validation Error",
          message: `Unsupported collateral asset: ${body.collateralAsset}`,
          supportedAssets: DAML_CONFIG.business.supportedAssets,
        },
        400
      );
    }

    const collateralRatio =
      parseFloat(body.collateralAmount) / parseFloat(body.loanAmount);
    if (collateralRatio < DAML_CONFIG.business.minCollateralRatio) {
      return c.json(
        {
          error: "Validation Error",
          message: "Insufficient collateral ratio",
          required: DAML_CONFIG.business.minCollateralRatio,
          provided: collateralRatio,
        },
        400
      );
    }

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() +
        DAML_CONFIG.business.defaultRFQExpiryDays * 24 * 60 * 60 * 1000
    );

    const rfqId = `RFQ-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const createAssetType = (category: string, asset: string) => {
      return {
        tag: category,
        value: asset,
      };
    };

    // Calculate correct haircut based on asset category
    const getHaircutForAsset = (category: string) => {
      switch (category.toLowerCase()) {
        case "stablecoin":
          return 0.05;
        case "cryptocurrency":
          return 0.1;
        case "equity":
          return 0.15;
        case "commodity":
          return 0.12;
        case "realestate":
        case "realestatetoken":
          return 0.2;
        case "governmentbond":
        case "corporatebond":
          return 0.05;
        default:
          return 0.1;
      }
    };

    const collateralAsset: CollateralAsset = {
      assetId: `${body.collateralAsset}-${Date.now()}`,
      assetType: createAssetType(body.collateralCategory, body.collateralAsset),
      quantity: parseFloat(body.collateralAmount),
      currentValue: parseFloat(body.collateralAmount),
      initialValue: parseFloat(body.collateralAmount),
      volatilityScore:
        body.collateralCategory.toLowerCase() === "stablecoin" ? 0.05 : 0.3,
      liquidityRating: "HighlyLiquid",
      lastValuationTime: now.toISOString(),
      valuationSource: "Market Oracle",
      haircut: getHaircutForAsset(body.collateralCategory),
    };

    const lenderCriteria = {
      categories: ["Tier1Bank", "InvestmentFund"],
      minimumRating: "BBB",
      geographicRestrictions: [],
      maximumBids: 10,
      requiredCapacity: parseFloat(body.loanAmount),
      preferredLenders: body.approvedLenders,
    };

    const privacySettings = {
      visibilityMode: "CompletelyPrivate",
      allowSecondaryMarket: false,
      dataRetentionDays: 365,
      anonymizeBorrower: true,
      restrictedDataFields: [],
    };

    const collateralRequirements = {
      minimumRatio: 1.2,
      maintenanceRatio: 1.3,
      liquidationRatio: 1.1,
      acceptedAssetTypes: [
        createAssetType(body.collateralCategory, body.collateralAsset),
      ],
      maximumConcentration: 1.0,
    };

    const rfqData: RFQData = {
      rfqId: rfqId,
      borrower: body.borrower,
      loanAmount: body.loanAmount.toString(),
      collateralAssets: [collateralAsset],
      loanDuration: {
        microseconds: (
          parseInt(body.loanDurationDays) *
          24 *
          60 *
          60 *
          1000000
        ).toString(),
      },
      loanPurpose: "Standard loan request",
      lenderCriteria: lenderCriteria,
      privacySettings: privacySettings,
      collateralRequirements: collateralRequirements,
      status: "RFQActive",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      currentBidCount: 0,
      acceptedBidId: undefined,
    };

    const result = await rfqService.createRFQ(rfqData, authToken);
    const duration = Date.now() - startTime;

    ConsoleLogger.request("POST", "/api/rfqs", result.status, duration);

    if (result.status === 200 && result.result) {
      ConsoleLogger.success("RFQ created successfully", {
        contractId: result.result.contractId,
        borrower: rfqData.borrower,
        loanAmount: rfqData.loanAmount,
        collateralAssets: rfqData.collateralAssets.length,
      });

      return c.json(
        {
          message: "RFQ created successfully",
          data: {
            contractId: result.result.contractId,
            rfq: rfqData,
          },
        },
        201
      );
    } else {
      ConsoleLogger.error("RFQ creation failed", result.errors);
      return c.json(
        {
          error: "Failed to create RFQ",
          details: result.errors,
        },
        result.status as any
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Create RFQ error", error);
    ConsoleLogger.request("POST", "/api/rfqs", 500, duration);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to process RFQ creation",
      },
      500
    );
  }
});

rfq.post("/:contractId/bids", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;
    const body = await c.req.json();

    const requiredFields = [
      "lender",
      "interestRate",
      "paymentFrequency",
      "additionalTerms",
    ];
    const missingFields = requiredFields.filter(
      (field) => body[field] === undefined
    );

    if (missingFields.length > 0) {
      ConsoleLogger.warning("Bid submission failed: missing fields", {
        missingFields,
      });
      return c.json(
        {
          error: "Validation Error",
          message: "Missing required fields",
          missingFields,
        },
        400
      );
    }

    const interestRate = parseFloat(body.interestRate);
    const interestRateDecimal = interestRate / 100;
    if (interestRateDecimal > DAML_CONFIG.business.maxInterestRate) {
      return c.json(
        {
          error: "Validation Error",
          message: "Interest rate too high",
          maximum: `${(DAML_CONFIG.business.maxInterestRate * 100).toFixed(
            1
          )}%`,
          provided: `${interestRate.toFixed(2)}%`,
        },
        400
      );
    }

    const validFrequencies = [
      "Monthly",
      "Quarterly",
      "SemiAnnual",
      "Annual",
      "Bullet",
    ];
    if (!validFrequencies.includes(body.paymentFrequency)) {
      return c.json(
        {
          error: "Validation Error",
          message: "Invalid payment frequency",
          validOptions: validFrequencies,
          provided: body.paymentFrequency,
        },
        400
      );
    }

    // Get the RFQ data to construct proper bid reference
    const rfqResult = await rfqService.queryRFQs(authToken);
    if (rfqResult.status !== 200) {
      return c.json(
        {
          error: "Failed to retrieve RFQ",
          details: rfqResult.errors,
        },
        rfqResult.status as any
      );
    }

    const rfqContract = rfqResult.result?.find(
      (contract) => contract.contractId === contractId
    );

    if (!rfqContract) {
      return c.json(
        {
          error: "RFQ not found",
          message: `RFQ with ID ${contractId} not found`,
        },
        404
      );
    }

    const rfqPayload = rfqContract.payload as RFQData;

    const lenderProfile = await userService.getLenderProfile(body.lender);

    // Calculate lender rating based on performance and admin overrides
    const calculateLenderRating = (profile: any): string => {
      // 1. Use admin-set internal rating if available
      if (profile.internalRating) {
        return profile.internalRating;
      }

      // 2. Calculate based on performance metrics
      const defaultRate = parseFloat(profile.defaultRate || "0");
      const activeLoans = profile.activeLoans || 0;
      const tier = profile.ratingTier;

      // Performance-based rating calculation
      let baseRating: string;

      if (defaultRate === 0 && activeLoans >= 10) {
        // Excellent track record
        baseRating =
          tier === "Premium" ? "AAA" : tier === "Standard" ? "AA" : "A";
      } else if (defaultRate <= 0.02 && activeLoans >= 5) {
        // Good track record
        baseRating =
          tier === "Premium" ? "AA" : tier === "Standard" ? "A" : "BBB";
      } else if (defaultRate <= 0.05) {
        // Acceptable track record
        baseRating =
          tier === "Premium" ? "A" : tier === "Standard" ? "BBB" : "BB";
      } else {
        // Higher risk
        baseRating =
          tier === "Premium" ? "BBB" : tier === "Standard" ? "BB" : "B";
      }

      return baseRating;
    };

    if (!lenderProfile) {
      return c.json(
        {
          success: false,
          error: {
            code: "LENDER_PROFILE_REQUIRED",
            message: "Lender profile is required for bid submission",
          },
        },
        400
      );
    }

    // Calculate lender rating
    const lenderRating = calculateLenderRating(lenderProfile);

    // Create lender profile data for bid
    const lenderProfileData = {
      anonymousId: lenderProfile.anonymousId,
      categoryTier: lenderProfile.categoryTier,
      ratingTier: lenderProfile.ratingTier,
      rating: lenderRating,
      totalCapacity: lenderProfile.internalCapacity || "1000000.0",
      availableCapacity: lenderProfile.internalAvailableCapacity || "500000.0",
      activeLoans: lenderProfile.activeLoans || 0,
      defaultRate: lenderProfile.defaultRate || "0.0",
      geographicFocus: [lenderProfile.geographicScope || "Global"],
    };

    const result = await rfqService.submitBid(
      contractId,
      body.lender,
      lenderProfileData,
      { baseRate: interestRateDecimal.toString(), rateType: "Fixed" },
      { frequency: body.paymentFrequency, installments: [] },
      [],
      body.additionalTerms,
      authToken
    );
    const duration = Date.now() - startTime;

    ConsoleLogger.request(
      "POST",
      `/api/rfqs/${contractId}/bids`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Bid submitted successfully", {
        contractId,
        lender: body.lender,
        interestRate: `${interestRate.toFixed(2)}%`,
      });

      return c.json(
        {
          message: "Bid submitted successfully",
          data: {
            rfqContractId: contractId,
            bidId: result.result?.contractId,
          },
        },
        201
      );
    } else {
      ConsoleLogger.error("Bid submission failed", result.errors);
      return c.json(
        {
          error: "Failed to submit bid",
          details: result.errors,
        },
        result.status as any
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Submit bid error", error);
    ConsoleLogger.request(
      "POST",
      `/api/rfqs/${contractId}/bids`,
      500,
      duration
    );
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to process bid submission",
      },
      500
    );
  }
});

// Get bids for a specific RFQ (for borrowers to see bids on their RFQs)
rfq.get("/:contractId/bids", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    // First, verify the user has access to this RFQ
    const rfqResult = await rfqService.queryRFQs(authToken);
    if (rfqResult.status !== 200) {
      return c.json(
        {
          error: "Failed to verify RFQ access",
          details: rfqResult.errors,
        },
        rfqResult.status as any
      );
    }

    const rfqContract = rfqResult.result?.find(
      (contract) => contract.contractId === contractId
    );

    if (!rfqContract) {
      return c.json(
        {
          error: "RFQ not found",
          message: `RFQ with ID ${contractId} not found`,
        },
        404
      );
    }

    const rfqPayload = rfqContract.payload as RFQData;

    // Check if user is the borrower (can see all bids) or an approved lender (can see own bids)
    const userParty = user?.damlParty;
    const isBorrower = rfqPayload.borrower === userParty;
    const isApprovedLender =
      rfqPayload.lenderCriteria.preferredLenders.includes(userParty || "");

    if (!isBorrower && !isApprovedLender) {
      return c.json(
        {
          error: "Access denied",
          message: "You don't have permission to view bids for this RFQ",
        },
        403
      );
    }

    // Get all bids
    const bidsResult = await rfqService.queryBids(authToken);
    const duration = Date.now() - startTime;

    ConsoleLogger.request(
      "GET",
      `/api/rfqs/${contractId}/bids`,
      bidsResult.status,
      duration
    );

    if (bidsResult.status === 200) {
      const allBids = Array.isArray(bidsResult.result) ? bidsResult.result : [];

      // Filter bids for this RFQ using proper DAML rfqId reference
      const rfqIdentifier = `${rfqPayload.borrower}:${rfqPayload.rfqId}`;

      let rfqBids = allBids.filter((bidContract) => {
        const bidPayload = bidContract.payload as BidData;

        if (!bidPayload.rfqId) return false;

        let bidRfqIdentifier: string;

        // Handle different possible structures of rfqId from DAML
        if (typeof bidPayload.rfqId === "object" && bidPayload.rfqId !== null) {
          // If it's an object with _1 and _2 properties (DAML tuple)
          if ("_1" in bidPayload.rfqId && "_2" in bidPayload.rfqId) {
            bidRfqIdentifier = `${bidPayload.rfqId._1}:${bidPayload.rfqId._2}`;
          }
          // If it's an array [party, text]
          else if (
            Array.isArray(bidPayload.rfqId) &&
            bidPayload.rfqId.length === 2
          ) {
            bidRfqIdentifier = `${bidPayload.rfqId[0]}:${bidPayload.rfqId[1]}`;
          }
          // If it has party and rfqId properties
          else if ("party" in bidPayload.rfqId && "rfqId" in bidPayload.rfqId) {
            bidRfqIdentifier = `${bidPayload.rfqId.party}:${bidPayload.rfqId.rfqId}`;
          } else {
            // Fallback: try to construct from borrower
            bidRfqIdentifier = `${bidPayload.borrower}:${
              bidPayload.bidId || "unknown"
            }`;
          }
        } else {
          // If it's a string, use it directly
          bidRfqIdentifier = String(bidPayload.rfqId);
        }

        return bidRfqIdentifier === rfqIdentifier;
      });

      // If user is a lender, only show their own bids
      if (!isBorrower && isApprovedLender) {
        rfqBids = rfqBids.filter((bidContract) => {
          const bidPayload = bidContract.payload as BidData;
          return bidPayload.lender === userParty;
        });
      }

      // Format bids for response
      const formattedBids = rfqBids.map((bidContract) => {
        const bidPayload = bidContract.payload as BidData;
        const interestRateBase =
          bidPayload.interestRateStructure?.baseRate || "0.05";
        const interestRatePercent = (
          parseFloat(interestRateBase) * 100
        ).toFixed(2);

        return {
          contractId: bidContract.contractId,
          lender: isBorrower ? bidPayload.lender : "***", // Hide lender identity from other lenders
          interestRate: `${interestRatePercent}%`,
          interestRateDecimal: interestRateBase,
          additionalTerms: bidPayload.additionalTerms,
          submittedAt:
            (bidContract as any).createdAt ||
            bidPayload.submittedAt ||
            new Date().toISOString(),
          status: bidPayload.status || "active", // You might want to track bid status
        };
      });

      ConsoleLogger.success(
        `Retrieved ${formattedBids.length} bids for RFQ ${contractId}`,
        {
          rfqId: contractId,
          bidCount: formattedBids.length,
          userRole: isBorrower ? "borrower" : "lender",
        }
      );

      return c.json({
        data: formattedBids,
        metadata: {
          rfqId: contractId,
          totalBids: formattedBids.length,
          userRole: isBorrower ? "borrower" : "lender",
          canAcceptBids: isBorrower,
        },
      });
    } else {
      ConsoleLogger.error("Failed to get bids", bidsResult.errors);
      return c.json(
        {
          error: "Failed to retrieve bids",
          details: bidsResult.errors,
        },
        bidsResult.status as any
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get bids error", error);
    ConsoleLogger.request("GET", `/api/rfqs/${contractId}/bids`, 500, duration);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to process bids request",
      },
      500
    );
  }
});

// Get all bids for the current user (for lenders to see their submitted bids)
rfq.get("/bids/my-bids", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;
    const userParty = user?.damlParty;

    if (!userParty) {
      return c.json(
        {
          error: "Authentication required",
          message: "User party not found",
        },
        401
      );
    }

    // Get all bids
    const bidsResult = await rfqService.queryBids(authToken);
    const duration = Date.now() - startTime;

    ConsoleLogger.request(
      "GET",
      "/api/rfqs/bids/my-bids",
      bidsResult.status,
      duration
    );

    if (bidsResult.status === 200) {
      const allBids = Array.isArray(bidsResult.result) ? bidsResult.result : [];

      // Filter to only user's bids
      const userBids = allBids.filter((bidContract) => {
        const bidPayload = bidContract.payload as BidData;
        return bidPayload.lender === userParty;
      });

      // Get RFQ details for each bid
      const rfqsResult = await rfqService.queryRFQs(authToken);
      const allRFQs = Array.isArray(rfqsResult.result) ? rfqsResult.result : [];

      // Format bids with RFQ information
      const formattedBids = userBids.map((bidContract) => {
        const bidPayload = bidContract.payload as BidData;
        const interestRateBase =
          bidPayload.interestRateStructure?.baseRate || "0.05";
        const interestRatePercent = (
          parseFloat(interestRateBase) * 100
        ).toFixed(2);

        // Find associated RFQ (this is simplified - you might need better matching logic)
        const associatedRFQ = allRFQs[0]; // Placeholder - implement proper matching
        const rfqPayload = associatedRFQ?.payload as RFQData;

        return {
          bidContractId: bidContract.contractId,
          rfqContractId: associatedRFQ?.contractId || "unknown",
          rfqTitle: rfqPayload
            ? `${rfqPayload.loanAmount} Loan Request`
            : "Unknown RFQ",
          borrower: rfqPayload?.borrower || "Unknown",
          loanAmount: rfqPayload ? parseFloat(rfqPayload.loanAmount) : 0,
          collateralAsset: "Unknown",
          interestRate: `${interestRatePercent}%`,
          interestRateDecimal: interestRateBase,
          additionalTerms: bidPayload.additionalTerms,
          submittedAt:
            (bidContract as any).createdAt ||
            bidPayload.submittedAt ||
            new Date().toISOString(),
          status: bidPayload.status || "pending", // You might want to track if bid was accepted/rejected
          rfqStatus: rfqPayload
            ? new Date() > new Date(rfqPayload.expiresAt)
              ? "expired"
              : "active"
            : "unknown",
          rfqExpiresAt: rfqPayload?.expiresAt,
        };
      });

      ConsoleLogger.success(
        `Retrieved ${formattedBids.length} bids for user ${userParty}`,
        {
          userParty,
          bidCount: formattedBids.length,
        }
      );

      return c.json({
        data: formattedBids,
        metadata: {
          totalBids: formattedBids.length,
          userParty,
        },
      });
    } else {
      ConsoleLogger.error("Failed to get user bids", bidsResult.errors);
      return c.json(
        {
          error: "Failed to retrieve bids",
          details: bidsResult.errors,
        },
        bidsResult.status as any
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get user bids error", error);
    ConsoleLogger.request("GET", "/api/rfqs/bids/my-bids", 500, duration);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to process user bids request",
      },
      500
    );
  }
});

rfq.post("/:contractId/accept-bid", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;
    const body = await c.req.json();

    if (!body.bidContractId) {
      return c.json(
        {
          error: "Validation Error",
          message: "Missing bidContractId",
        },
        400
      );
    }

    const result = await rfqService.acceptBid(
      contractId,
      body.bidContractId,
      authToken
    );
    const duration = Date.now() - startTime;

    ConsoleLogger.request(
      "POST",
      `/api/rfqs/${contractId}/accept-bid`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Bid accepted successfully", {
        rfqContractId: contractId,
        bidContractId: body.bidContractId,
      });

      return c.json({
        message: "Bid accepted successfully",
        data: result.result,
      });
    } else {
      ConsoleLogger.error("Bid acceptance failed", result.errors);
      return c.json(
        {
          error: "Failed to accept bid",
          details: result.errors,
        },
        result.status as any
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Accept bid error", error);
    ConsoleLogger.request(
      "POST",
      `/api/rfqs/${contractId}/accept-bid`,
      500,
      duration
    );
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to process bid acceptance",
      },
      500
    );
  }
});

// RFQ MANAGEMENT - ADDITIONAL CHOICES

// Start review on RFQ
rfq.post("/:contractId/start-review", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await rfqService.startReview(contractId, authToken);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/rfqs/${contractId}/start-review`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("RFQ moved to review", { contractId });
      return c.json({
        message: "RFQ moved to under review",
        data: result.result,
      });
    }

    return c.json(
      { error: "Failed to start review", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Start review error", error);
    ConsoleLogger.request(
      "POST",
      `/api/rfqs/${contractId}/start-review`,
      500,
      duration
    );
    return c.json(
      { error: "Internal server error", message: "Failed to start review" },
      500
    );
  }
});

// Cancel RFQ
rfq.post("/:contractId/cancel", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await rfqService.cancelRFQ(
      contractId,
      body.reason,
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/rfqs/${contractId}/cancel`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("RFQ cancelled", {
        contractId,
        reason: body.reason,
      });
      return c.json({ message: "RFQ cancelled successfully" });
    }

    return c.json(
      { error: "Failed to cancel RFQ", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Cancel RFQ error", error);
    ConsoleLogger.request(
      "POST",
      `/api/rfqs/${contractId}/cancel`,
      500,
      duration
    );
    return c.json(
      { error: "Internal server error", message: "Failed to cancel RFQ" },
      500
    );
  }
});

// Extend RFQ expiration
rfq.post("/:contractId/extend", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await rfqService.extendExpiration(
      contractId,
      body.newExpiresAt,
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/rfqs/${contractId}/extend`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("RFQ expiration extended", {
        contractId,
        newExpiresAt: body.newExpiresAt,
      });
      return c.json({
        message: "RFQ expiration extended successfully",
        data: result.result,
      });
    }

    return c.json(
      { error: "Failed to extend RFQ", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Extend RFQ error", error);
    ConsoleLogger.request(
      "POST",
      `/api/rfqs/${contractId}/extend`,
      500,
      duration
    );
    return c.json(
      { error: "Internal server error", message: "Failed to extend RFQ" },
      500
    );
  }
});

// Mark RFQ as expired
rfq.post("/:contractId/mark-expired", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await rfqService.markExpired(contractId, authToken);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/rfqs/${contractId}/mark-expired`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("RFQ marked as expired", { contractId });
      return c.json({
        message: "RFQ marked as expired",
        data: result.result,
      });
    }

    return c.json(
      { error: "Failed to mark RFQ as expired", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Mark expired error", error);
    ConsoleLogger.request(
      "POST",
      `/api/rfqs/${contractId}/mark-expired`,
      500,
      duration
    );
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to mark RFQ as expired",
      },
      500
    );
  }
});

export { rfq };
