import { Hono } from "hono";
import { SecondaryMarketService } from "../services/secondary-market";
import { ConsoleLogger } from "../utils/logger";
import { generateDamlToken } from "../utils/daml-token";
import { auth } from "../lib/auth";
import { DAML_CONFIG } from "../config/daml";

type Variables = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const secondaryMarket = new Hono<{ Variables: Variables }>();
const secondaryMarketService = SecondaryMarketService.getInstance();

function getTemplateId(templateName: string): string {
  const template = (DAML_CONFIG.templates as any)[templateName];
  if (!template) {
    throw new Error(`Template ${templateName} not found in DAML_CONFIG`);
  }
  return template;
}

// Helper function to generate DAML token for user
async function generateDamlTokenForUser(user: any): Promise<string> {
  if (!user?.damlParty) {
    throw new Error("User not authenticated");
  }
  return generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
}

// LOAN LISTING ENDPOINTS

// Get all loan listings
secondaryMarket.get("/listings", async (c) => {
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
    const result = await secondaryMarketService.queryLoanListings(authToken, user);

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
      { success: false, error: "Failed to fetch loan listings" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get loan listings error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Create loan listing
secondaryMarket.post("/listings", async (c) => {
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
    const listingData = {
      listingId: body.listingId || `LISTING-${Date.now()}`,
      seller: user.damlParty,
      loanId: body.loanId,
      loanDetails: body.loanDetails,
      askingPrice: body.askingPrice,
      minimumPrice: body.minimumPrice,
      listedAt: new Date().toISOString(),
      expiresAt: body.listingExpiry,
      status: "ListingActive",
    };

    const result = await secondaryMarketService.createLoanListing(
      listingData,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Loan listing created successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to create loan listing" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Create loan listing error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Make offer on listing
secondaryMarket.post("/listings/:contractId/make-offer", async (c) => {
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
    const result = await secondaryMarketService.makeOffer(
      contractId,
      body.buyer,
      body.offerPrice,
      body.offerTerms || "",
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Offer made successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to make offer" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Make offer error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Accept offer
secondaryMarket.post("/listings/:contractId/accept-offer", async (c) => {
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
    const result = await secondaryMarketService.acceptOffer(
      contractId,
      body.offerCid,
      body.borrower,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Offer accepted successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to accept offer" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Accept offer error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Cancel listing
secondaryMarket.post("/listings/:contractId/cancel", async (c) => {
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
    const result = await secondaryMarketService.cancelListing(
      contractId,
      body.reason,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Listing cancelled successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to cancel listing" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Cancel listing error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Update asking price
secondaryMarket.post("/listings/:contractId/update-price", async (c) => {
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
    const result = await secondaryMarketService.updateAskingPrice(
      contractId,
      body.newPrice,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Asking price updated successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to update asking price" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Update asking price error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// LOAN OFFER ENDPOINTS

// Get all loan offers
secondaryMarket.get("/offers", async (c) => {
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
    const result = await secondaryMarketService.queryLoanOffers(authToken, user);

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
      { success: false, error: "Failed to fetch loan offers" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get loan offers error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Withdraw offer
secondaryMarket.post("/offers/:contractId/withdraw", async (c) => {
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
    const result = await secondaryMarketService.withdrawOffer(
      contractId,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Offer withdrawn successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to withdraw offer" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Withdraw offer error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Reject offer
secondaryMarket.post("/offers/:contractId/reject", async (c) => {
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
    const result = await secondaryMarketService.rejectOffer(
      contractId,
      body.rejectionReason,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Offer rejected successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to reject offer" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Reject offer error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// SECONDARY LOAN TRANSFER ENDPOINTS

// Get all transfers
secondaryMarket.get("/transfers", async (c) => {
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
    const result = await secondaryMarketService.querySecondaryLoanTransfers(
      authToken
    );

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
      { success: false, error: "Failed to fetch transfers" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get transfers error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Execute transfer
secondaryMarket.post("/transfers/:contractId/execute", async (c) => {
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
    const result = await secondaryMarketService.executeTransfer(
      contractId,
      body.originalLoanCid,
      body.transferFee,
      body.platformCid,
      body.assetType,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Transfer executed successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to execute transfer" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Execute transfer error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Cancel transfer
secondaryMarket.post("/transfers/:contractId/cancel", async (c) => {
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
    const result = await secondaryMarketService.cancelTransfer(
      contractId,
      body.cancellationReason,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Transfer cancelled successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to cancel transfer" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Cancel transfer error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// TRANSFER SETTLEMENT ENDPOINTS

// Get all settlements
secondaryMarket.get("/settlements", async (c) => {
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
    const result = await secondaryMarketService.queryTransferSettlements(
      authToken
    );

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
      { success: false, error: "Failed to fetch settlements" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get settlements error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Acknowledge settlement
secondaryMarket.post("/settlements/:contractId/acknowledge", async (c) => {
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
    const result = await secondaryMarketService.acknowledgeSettlement(
      contractId,
      user.damlParty,
      authToken
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

// LOAN VALUATION ENDPOINTS

// Get all valuations
secondaryMarket.get("/valuations", async (c) => {
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
    const result = await secondaryMarketService.queryLoanValuations(authToken, user);

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
      { success: false, error: "Failed to fetch valuations" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get valuations error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Update valuation
secondaryMarket.post("/valuations/:contractId/update", async (c) => {
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
    const result = await secondaryMarketService.updateValuation(
      contractId,
      body.newFairValue,
      body.newDiscountRate,
      body.newMethodology || "Standard",
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Valuation updated successfully",
        data: result.result,
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

// BORROWER NOTIFICATION ENDPOINTS

// Get all notifications
secondaryMarket.get("/notifications", async (c) => {
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
    const result = await secondaryMarketService.queryBorrowerNotifications(
      authToken
    );

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
      { success: false, error: "Failed to fetch notifications" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get notifications error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Acknowledge notification
secondaryMarket.post("/notifications/:contractId/acknowledge", async (c) => {
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
    const result = await secondaryMarketService.acknowledgeNotification(
      contractId,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Notification acknowledged successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to acknowledge notification" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Acknowledge notification error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

export { secondaryMarket };

