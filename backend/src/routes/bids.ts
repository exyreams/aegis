/**
 * Bidding Routes
 *
 * Dedicated routes for bid management, visibility, and tracking.
 * Provides endpoints for lenders to view their bids and borrowers to see bids on their RFQs.
 */

import { Hono } from "hono";
import { DamlService } from "../services/daml";
import { userService } from "../services/user";
import { ConsoleLogger } from "../utils/logger";
import { requireAuth } from "../middleware/auth";
import { auth } from "../lib/auth";
import type { RFQData, BidData } from "../services/daml";

const bids = new Hono<{
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

const damlService = DamlService.getInstance();

bids.use("*", requireAuth);

// Get all bids submitted by the current user (lender dashboard)
bids.get("/my-bids", async (c) => {
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

    // Get all bids and RFQs
    const [bidsResult, rfqsResult] = await Promise.all([
      damlService.getBids(authToken),
      damlService.getRFQs(authToken),
    ]);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/bids/my-bids",
      bidsResult.status,
      duration
    );

    if (bidsResult.status === 200 && rfqsResult.status === 200) {
      const allBids = Array.isArray(bidsResult.result) ? bidsResult.result : [];
      const allRFQs = Array.isArray(rfqsResult.result) ? rfqsResult.result : [];

      // Filter to only user's bids
      const userBids = allBids.filter((bidContract) => {
        const bidPayload = bidContract.payload as BidData;
        return bidPayload.lender === userParty;
      });

      // Create a map of RFQs for quick lookup
      const rfqMap = new Map();
      allRFQs.forEach((rfq) => {
        rfqMap.set(rfq.contractId, rfq);
      });

      // Format bids with RFQ information
      const formattedBids = userBids.map((bidContract) => {
        const bidPayload = bidContract.payload as BidData;
        const interestRatePercent = (
          parseFloat(bidPayload.interestRate) * 100
        ).toFixed(2);

        // Find associated RFQ using proper DAML bid.rfqId reference
        let associatedRFQ = null;
        let rfqPayload = null;

        if (bidPayload.rfqId) {
          let rfqIdentifier: string;

          // Handle different possible structures of rfqId from DAML
          if (
            typeof bidPayload.rfqId === "object" &&
            bidPayload.rfqId !== null
          ) {
            // If it's an object with _1 and _2 properties (DAML tuple)
            if ("_1" in bidPayload.rfqId && "_2" in bidPayload.rfqId) {
              rfqIdentifier = `${bidPayload.rfqId._1}:${bidPayload.rfqId._2}`;
            }
            // If it's an array [party, text]
            else if (
              Array.isArray(bidPayload.rfqId) &&
              bidPayload.rfqId.length === 2
            ) {
              rfqIdentifier = `${bidPayload.rfqId[0]}:${bidPayload.rfqId[1]}`;
            }
            // If it has party and rfqId properties
            else if (
              "party" in bidPayload.rfqId &&
              "rfqId" in bidPayload.rfqId
            ) {
              rfqIdentifier = `${bidPayload.rfqId.party}:${bidPayload.rfqId.rfqId}`;
            } else {
              // Fallback: try to construct from borrower and some ID
              rfqIdentifier = `${bidPayload.borrower || "unknown"}:${
                bidPayload.bidId || "unknown"
              }`;
            }
          } else {
            // If it's a string, use it directly
            rfqIdentifier = bidPayload.rfqId.toString();
          }

          // Find the matching RFQ by constructing the same identifier
          for (const [rfqId, rfq] of rfqMap) {
            const rfqData = rfq.payload as RFQData;
            const rfqLookupId = `${rfqData.borrower}:${rfqData.rfqId}`;

            if (rfqLookupId === rfqIdentifier) {
              associatedRFQ = rfq;
              rfqPayload = rfqData;
              break;
            }
          }

          // If no exact match found, try to match by borrower as fallback
          if (!associatedRFQ) {
            for (const [rfqId, rfq] of rfqMap) {
              const rfqData = rfq.payload as RFQData;
              if (rfqData.borrower === bidPayload.borrower) {
                associatedRFQ = rfq;
                rfqPayload = rfqData;
                break;
              }
            }
          }
        }

        return {
          bidContractId: bidContract.contractId,
          rfqContractId: associatedRFQ?.contractId || "unknown",
          rfqTitle: rfqPayload
            ? `${parseFloat(rfqPayload.loanAmount).toLocaleString()} ${
                rfqPayload.collateralAssets[0]?.assetType || "Asset"
              } Loan`
            : "Unknown RFQ",
          borrower: rfqPayload?.borrower || "Unknown",
          loanAmount: rfqPayload ? parseFloat(rfqPayload.loanAmount) : 0,
          collateralAsset:
            rfqPayload?.collateralAssets[0]?.assetType || "Unknown",
          interestRate: `${interestRatePercent}%`,
          interestRateDecimal: bidPayload.interestRate,
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

      // Sort by submission date (newest first)
      formattedBids.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      ConsoleLogger.success(
        `Retrieved ${formattedBids.length} bids for lender ${userParty}`,
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
          userRole: user?.role,
        },
      });
    } else {
      ConsoleLogger.error("Failed to get user bids", {
        bidsError: bidsResult.errors,
        rfqsError: rfqsResult.errors,
      });
      return c.json(
        {
          error: "Failed to retrieve bids",
          details: {
            bids: bidsResult.errors,
            rfqs: rfqsResult.errors,
          },
        },
        500
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get user bids error", error);
    ConsoleLogger.request("GET", "/api/bids/my-bids", 500, duration);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to process user bids request",
      },
      500
    );
  }
});

