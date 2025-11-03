/**
 * Loan Management Routes
 *
 * Endpoints for loan lifecycle management including proposals, payments,
 * defaults, and restructuring.
 */

import { Hono } from "hono";
import { DamlService } from "../services/daml";
import { ConsoleLogger } from "../utils/logger";
import { requireAuth } from "../middleware/auth";
import { auth } from "../lib/auth";
import { DAML_CONFIG } from "../config/daml";

const loans = new Hono<{
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

loans.use("*", requireAuth);

// QUERY ENDPOINTS

// Get all loans
loans.get("/", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.getLoans(authToken);

    const duration = Date.now() - startTime;
    ConsoleLogger.request("GET", "/api/loans", result.status, duration);

    if (result.status === 200) {
      const contracts = Array.isArray(result.result) ? result.result : [];
      return c.json({
        data: contracts.map((contract) => ({
          contractId: contract.contractId,
          ...contract.payload,
        })),
      });
    }

    return c.json(
      { error: "Failed to fetch loans", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get loans error", error);
    ConsoleLogger.request("GET", "/api/loans", 500, duration);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get loan proposals
loans.get("/proposals", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.getLoanProposals(authToken);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/loans/proposals",
      result.status,
      duration
    );

    if (result.status === 200) {
      const contracts = Array.isArray(result.result) ? result.result : [];
      return c.json({
        data: contracts.map((contract) => ({
          contractId: contract.contractId,
          ...contract.payload,
        })),
      });
    }

    return c.json(
      { error: "Failed to fetch loan proposals", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get loan proposals error", error);
    ConsoleLogger.request("GET", "/api/loans/proposals", 500, duration);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// LOAN PROPOSAL CHOICES

// Accept loan proposal (Lender accepts and creates active loan)
loans.post("/proposals/:contractId/accept", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.acceptLoan(contractId, authToken);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/loans/proposals/${contractId}/accept`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Loan proposal accepted, active loan created", {
        contractId,
        loanId: result.result?.contractId,
      });
      return c.json({
        message: "Loan proposal accepted successfully",
        data: result.result,
      });
    }

    return c.json(
      { error: "Failed to accept loan proposal", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Accept loan proposal error", error);
    ConsoleLogger.request(
      "POST",
      `/api/loans/proposals/${contractId}/accept`,
      500,
      duration
    );
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to accept loan proposal",
      },
      500
    );
  }
});

// Reject loan proposal
loans.post("/proposals/:contractId/reject", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.exerciseChoice(
      {
        templateId: DAML_CONFIG.templates.LoanProposal!,
        contractId,
        choice: "RejectLoan",
        argument: { reason: body.reason },
      },
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/loans/proposals/${contractId}/reject`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Loan proposal rejected", {
        contractId,
        reason: body.reason,
      });
      return c.json({ message: "Loan proposal rejected successfully" });
    }

    return c.json(
      { error: "Failed to reject loan proposal", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Reject loan proposal error", error);
    ConsoleLogger.request(
      "POST",
      `/api/loans/proposals/${contractId}/reject`,
      500,
      duration
    );
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to reject loan proposal",
      },
      500
    );
  }
});

// LOAN PAYMENT CHOICES

// Make scheduled payment
loans.post("/:contractId/payment", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.exerciseChoice(
      {
        templateId: DAML_CONFIG.templates.Loan!,
        contractId,
        choice: DAML_CONFIG.choices.Loan.MakePayment,
        argument: {
          paymentAmount: body.paymentAmount,
          principalPortion: body.principalPortion,
          interestPortion: body.interestPortion,
        },
      },
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/loans/${contractId}/payment`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Loan payment processed", {
        contractId,
        paymentAmount: body.paymentAmount,
      });
      return c.json({
        message: "Payment processed successfully",
        data: result.result,
      });
    }

    return c.json(
      { error: "Failed to process payment", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Make payment error", error);
    ConsoleLogger.request(
      "POST",
      `/api/loans/${contractId}/payment`,
      500,
      duration
    );
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to process payment",
      },
      500
    );
  }
});

// Make early repayment
loans.post("/:contractId/early-repayment", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.exerciseChoice(
      {
        templateId: DAML_CONFIG.templates.Loan!,
        contractId,
        choice: "MakeEarlyRepayment",
        argument: { repaymentAmount: body.repaymentAmount },
      },
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/loans/${contractId}/early-repayment`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Early repayment made", {
        contractId,
        amount: body.repaymentAmount,
      });
      return c.json({
        message: "Early repayment processed successfully",
        data: result.result,
      });
    }

    return c.json(
      { error: "Failed to process early repayment", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Early repayment error", error);
    ConsoleLogger.request(
      "POST",
      `/api/loans/${contractId}/early-repayment`,
      500,
      duration
    );
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to process early repayment",
      },
      500
    );
  }
});

// LOAN STATUS MANAGEMENT

// Mark loan as delinquent
loans.post("/:contractId/mark-delinquent", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.exerciseChoice(
      {
        templateId: DAML_CONFIG.templates.Loan!,
        contractId,
        choice: "MarkDelinquent",
        argument: {},
      },
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/loans/${contractId}/mark-delinquent`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Loan marked as delinquent", { contractId });
      return c.json({
        message: "Loan marked as delinquent",
        data: result.result,
      });
    }

    return c.json(
      { error: "Failed to mark loan as delinquent", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Mark delinquent error", error);
    ConsoleLogger.request(
      "POST",
      `/api/loans/${contractId}/mark-delinquent`,
      500,
      duration
    );
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to mark loan as delinquent",
      },
      500
    );
  }
});

// Mark loan as default
loans.post("/:contractId/mark-default", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.exerciseChoice(
      {
        templateId: DAML_CONFIG.templates.Loan!,
        contractId,
        choice: "MarkDefault",
        argument: {
          reason: body.reason,
          platformCid: body.platformCid
            ? { tag: "Some", value: body.platformCid }
            : { tag: "None" },
          assetType: body.assetType,
        },
      },
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/loans/${contractId}/mark-default`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Loan marked as default", {
        contractId,
        reason: body.reason,
      });
      return c.json({
        message: "Loan marked as default",
        data: result.result,
      });
    }

    return c.json(
      { error: "Failed to mark loan as default", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Mark default error", error);
    ConsoleLogger.request(
      "POST",
      `/api/loans/${contractId}/mark-default`,
      500,
      duration
    );
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to mark loan as default",
      },
      500
    );
  }
});

// Restructure loan
loans.post("/:contractId/restructure", async (c) => {
  const startTime = Date.now();
  const user = c.get("user");
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const damlToken = await generateDamlTokenForUser(user);
    const authToken = `Bearer ${damlToken}`;

    const result = await damlService.exerciseChoice(
      {
        templateId: DAML_CONFIG.templates.Loan!,
        contractId,
        choice: "RestructureLoan",
        argument: {
          newInterestRateStructure: body.newInterestRateStructure,
          newRepaymentSchedule: body.newRepaymentSchedule,
          newMaturityDate: body.newMaturityDate,
        },
      },
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      `/api/loans/${contractId}/restructure`,
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Loan restructured", { contractId });
      return c.json({
        message: "Loan restructured successfully",
        data: result.result,
      });
    }

    return c.json(
      { error: "Failed to restructure loan", details: result.errors },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Restructure loan error", error);
    ConsoleLogger.request(
      "POST",
      `/api/loans/${contractId}/restructure`,
      500,
      duration
    );
    return c.json(
      { error: "Internal server error", message: "Failed to restructure loan" },
      500
    );
  }
});

export { loans };
