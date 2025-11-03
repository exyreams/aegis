/**
 * Comprehensive Audit Logging Routes
 *
 * Complete API endpoints for all audit log operations:
 * - Platform audit logs (review, escalate, archive)
 * - Lender audit logs (acknowledge, export, flag)
 * - Borrower audit logs (acknowledge, export)
 * - Loan audit trails (log events, reports, status)
 * - Pool audit logs (generate reports)
 * - Compliance audit logs (actions, escalations)
 * - Activity monitors (record, reset)
 * - Compliance alerts (investigate)
 * - Escalations (resolve)
 */

import { Hono } from "hono";
import { z } from "zod";
import { AuditService } from "../services/audit";
import { ConsoleLogger } from "../utils/logger";
import { requireAuth, requireRole } from "../middleware/auth";
import { auth } from "../lib/auth";

const audit = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const auditService = AuditService.getInstance();

// Apply auth middleware to all routes
audit.use("*", requireAuth);

// VALIDATION SCHEMAS

const ReviewLogSchema = z.object({
  reviewer: z.string(),
  notes: z.string(),
  approved: z.boolean(),
});

const EscalateEventSchema = z.object({
  escalationReason: z.string(),
  escalatedTo: z.string(),
});

const FlagSuspiciousSchema = z.object({
  flaggedBy: z.string(),
  suspicionReason: z.string(),
  alertLevel: z.string(),
});

// PLATFORM AUDIT LOGS