// Get bids received on user's RFQs (borrower dashboard)
bids.get("/received", async (c) => {
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

    // Get all bids and RFQs
    const [bidsResult, rfqsResult] = await Promise.all([
      damlService.getBids(authToken),
      damlService.getRFQs(authToken),
    ]);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/bids/received",
      bidsResult.status,
      duration
    );

    if (bidsResult.status === 200 && rfqsResult.status === 200) {
      const allBids = Array.isArray(bidsResult.result) ? bidsResult.result : [];
      const allRFQs = Array.isArray(rfqsResult.result) ? rfqsResult.result : [];

      // Filter to only user's RFQs
      const userRFQs = allRFQs.filter((rfqContract) => {
        const rfqPayload = rfqContract.payload as RFQData;
        return rfqPayload.borrower === userParty;
      });

      // Create a map of user's RFQs
      const userRFQMap = new Map();
      userRFQs.forEach((rfq) => {
        userRFQMap.set(rfq.contractId, rfq);
      });

      // Group bids by RFQ using proper DAML structure
      const bidsByRFQ = new Map();

      // Initialize empty arrays for each user RFQ
      userRFQs.forEach((rfq) => {
        bidsByRFQ.set(rfq.contractId, []);
      });

      // Create a mapping of RFQ identifiers to contract IDs for lookup
      const rfqIdentifierMap = new Map();
      userRFQs.forEach((rfqContract) => {
        const rfqPayload = rfqContract.payload as RFQData;
        // The rfqId in DAML is (Party, Text) - (borrower, rfqId)
        const rfqIdentifier = `${rfqPayload.borrower}:${rfqPayload.rfqId}`;
        rfqIdentifierMap.set(rfqIdentifier, rfqContract.contractId);
      });

      // Properly link bids to RFQs using the rfqId field from DAML Bid template
      allBids.forEach((bidContract) => {
        const bidPayload = bidContract.payload as BidData;

        // In DAML, bid.rfqId is (Party, Text) structure
        // We need to reconstruct this to match our RFQ lookup
        if (bidPayload.rfqId) {
          let rfqIdentifier: string;

          // Handle different possible structures of rfqId from DAML
          if (
            typeof bidPayload.rfqId === "object" &&
            bidPayload.rfqId !== null
          ) {
            // If it's an object with _1 and _2 properties (DAML tuple)
            if ("_1" in bidPayload.rfqId && "_2" in bidPayload.rfqId) {
              rfqIdentifier = `${bidPayload.rfqId._1}:${bidPayload.rfqId._2}`;
            }
            // If it's an array [party, text]
            else if (
              Array.isArray(bidPayload.rfqId) &&
              bidPayload.rfqId.length === 2
            ) {
              rfqIdentifier = `${bidPayload.rfqId[0]}:${bidPayload.rfqId[1]}`;
            }
            // If it has party and rfqId properties
            else if (
              "party" in bidPayload.rfqId &&
              "rfqId" in bidPayload.rfqId
            ) {
              rfqIdentifier = `${bidPayload.rfqId.party}:${bidPayload.rfqId.rfqId}`;
            } else {
              // Fallback: try to construct from borrower and some ID
              rfqIdentifier = `${bidPayload.borrower || userParty}:${
                bidPayload.bidId || "unknown"
              }`;
            }
          } else {
            // If it's a string, try to parse it
            rfqIdentifier = bidPayload.rfqId.toString();
          }

          // Find the matching RFQ contract ID
          const rfqContractId = rfqIdentifierMap.get(rfqIdentifier);

          if (rfqContractId && bidsByRFQ.has(rfqContractId)) {
            bidsByRFQ.get(rfqContractId).push(bidContract);
          } else {
            // If we can't match by rfqId, try to match by borrower
            // This is a fallback for cases where the structure is different
            const matchingRFQ = userRFQs.find((rfq) => {
              const rfqPayload = rfq.payload as RFQData;
              return rfqPayload.borrower === bidPayload.borrower;
            });

            if (matchingRFQ) {
              bidsByRFQ.get(matchingRFQ.contractId).push(bidContract);
            }
          }
        }
      });

      // Format the response
      const rfqsWithBids = Array.from(bidsByRFQ.entries()).map(
        ([rfqId, bids]) => {
          const rfqContract = userRFQMap.get(rfqId);
          const rfqPayload = rfqContract?.payload as RFQData;

          const formattedBids = bids.map((bidContract: any) => {
            const bidPayload = bidContract.payload as BidData;
            const interestRatePercent = (
              parseFloat(bidPayload.interestRate) * 100
            ).toFixed(2);

            return {
              bidContractId: bidContract.contractId,
              lender: bidPayload.lender,
              interestRate: `${interestRatePercent}%`,
              interestRateDecimal: bidPayload.interestRate,
              additionalTerms: bidPayload.additionalTerms,
              submittedAt:
                (bidContract as any).createdAt ||
                bidPayload.submittedAt ||
                new Date().toISOString(),
              status: bidPayload.status || "pending",
            };
          });

          // Sort bids by interest rate (lowest first)
          formattedBids.sort(
            (a: any, b: any) =>
              parseFloat(a.interestRateDecimal) -
              parseFloat(b.interestRateDecimal)
          );

          return {
            rfqContractId: rfqId,
            rfqTitle: rfqPayload
              ? `${parseFloat(rfqPayload.loanAmount).toLocaleString()} ${
                  rfqPayload.collateralAssets[0]?.assetType || "Asset"
                } Loan`
              : "Unknown RFQ",
            loanAmount: rfqPayload ? parseFloat(rfqPayload.loanAmount) : 0,
            collateralAsset:
              rfqPayload?.collateralAssets[0]?.assetType || "Unknown",
            rfqStatus: rfqPayload
              ? new Date() > new Date(rfqPayload.expiresAt)
                ? "expired"
                : "active"
              : "unknown",
            rfqExpiresAt: rfqPayload?.expiresAt,
            bidCount: formattedBids.length,
            bids: formattedBids,
            bestRate:
              formattedBids.length > 0 ? formattedBids[0].interestRate : null,
          };
        }
      );

      // Filter out RFQs with no bids for cleaner response
      const rfqsWithActiveBids = rfqsWithBids.filter((rfq) => rfq.bidCount > 0);

      ConsoleLogger.success(
        `Retrieved bids for ${rfqsWithActiveBids.length} RFQs for borrower ${userParty}`,
        {
          userParty,
          rfqCount: rfqsWithActiveBids.length,
          totalBids: rfqsWithActiveBids.reduce(
            (sum, rfq) => sum + rfq.bidCount,
            0
          ),
        }
      );

      return c.json({
        data: rfqsWithActiveBids,
        metadata: {
          totalRFQs: rfqsWithActiveBids.length,
          totalBids: rfqsWithActiveBids.reduce(
            (sum, rfq) => sum + rfq.bidCount,
            0
          ),
          userParty,
          userRole: user?.role,
        },
      });
    } else {
      ConsoleLogger.error("Failed to get received bids", {
        bidsError: bidsResult.errors,
        rfqsError: rfqsResult.errors,
      });
      return c.json(
        {
          error: "Failed to retrieve received bids",
          details: {
            bids: bidsResult.errors,
            rfqs: rfqsResult.errors,
          },
        },
        500
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get received bids error", error);
    ConsoleLogger.request("GET", "/api/bids/received", 500, duration);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to process received bids request",
      },
      500
    );
  }
});

