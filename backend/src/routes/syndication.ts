/**
 * Syndication Routes
 *
 * Multi-party loan syndication management with DAML integration including
 * syndicate formation, participant management, voting mechanisms, and
 * distributed payment processing for institutional lending workflows.
 */

import { Hono } from "hono";
import { SyndicationService } from "../services/syndication";
import { ConsoleLogger } from "../utils/logger";
import { requireAuth } from "../middleware/auth";
import { auth } from "../lib/auth";
import { generateDamlToken } from "../utils/daml-token";

const syndication = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const syndicationService = new SyndicationService();

syndication.use("*", requireAuth);

syndication.get("/loans", async (c) => {
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
    const result = await syndicationService.getSyndicatedLoans(authToken, user);

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
      { success: false, error: "Failed to fetch syndicated loans" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get syndicated loans error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

syndication.get("/loans/:loanId", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const loanId = c.req.param("loanId");
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await syndicationService.getSyndicatedLoanById(
      loanId,
      authToken
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
      return c.json({ success: false, error: "Loan not found" }, 404);
    }

    return c.json(
      { success: false, error: "Failed to fetch syndicated loan" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get syndicated loan error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

syndication.post("/loans/:contractId/payment", async (c) => {
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
    const result = await syndicationService.makeSyndicatedPayment(
      contractId,
      body.paymentAmount,
      body.principalPortion,
      body.interestPortion,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Payment made successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to make payment" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Make syndicated payment error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

syndication.post("/loans/:contractId/propose-decision", async (c) => {
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
    const result = await syndicationService.proposeSyndicateDecision(
      contractId,
      body.proposer,
      body.decisionType,
      body.description,
      body.votingDeadline,
      body.requiredMajority,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Decision proposed successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to propose decision" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Propose decision error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

syndication.get("/formations", async (c) => {
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
    const result = await syndicationService.getSyndicateFormations(authToken, user);

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
      { success: false, error: "Failed to fetch syndicate formations" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get syndicate formations error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

syndication.post("/formations", async (c) => {
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
    const result = await syndicationService.createSyndicateFormation(
      body,
      authToken
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
      { success: false, error: "Failed to create syndicate formation" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Create syndicate formation error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

syndication.post("/formations/:contractId/commit", async (c) => {
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
    const result = await syndicationService.commitToSyndicate(
      contractId,
      body.lender,
      body.profile,
      body.commitmentAmount,
      body.role,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Committed to syndicate successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to commit to syndicate" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Commit to syndicate error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

syndication.post("/formations/:contractId/finalize", async (c) => {
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
    const result = await syndicationService.finalizeSyndicate(
      contractId,
      body.interestRateStructure,
      body.repaymentSchedule,
      body.collateralAssets,
      body.covenants,
      body.loanDuration,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Syndicate finalized successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to finalize syndicate" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Finalize syndicate error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

syndication.get("/votes", async (c) => {
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
    const result = await syndicationService.getSyndicateVotes(authToken, user);

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
      { success: false, error: "Failed to fetch syndicate votes" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get syndicate votes error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

syndication.post("/votes/:contractId/vote-for", async (c) => {
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
    const result = await syndicationService.voteFor(
      contractId,
      body.voter,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Vote recorded successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to record vote" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Vote for error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

syndication.post("/votes/:contractId/vote-against", async (c) => {
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
    const result = await syndicationService.voteAgainst(
      contractId,
      body.voter,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Vote recorded successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to record vote" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Vote against error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Finalize vote
syndication.post("/votes/:contractId/finalize", async (c) => {
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
    const result = await syndicationService.finalizeVote(contractId, authToken, user);

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Vote finalized successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to finalize vote" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Finalize vote error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Mark syndicated loan as default
syndication.post("/loans/:contractId/mark-default", async (c) => {
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
    const result = await syndicationService.markSyndicatedDefault(
      contractId,
      body.defaultReason,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Syndicated loan marked as default",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to mark loan as default" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Mark syndicated default error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Add syndicate participant
syndication.post("/loans/:contractId/add-participant", async (c) => {
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
    const result = await syndicationService.addSyndicateParticipant(
      contractId,
      body.newParticipant,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Participant added successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to add participant" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Add participant error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Remove syndicate participant
syndication.post("/loans/:contractId/remove-participant", async (c) => {
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
    const result = await syndicationService.removeSyndicateParticipant(
      contractId,
      body.participantToRemove,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Participant removed successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to remove participant" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Remove participant error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Distribute arrangement fees
syndication.post("/loans/:contractId/distribute-fees", async (c) => {
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
    const result = await syndicationService.distributeArrangementFees(
      contractId,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Arrangement fees distributed successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to distribute fees" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Distribute fees error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Cancel syndicate formation
syndication.post("/formations/:contractId/cancel", async (c) => {
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
    const result = await syndicationService.cancelFormation(
      contractId,
      body.reason,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Formation cancelled successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to cancel formation" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Cancel formation error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Get syndicate reports
syndication.get("/reports", async (c) => {
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
    const result = await syndicationService.getSyndicateReports(authToken, user);

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
      { success: false, error: "Failed to fetch reports" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get reports error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Acknowledge syndicate report
syndication.post("/reports/:contractId/acknowledge", async (c) => {
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
    const result = await syndicationService.acknowledgeReport(
      contractId,
      user.damlParty,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Report acknowledged successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to acknowledge report" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Acknowledge report error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

export { syndication };