// Get platform audit logs
audit.get("/platform", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const filters: any = {};
    const platform = c.req.query("platform");
    const eventType = c.req.query("eventType");
    const severity = c.req.query("severity");
    const requiresReview = c.req.query("requiresReview");
    const reviewed = c.req.query("reviewed");

    if (platform) filters.platform = platform;
    if (eventType) filters.eventType = eventType;
    if (severity) filters.severity = severity;
    if (requiresReview) filters.requiresReview = requiresReview === "true";
    if (reviewed) filters.reviewed = reviewed === "true";

    const result = await auditService.queryPlatformLogs(
      authToken,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/audit/platform",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        logs: result.result || [],
        count: result.result?.length || 0,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch platform logs",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get platform logs error", error);
    ConsoleLogger.request("GET", "/api/audit/platform", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Review platform log
audit.post(
  "/platform/:contractId/review",
  requireRole("compliance"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const validated = ReviewLogSchema.parse(body);

      const result = await auditService.reviewLogEntry(
        contractId,
        validated.reviewer,
        validated.notes,
        validated.approved,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/audit/platform/:id/review",
        result.status,
        duration
      );

      if (result.status === 200) {
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        { success: false, error: result.errors?.[0] || "Failed to review log" },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Review log error", error);
      ConsoleLogger.request(
        "POST",
        "/api/audit/platform/:id/review",
        500,
        duration
      );

      if (error instanceof z.ZodError) {
        return c.json(
          { success: false, error: "Validation error", details: error.issues },
          400
        );
      }

      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Escalate platform event
audit.post(
  "/platform/:contractId/escalate",
  requireRole("compliance"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const validated = EscalateEventSchema.parse(body);

      const result = await auditService.escalateEvent(
        contractId,
        validated.escalationReason,
        validated.escalatedTo,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/audit/platform/:id/escalate",
        result.status,
        duration
      );

      if (result.status === 200) {
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        { success: false, error: result.errors?.[0] || "Failed to escalate" },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Escalate event error", error);
      ConsoleLogger.request(
        "POST",
        "/api/audit/platform/:id/escalate",
        500,
        duration
      );

      if (error instanceof z.ZodError) {
        return c.json(
          { success: false, error: "Validation error", details: error.issues },
          400
        );
      }

      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Archive platform log
audit.post("/platform/:contractId/archive", requireRole("admin"), async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const user = c.get("user");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const { archiveReason } = body;

    const result = await auditService.archivePlatformLog(
      contractId,
      user?.damlParty || "",
      archiveReason,
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/audit/platform/:id/archive",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({ success: true });
    }

    return c.json(
      { success: false, error: result.errors?.[0] || "Failed to archive" },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Archive log error", error);
    ConsoleLogger.request(
      "POST",
      "/api/audit/platform/:id/archive",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// LENDER AUDIT LOGS

// Get lender audit logs
audit.get("/lender", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const filters: any = {};
    const lender = c.req.query("lender");
    const eventType = c.req.query("eventType");
    const counterparty = c.req.query("counterparty");
    const acknowledged = c.req.query("acknowledged");

    if (lender) filters.lender = lender;
    if (eventType) filters.eventType = eventType;
    if (counterparty) filters.counterparty = counterparty;
    if (acknowledged) filters.acknowledged = acknowledged === "true";

    const result = await auditService.queryLenderLogs(
      authToken,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request("GET", "/api/audit/lender", result.status, duration);

    if (result.status === 200) {
      return c.json({
        success: true,
        logs: result.result || [],
        count: result.result?.length || 0,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch lender logs",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get lender logs error", error);
    ConsoleLogger.request("GET", "/api/audit/lender", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Acknowledge lender log
audit.post("/lender/:contractId/acknowledge", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const result = await auditService.acknowledgeLenderLog(
      contractId,
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/audit/lender/:id/acknowledge",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({ success: true, result: result.result });
    }

    return c.json(
      { success: false, error: result.errors?.[0] || "Failed to acknowledge" },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Acknowledge lender log error", error);
    ConsoleLogger.request(
      "POST",
      "/api/audit/lender/:id/acknowledge",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Export lender log
audit.post("/lender/:contractId/export", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const result = await auditService.exportLenderLog(contractId, authToken);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/audit/lender/:id/export",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({ success: true, export: result.result });
    }

    return c.json(
      { success: false, error: result.errors?.[0] || "Failed to export" },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Export lender log error", error);
    ConsoleLogger.request(
      "POST",
      "/api/audit/lender/:id/export",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Flag suspicious activity
audit.post("/lender/:contractId/flag", requireRole("compliance"), async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const validated = FlagSuspiciousSchema.parse(body);

    const result = await auditService.flagSuspiciousActivity(
      contractId,
      validated.flaggedBy,
      validated.suspicionReason,
      validated.alertLevel,
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/audit/lender/:id/flag",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({ success: true, result: result.result });
    }

    return c.json(
      { success: false, error: result.errors?.[0] || "Failed to flag" },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Flag suspicious activity error", error);
    ConsoleLogger.request("POST", "/api/audit/lender/:id/flag", 500, duration);

    if (error instanceof z.ZodError) {
      return c.json(
        { success: false, error: "Validation error", details: error.issues },
        400
      );
    }

    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// BORROWER AUDIT LOGS

// Get borrower audit logs
audit.get("/borrower", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const filters: any = {};
    const borrower = c.req.query("borrower");
    const eventType = c.req.query("eventType");
    const counterparty = c.req.query("counterparty");
    const acknowledged = c.req.query("acknowledged");

    if (borrower) filters.borrower = borrower;
    if (eventType) filters.eventType = eventType;
    if (counterparty) filters.counterparty = counterparty;
    if (acknowledged) filters.acknowledged = acknowledged === "true";

    const result = await auditService.queryBorrowerLogs(
      authToken,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/audit/borrower",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        logs: result.result || [],
        count: result.result?.length || 0,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch borrower logs",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get borrower logs error", error);
    ConsoleLogger.request("GET", "/api/audit/borrower", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Acknowledge borrower log
audit.post("/borrower/:contractId/acknowledge", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const result = await auditService.acknowledgeBorrowerLog(
      contractId,
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/audit/borrower/:id/acknowledge",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({ success: true, result: result.result });
    }

    return c.json(
      { success: false, error: result.errors?.[0] || "Failed to acknowledge" },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Acknowledge borrower log error", error);
    ConsoleLogger.request(
      "POST",
      "/api/audit/borrower/:id/acknowledge",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Export borrower log
audit.post("/borrower/:contractId/export", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const result = await auditService.exportBorrowerLog(contractId, authToken);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/audit/borrower/:id/export",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({ success: true, export: result.result });
    }

    return c.json(
      { success: false, error: result.errors?.[0] || "Failed to export" },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Export borrower log error", error);
    ConsoleLogger.request(
      "POST",
      "/api/audit/borrower/:id/export",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// LOAN AUDIT TRAILS

// Get loan audit trails
audit.get("/loan", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const filters: any = {};
    const borrower = c.req.query("borrower");
    const loanId = c.req.query("loanId");
    const currentStatus = c.req.query("currentStatus");

    if (borrower) filters.borrower = borrower;
    if (loanId) filters.loanId = loanId;
    if (currentStatus) filters.currentStatus = currentStatus;

    const result = await auditService.queryLoanTrails(
      authToken,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request("GET", "/api/audit/loan", result.status, duration);

    if (result.status === 200) {
      return c.json({
        success: true,
        trails: result.result || [],
        count: result.result?.length || 0,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch loan trails",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get loan trails error", error);
    ConsoleLogger.request("GET", "/api/audit/loan", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Log loan event
audit.post("/loan/:contractId/log-event", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const user = c.get("user");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const { eventType, eventDescription, eventData, financialImpact } = body;

    const result = await auditService.logLoanEvent(
      contractId,
      eventType,
      eventDescription,
      user?.damlParty || "",
      eventData || [],
      financialImpact || null,
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/audit/loan/:id/log-event",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({ success: true, result: result.result });
    }

    return c.json(
      { success: false, error: result.errors?.[0] || "Failed to log event" },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Log loan event error", error);
    ConsoleLogger.request(
      "POST",
      "/api/audit/loan/:id/log-event",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Generate loan report
audit.post("/loan/:contractId/report", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const user = c.get("user");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const result = await auditService.generateLoanReport(
      contractId,
      user?.damlParty || "",
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/audit/loan/:id/report",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({ success: true, report: result.result });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to generate report",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Generate loan report error", error);
    ConsoleLogger.request("POST", "/api/audit/loan/:id/report", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Update loan status
audit.post("/loan/:contractId/status", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const user = c.get("user");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const { newStatus } = body;

    const result = await auditService.updateLoanStatus(
      contractId,
      newStatus,
      user?.damlParty || "",
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/audit/loan/:id/status",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({ success: true, result: result.result });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to update status",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Update loan status error", error);
    ConsoleLogger.request("POST", "/api/audit/loan/:id/status", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// POOL AUDIT LOGS

// Get pool audit logs
audit.get("/pool", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const filters: any = {};
    const poolManager = c.req.query("poolManager");
    const poolId = c.req.query("poolId");
    const eventType = c.req.query("eventType");

    if (poolManager) filters.poolManager = poolManager;
    if (poolId) filters.poolId = poolId;
    if (eventType) filters.eventType = eventType;

    const result = await auditService.queryPoolLogs(
      authToken,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request("GET", "/api/audit/pool", result.status, duration);

    if (result.status === 200) {
      return c.json({
        success: true,
        logs: result.result || [],
        count: result.result?.length || 0,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch pool logs",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get pool logs error", error);
    ConsoleLogger.request("GET", "/api/audit/pool", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Generate pool report
audit.post("/pool/:contractId/report", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const result = await auditService.generatePoolReport(contractId, authToken);

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/audit/pool/:id/report",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({ success: true, report: result.result });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to generate report",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Generate pool report error", error);
    ConsoleLogger.request("POST", "/api/audit/pool/:id/report", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// COMPLIANCE AUDIT LOGS

// Get compliance audit logs
audit.get("/compliance", requireRole("compliance"), async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const filters: any = {};
    const complianceOfficer = c.req.query("complianceOfficer");
    const subject = c.req.query("subject");
    const complianceCheckType = c.req.query("complianceCheckType");
    const checkResult = c.req.query("checkResult");
    const riskLevel = c.req.query("riskLevel");
    const actionRequired = c.req.query("actionRequired");

    if (complianceOfficer) filters.complianceOfficer = complianceOfficer;
    if (subject) filters.subject = subject;
    if (complianceCheckType) filters.complianceCheckType = complianceCheckType;
    if (checkResult) filters.checkResult = checkResult;
    if (riskLevel) filters.riskLevel = riskLevel;
    if (actionRequired) filters.actionRequired = actionRequired === "true";

    const result = await auditService.queryComplianceLogs(
      authToken,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/audit/compliance",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        logs: result.result || [],
        count: result.result?.length || 0,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch compliance logs",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get compliance logs error", error);
    ConsoleLogger.request("GET", "/api/audit/compliance", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Record compliance action
audit.post(
  "/compliance/:contractId/action",
  requireRole("compliance"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const user = c.get("user");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { action } = body;

      const result = await auditService.recordComplianceAction(
        contractId,
        action,
        user?.damlParty || "",
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/audit/compliance/:id/action",
        result.status,
        duration
      );

      if (result.status === 200) {
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to record action",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Record compliance action error", error);
      ConsoleLogger.request(
        "POST",
        "/api/audit/compliance/:id/action",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Escalate compliance issue
audit.post(
  "/compliance/:contractId/escalate",
  requireRole("compliance"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { escalationReason, escalatedTo } = body;

      const result = await auditService.escalateComplianceIssue(
        contractId,
        escalationReason,
        escalatedTo,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/audit/compliance/:id/escalate",
        result.status,
        duration
      );

      if (result.status === 200) {
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        { success: false, error: result.errors?.[0] || "Failed to escalate" },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Escalate compliance issue error", error);
      ConsoleLogger.request(
        "POST",
        "/api/audit/compliance/:id/escalate",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// ACTIVITY MONITORS

// Get activity monitors
audit.get("/activity-monitor", requireRole("compliance"), async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const filters: any = {};
    const platform = c.req.query("platform");
    const monitoredParty = c.req.query("monitoredParty");
    const activityType = c.req.query("activityType");
    const thresholdExceeded = c.req.query("thresholdExceeded");
    const alertTriggered = c.req.query("alertTriggered");

    if (platform) filters.platform = platform;
    if (monitoredParty) filters.monitoredParty = monitoredParty;
    if (activityType) filters.activityType = activityType;
    if (thresholdExceeded)
      filters.thresholdExceeded = thresholdExceeded === "true";
    if (alertTriggered) filters.alertTriggered = alertTriggered === "true";

    const result = await auditService.queryActivityMonitors(
      authToken,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/audit/activity-monitor",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        monitors: result.result || [],
        count: result.result?.length || 0,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch monitors",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get activity monitors error", error);
    ConsoleLogger.request("GET", "/api/audit/activity-monitor", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Record activity
audit.post(
  "/activity-monitor/:contractId/record",
  requireRole("admin"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const result = await auditService.recordActivity(contractId, authToken);

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/audit/activity-monitor/:id/record",
        result.status,
        duration
      );

      if (result.status === 200) {
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to record activity",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Record activity error", error);
      ConsoleLogger.request(
        "POST",
        "/api/audit/activity-monitor/:id/record",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// Reset activity counter
audit.post(
  "/activity-monitor/:contractId/reset",
  requireRole("compliance"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const user = c.get("user");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const result = await auditService.resetActivityCounter(
        contractId,
        user?.damlParty || "",
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/audit/activity-monitor/:id/reset",
        result.status,
        duration
      );

      if (result.status === 200) {
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to reset counter",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Reset activity counter error", error);
      ConsoleLogger.request(
        "POST",
        "/api/audit/activity-monitor/:id/reset",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// COMPLIANCE ALERTS

// Get compliance alerts
audit.get("/alerts", requireRole("compliance"), async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const filters: any = {};
    const platform = c.req.query("platform");
    const subject = c.req.query("subject");
    const alertType = c.req.query("alertType");
    const alertLevel = c.req.query("alertLevel");
    const investigated = c.req.query("investigated");

    if (platform) filters.platform = platform;
    if (subject) filters.subject = subject;
    if (alertType) filters.alertType = alertType;
    if (alertLevel) filters.alertLevel = alertLevel;
    if (investigated) filters.investigated = investigated === "true";

    const result = await auditService.queryComplianceAlerts(
      authToken,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request("GET", "/api/audit/alerts", result.status, duration);

    if (result.status === 200) {
      return c.json({
        success: true,
        alerts: result.result || [],
        count: result.result?.length || 0,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch alerts",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get compliance alerts error", error);
    ConsoleLogger.request("GET", "/api/audit/alerts", 500, duration);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Investigate alert
audit.post(
  "/alerts/:contractId/investigate",
  requireRole("compliance"),
  async (c) => {
    const startTime = Date.now();
    const session = c.get("session");
    const user = c.get("user");
    const authToken = `Bearer ${session?.token || ""}`;
    const contractId = c.req.param("contractId");

    try {
      const body = await c.req.json();
      const { notes } = body;

      const result = await auditService.investigateAlert(
        contractId,
        user?.damlParty || "",
        notes,
        authToken
      );

      const duration = Date.now() - startTime;
      ConsoleLogger.request(
        "POST",
        "/api/audit/alerts/:id/investigate",
        result.status,
        duration
      );

      if (result.status === 200) {
        return c.json({ success: true, result: result.result });
      }

      return c.json(
        {
          success: false,
          error: result.errors?.[0] || "Failed to investigate",
        },
        result.status as any
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      ConsoleLogger.error("Investigate alert error", error);
      ConsoleLogger.request(
        "POST",
        "/api/audit/alerts/:id/investigate",
        500,
        duration
      );
      return c.json({ success: false, error: "Internal server error" }, 500);
    }
  }
);

// ESCALATIONS

// Get platform escalations
audit.get("/escalations/platform", requireRole("compliance"), async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const filters: any = {};
    const complianceOfficer = c.req.query("complianceOfficer");
    const escalatedTo = c.req.query("escalatedTo");
    const resolved = c.req.query("resolved");

    if (complianceOfficer) filters.complianceOfficer = complianceOfficer;
    if (escalatedTo) filters.escalatedTo = escalatedTo;
    if (resolved) filters.resolved = resolved === "true";

    const result = await auditService.queryPlatformEscalations(
      authToken,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/audit/escalations/platform",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        escalations: result.result || [],
        count: result.result?.length || 0,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch escalations",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get platform escalations error", error);
    ConsoleLogger.request(
      "GET",
      "/api/audit/escalations/platform",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Get compliance escalations
audit.get("/escalations/compliance", requireRole("compliance"), async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const filters: any = {};
    const complianceOfficer = c.req.query("complianceOfficer");
    const subject = c.req.query("subject");
    const escalatedTo = c.req.query("escalatedTo");
    const resolved = c.req.query("resolved");

    if (complianceOfficer) filters.complianceOfficer = complianceOfficer;
    if (subject) filters.subject = subject;
    if (escalatedTo) filters.escalatedTo = escalatedTo;
    if (resolved) filters.resolved = resolved === "true";

    const result = await auditService.queryComplianceEscalations(
      authToken,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "GET",
      "/api/audit/escalations/compliance",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({
        success: true,
        escalations: result.result || [],
        count: result.result?.length || 0,
      });
    }

    return c.json(
      {
        success: false,
        error: result.errors?.[0] || "Failed to fetch escalations",
      },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get compliance escalations error", error);
    ConsoleLogger.request(
      "GET",
      "/api/audit/escalations/compliance",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Resolve platform escalation
audit.post("/escalations/platform/:contractId/resolve", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const user = c.get("user");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const { notes } = body;

    const result = await auditService.resolvePlatformEscalation(
      contractId,
      user?.damlParty || "",
      notes,
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/audit/escalations/platform/:id/resolve",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({ success: true, result: result.result });
    }

    return c.json(
      { success: false, error: result.errors?.[0] || "Failed to resolve" },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Resolve platform escalation error", error);
    ConsoleLogger.request(
      "POST",
      "/api/audit/escalations/platform/:id/resolve",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

// Resolve compliance escalation
audit.post("/escalations/compliance/:contractId/resolve", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const user = c.get("user");
  const authToken = `Bearer ${session?.token || ""}`;
  const contractId = c.req.param("contractId");

  try {
    const body = await c.req.json();
    const { notes } = body;

    const result = await auditService.resolveComplianceEscalation(
      contractId,
      user?.damlParty || "",
      notes,
      authToken
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(
      "POST",
      "/api/audit/escalations/compliance/:id/resolve",
      result.status,
      duration
    );

    if (result.status === 200) {
      return c.json({ success: true, result: result.result });
    }

    return c.json(
      { success: false, error: result.errors?.[0] || "Failed to resolve" },
      result.status as any
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Resolve compliance escalation error", error);
    ConsoleLogger.request(
      "POST",
      "/api/audit/escalations/compliance/:id/resolve",
      500,
      duration
    );
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

export { audit };