// Get bid statistics for dashboard
bids.get("/stats", async (c) => {
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

    const [bidsResult, rfqsResult] = await Promise.all([
      damlService.getBids(authToken),
      damlService.getRFQs(authToken),
    ]);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/bids/stats",
      bidsResult.status,
      duration
    );

    if (bidsResult.status === 200 && rfqsResult.status === 200) {
      const allBids = Array.isArray(bidsResult.result) ? bidsResult.result : [];
      const allRFQs = Array.isArray(rfqsResult.result) ? rfqsResult.result : [];

      let stats = {};

      if (user?.role === "lender") {
        // Lender statistics
        const userBids = allBids.filter((bidContract) => {
          const bidPayload = bidContract.payload as BidData;
          return bidPayload.lender === userParty;
        });

        const interestRates = userBids.map((bid) =>
          parseFloat((bid.payload as BidData).interestRate)
        );
        const avgInterestRate =
          interestRates.length > 0
            ? (
                (interestRates.reduce((sum, rate) => sum + rate, 0) /
                  interestRates.length) *
                100
              ).toFixed(2)
            : "0.00";

        stats = {
          totalBidsSubmitted: userBids.length,
          averageInterestRate: `${avgInterestRate}%`,
          pendingBids: userBids.length, // Simplified - you'd track actual status
          acceptedBids: 0, // You'd track this from loan contracts
          rejectedBids: 0, // You'd track this from bid status
        };
      } else if (user?.role === "borrower") {
        // Borrower statistics
        const userRFQs = allRFQs.filter((rfqContract) => {
          const rfqPayload = rfqContract.payload as RFQData;
          return rfqPayload.borrower === userParty;
        });

        // Simplified bid counting - you'd implement proper RFQ-to-bid mapping
        const totalBidsReceived = Math.min(allBids.length, userRFQs.length * 3); // Placeholder

        stats = {
          totalRFQsCreated: userRFQs.length,
          totalBidsReceived: totalBidsReceived,
          activeRFQs: userRFQs.filter((rfq) => {
            const payload = rfq.payload as RFQData;
            return new Date() <= new Date(payload.expiresAt);
          }).length,
          completedLoans: 0, // You'd track this from loan contracts
        };
      }

      ConsoleLogger.success(
        `Retrieved bid statistics for ${user?.role} ${userParty}`
      );

      return c.json({
        data: stats,
        metadata: {
          userParty,
          userRole: user?.role,
          generatedAt: new Date().toISOString(),
        },
      });
    } else {
      return c.json(
        {
          error: "Failed to retrieve bid statistics",
          details: {
            bids: bidsResult.errors,
            rfqs: rfqsResult.errors,
          },
        },
        500
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get bid stats error", error);
    ConsoleLogger.request("GET", "/api/bids/stats", 500, duration);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to process bid statistics request",
      },
      500
    );
  }
});

