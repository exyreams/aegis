/**
 * Credit System Routes
 *
 * DAML-integrated endpoints for credit profile management, risk assessments,
 * credit scoring, and borrower creditworthiness evaluation.
 */

import { Hono } from "hono";
import { CreditService } from "../services/credit";
import { ConsoleLogger } from "../utils/logger";
import { requireAuth } from "../middleware/auth";
import { auth } from "../lib/auth";
import { generateDamlToken } from "../utils/daml-token";

const credit = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const creditService = new CreditService();

credit.use("*", requireAuth);
credit.get("/profiles", async (c) => {
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
    const result = await creditService.getCreditProfiles(authToken);

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
      { success: false, error: "Failed to fetch credit profiles" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get credit profiles error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

credit.get("/profiles/:party", async (c) => {
  const user = c.get("user");
  if (!user?.damlParty) {
    return c.json({ success: false, error: "User not authenticated" }, 401);
  }
  const party = c.req.param("party");
  const damlToken = generateDamlToken(user.damlParty, {
    scope: "daml:read daml:write",
    expiresIn: "3600",
  });
  const authToken = `Bearer ${damlToken}`;

  try {
    const result = await creditService.getCreditProfileByParty(
      party,
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
      return c.json({ success: false, error: "Profile not found" }, 404);
    }

    return c.json(
      { success: false, error: "Failed to fetch credit profile" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get credit profile error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

credit.post("/profiles", async (c) => {
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
    const result = await creditService.createCreditProfile(body, authToken);

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
      { success: false, error: "Failed to create credit profile" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Create credit profile error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

credit.get("/risk-assessments", async (c) => {
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
    const result = await creditService.getRiskAssessments(authToken);

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
      { success: false, error: "Failed to fetch risk assessments" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get risk assessments error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

credit.post("/risk-assessments", async (c) => {
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
    const result = await creditService.createRiskAssessment(body, authToken);

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
      { success: false, error: "Failed to create risk assessment" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Create risk assessment error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// CREDIT PROFILE - CHOICE ENDPOINTS

// Record loan origination
credit.post("/profiles/:contractId/record-loan", async (c) => {
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
    const result = await creditService.recordLoanOrigination(
      contractId,
      body.loanId,
      body.loanAmount,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Loan origination recorded successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to record loan origination" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Record loan origination error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Record loan repayment
credit.post("/profiles/:contractId/record-repayment", async (c) => {
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
    const result = await creditService.recordRepayment(
      contractId,
      body.loanId,
      body.repaymentAmount,
      body.daysToRepay,
      body.wasOnTime,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Repayment recorded successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to record repayment" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Record repayment error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Record loan default
credit.post("/profiles/:contractId/record-default", async (c) => {
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
    const result = await creditService.recordDefault(
      contractId,
      body.loanId,
      body.defaultAmount,
      body.defaultDate,
      body.lender,
      body.platformCid,
      body.assetType,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Default recorded successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to record default" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Record default error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Record default resolution
credit.post("/profiles/:contractId/record-default-resolution", async (c) => {
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
    const result = await creditService.recordDefaultResolution(
      contractId,
      body.loanId,
      body.resolutionDate,
      body.recoveryAmount,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Default resolution recorded successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to record default resolution" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Record default resolution error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Update privacy level
credit.post("/profiles/:contractId/update-privacy", async (c) => {
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
    const result = await creditService.updatePrivacyLevel(
      contractId,
      body.newPrivacyLevel,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Privacy level updated successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to update privacy level" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Update privacy level error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// RISK ASSESSMENT - CHOICE ENDPOINTS

// Accept risk assessment
credit.post("/risk-assessments/:contractId/accept", async (c) => {
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
    const result = await creditService.acceptAssessment(contractId, authToken);

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Risk assessment accepted successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to accept assessment" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Accept assessment error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Reject risk assessment
credit.post("/risk-assessments/:contractId/reject", async (c) => {
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
    const result = await creditService.rejectAssessment(
      contractId,
      body.rejectionReason,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Risk assessment rejected successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to reject assessment" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Reject assessment error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// PORTFOLIO RISK ENDPOINTS

// Get portfolio risks
credit.get("/portfolio-risks", async (c) => {
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
    const result = await creditService.getPortfolioRisks(authToken);

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
      { success: false, error: "Failed to fetch portfolio risks" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get portfolio risks error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Create portfolio risk
credit.post("/portfolio-risks", async (c) => {
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
    const result = await creditService.createPortfolioRisk(body, authToken);

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
      { success: false, error: "Failed to create portfolio risk" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Create portfolio risk error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Update portfolio risk
credit.post("/portfolio-risks/:contractId/update", async (c) => {
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
    const result = await creditService.updatePortfolioRisk(
      contractId,
      body.newActiveLoans,
      body.newTotalExposure,
      body.newAverageLTV,
      body.newConcentrationByBorrower,
      body.newConcentrationByAssetType,
      body.newRiskMetrics,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Portfolio risk updated successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to update portfolio risk" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Update portfolio risk error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Check concentration limits
credit.post("/portfolio-risks/:contractId/check-limits", async (c) => {
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
    const result = await creditService.checkConcentrationLimits(
      contractId,
      body.maxBorrowerConcentration,
      body.maxAssetTypeConcentration,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Concentration limits checked successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to check concentration limits" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Check concentration limits error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// CREDIT INSURANCE ENDPOINTS

// Get insurance policies
credit.get("/insurance-policies", async (c) => {
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
    const result = await creditService.getInsurancePolicies(authToken);

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
      { success: false, error: "Failed to fetch insurance policies" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get insurance policies error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Create insurance policy
credit.post("/insurance-policies", async (c) => {
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
    const result = await creditService.createInsurancePolicy(body, authToken);

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
      { success: false, error: "Failed to create insurance policy" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Create insurance policy error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// File insurance claim
credit.post("/insurance-policies/:contractId/file-claim", async (c) => {
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
    const result = await creditService.fileInsuranceClaim(
      contractId,
      body.defaultAmount,
      body.claimDate,
      body.claimEvidence,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Insurance claim filed successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to file insurance claim" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("File insurance claim error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Cancel insurance policy
credit.post("/insurance-policies/:contractId/cancel", async (c) => {
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
    const result = await creditService.cancelInsurance(
      contractId,
      body.cancellationReason,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Insurance policy cancelled successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to cancel insurance policy" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Cancel insurance error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// CREDIT GUARANTEE ENDPOINTS

// Get guarantees
credit.get("/guarantees", async (c) => {
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
    const result = await creditService.getGuarantees(authToken);

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
      { success: false, error: "Failed to fetch guarantees" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get guarantees error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Create guarantee
credit.post("/guarantees", async (c) => {
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
    const result = await creditService.createGuarantee(body, authToken);

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
      { success: false, error: "Failed to create guarantee" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Create guarantee error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Invoke guarantee
credit.post("/guarantees/:contractId/invoke", async (c) => {
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
    const result = await creditService.invokeGuarantee(
      contractId,
      body.loanId,
      body.defaultAmount,
      body.invokeDate,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Guarantee invoked successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to invoke guarantee" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Invoke guarantee error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// CREDIT INQUIRY ENDPOINTS

// Get inquiries
credit.get("/inquiries", async (c) => {
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
    const result = await creditService.getInquiries(authToken);

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
      { success: false, error: "Failed to fetch inquiries" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Get inquiries error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Create inquiry
credit.post("/inquiries", async (c) => {
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
    const result = await creditService.createInquiry(body, authToken);

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
      { success: false, error: "Failed to create inquiry" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Create inquiry error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Approve inquiry
credit.post("/inquiries/:contractId/approve", async (c) => {
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
    const result = await creditService.approveInquiry(
      contractId,
      body.creditProfile,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Inquiry approved successfully",
        data: result.result,
      });
    }

    return c.json(
      { success: false, error: "Failed to approve inquiry" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Approve inquiry error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Decline inquiry
credit.post("/inquiries/:contractId/decline", async (c) => {
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
    const result = await creditService.declineInquiry(
      contractId,
      body.reason,
      authToken
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        message: "Inquiry declined successfully",
      });
    }

    return c.json(
      { success: false, error: "Failed to decline inquiry" },
      result.status as any
    );
  } catch (error) {
    ConsoleLogger.error("Decline inquiry error", error);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

export { credit };