// BID MANAGEMENT - CHOICE ENDPOINTS

// Withdraw bid
bids.post("/:contractId/withdraw", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.exerciseChoice(
      {
        templateId: process.env.DAML_TEMPLATE_BID!,
        contractId,
        choice: "WithdrawBid",
        argument: {},
      },
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/bids/${contractId}/withdraw`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Bid withdrawn", { contractId });
      return c.json({ message: "Bid withdrawn successfully" });
    }

    return c.json(
      { error: "Failed to withdraw bid", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Withdraw bid error", error);
    ConsoleLogger.request(
      "POST",
      `/api/bids/${contractId}/withdraw`,
      500,
      duration
    );
    return c.json(
      { error: "Internal server error", message: "Failed to withdraw bid" },
      500
    );
  }
});

// Modify bid
bids.post("/:contractId/modify", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.exerciseChoice(
      {
        templateId: process.env.DAML_TEMPLATE_BID!,
        contractId,
        choice: "ModifyBid",
        argument: {
          newInterestRateStructure: body.newInterestRateStructure,
          newRepaymentSchedule: body.newRepaymentSchedule,
          newProposedCovenants: body.newProposedCovenants,
          newAdditionalTerms: body.newAdditionalTerms,
        },
      },
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/bids/${contractId}/modify`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Bid modified", { contractId });
      return c.json({
        message: "Bid modified successfully",
        data: result.result,
      });
    }

    return c.json(
      { error: "Failed to modify bid", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Modify bid error", error);
    ConsoleLogger.request(
      "POST",
      `/api/bids/${contractId}/modify`,
      500,
      duration
    );
    return c.json(
      { error: "Internal server error", message: "Failed to modify bid" },
      500
    );
  }
});

// Mark bid as under review
bids.post("/:contractId/mark-review", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.exerciseChoice(
      {
        templateId: process.env.DAML_TEMPLATE_BID!,
        contractId,
        choice: "MarkUnderReview",
        argument: {},
      },
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/bids/${contractId}/mark-review`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Bid marked under review", { contractId });
      return c.json({
        message: "Bid marked as under review",
        data: result.result,
      });
    }

    return c.json(
      { error: "Failed to mark bid under review", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Mark bid review error", error);
    ConsoleLogger.request(
      "POST",
      `/api/bids/${contractId}/mark-review`,
      500,
      duration
    );
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to mark bid under review",
      },
      500
    );
  }
});

// Reject bid
bids.post("/:contractId/reject", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.exerciseChoice(
      {
        templateId: process.env.DAML_TEMPLATE_BID!,
        contractId,
        choice: "RejectBid",
        argument: { reason: body.reason },
      },
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/bids/${contractId}/reject`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Bid rejected", {
        contractId,
        reason: body.reason,
      });
      return c.json({ message: "Bid rejected successfully" });
    }

    return c.json(
      { error: "Failed to reject bid", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Reject bid error", error);
    ConsoleLogger.request(
      "POST",
      `/api/bids/${contractId}/reject`,
      500,
      duration
    );
    return c.json(
      { error: "Internal server error", message: "Failed to reject bid" },
      500
    );
  }
});

export { bids };
