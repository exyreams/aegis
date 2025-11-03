/**
 * Comprehensive Audit Logging Service
 *
 * Complete service for managing all DAML audit log contracts:
 * - Platform audit logs (system operations, treasury, compliance)
 * - Lender audit logs (bids, loans, payments, portfolio)
 * - Borrower audit logs (RFQs, loans, payments, credit)
 * - Loan audit trails (complete lifecycle tracking)
 * - Pool audit logs (liquidity pool operations)
 * - Compliance audit logs (KYC, AML, regulatory)
 * - Activity monitors (real-time monitoring)
 * - Compliance alerts (suspicious activity)
 * - Escalations (platform and compliance)
 */

import { DamlService } from "./daml";
import { getTemplateId } from "../config/daml";
import { ConsoleLogger } from "../utils/logger";

export class AuditService {
  private static instance: AuditService;
  private damlService: DamlService;

  private constructor() {
    this.damlService = DamlService.getInstance();
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  // PLATFORM AUDIT LOGS

  /**
   * Query platform audit logs
   */
  async queryPlatformLogs(
    authToken: string,
    filters?: {
      platform?: string;
      eventType?: string;
      severity?: string;
      requiresReview?: boolean;
      reviewed?: boolean;
    }
  ) {
    try {
      const query: any = {
        templateIds: [getTemplateId("PlatformAuditLog" as any)],
      };

      if (filters) {
        query.query = filters;
      }

      const result = await this.damlService.queryContracts(query, authToken);
      return result;
    } catch (error) {
      ConsoleLogger.error("Query platform logs error", error);
      throw error;
    }
  }

  /**
   * Review platform log entry
   */
  async reviewLogEntry(
    contractId: string,
    reviewer: string,
    notes: string,
    approved: boolean,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("PlatformAuditLog" as any),
          contractId,
          choice: "ReviewLogEntry",
          argument: { reviewer, notes, approved },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Review log entry error", error);
      throw error;
    }
  }

  /**
   * Escalate critical platform event
   */
  async escalateEvent(
    contractId: string,
    escalationReason: string,
    escalatedTo: string,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("PlatformAuditLog" as any),
          contractId,
          choice: "EscalateEvent",
          argument: { escalationReason, escalatedTo },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Escalate event error", error);
      throw error;
    }
  }

  // LENDER AUDIT LOGS

  /**
   * Query lender audit logs
   */
  async queryLenderLogs(
    authToken: string,
    filters?: {
      lender?: string;
      eventType?: string;
      counterparty?: string;
      acknowledged?: boolean;
    }
  ) {
    try {
      const query: any = {
        templateIds: [getTemplateId("LenderAuditLog" as any)],
      };

      if (filters) {
        query.query = filters;
      }

      const result = await this.damlService.queryContracts(query, authToken);
      return result;
    } catch (error) {
      ConsoleLogger.error("Query lender logs error", error);
      throw error;
    }
  }

  /**
   * Acknowledge lender log
   */
  async acknowledgeLenderLog(contractId: string, authToken: string) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("LenderAuditLog" as any),
          contractId,
          choice: "AcknowledgeLenderLog",
          argument: {},
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Acknowledge lender log error", error);
      throw error;
    }
  }

  /**
   * Export lender log
   */
  async exportLenderLog(contractId: string, authToken: string) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("LenderAuditLog" as any),
          contractId,
          choice: "ExportLenderLog",
          argument: {},
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Export lender log error", error);
      throw error;
    }
  }

  /**
   * Flag suspicious activity
   */
  async flagSuspiciousActivity(
    contractId: string,
    flaggedBy: string,
    suspicionReason: string,
    alertLevel: string,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("LenderAuditLog" as any),
          contractId,
          choice: "FlagSuspiciousActivity",
          argument: { flaggedBy, suspicionReason, alertLevel },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Flag suspicious activity error", error);
      throw error;
    }
  }

  // BORROWER AUDIT LOGS

  /**
   * Query borrower audit logs
   */
  async queryBorrowerLogs(
    authToken: string,
    filters?: {
      borrower?: string;
      eventType?: string;
      counterparty?: string;
      acknowledged?: boolean;
    }
  ) {
    try {
      const query: any = {
        templateIds: [getTemplateId("BorrowerAuditLog" as any)],
      };

      if (filters) {
        query.query = filters;
      }

      const result = await this.damlService.queryContracts(query, authToken);
      return result;
    } catch (error) {
      ConsoleLogger.error("Query borrower logs error", error);
      throw error;
    }
  }

  /**
   * Acknowledge borrower log
   */
  async acknowledgeBorrowerLog(contractId: string, authToken: string) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("BorrowerAuditLog" as any),
          contractId,
          choice: "AcknowledgeBorrowerLog",
          argument: {},
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Acknowledge borrower log error", error);
      throw error;
    }
  }

  /**
   * Export borrower log
   */
  async exportBorrowerLog(contractId: string, authToken: string) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("BorrowerAuditLog" as any),
          contractId,
          choice: "ExportBorrowerLog",
          argument: {},
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Export borrower log error", error);
      throw error;
    }
  }

  // LOAN AUDIT TRAILS

  /**
   * Query loan audit trails
   */
  async queryLoanTrails(
    authToken: string,
    filters?: {
      borrower?: string;
      loanId?: string;
      currentStatus?: string;
    }
  ) {
    try {
      const query: any = {
        templateIds: [getTemplateId("LoanAuditTrail" as any)],
      };

      if (filters) {
        query.query = filters;
      }

      const result = await this.damlService.queryContracts(query, authToken);
      return result;
    } catch (error) {
      ConsoleLogger.error("Query loan trails error", error);
      throw error;
    }
  }

  /**
   * Log loan event
   */
  async logLoanEvent(
    contractId: string,
    eventType: string,
    eventDescription: string,
    performedBy: string,
    eventData: Array<[string, string]>,
    financialImpact: any,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("LoanAuditTrail" as any),
          contractId,
          choice: "LogLoanEvent",
          argument: {
            eventType,
            eventDescription,
            performedBy,
            eventData,
            financialImpact,
          },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Log loan event error", error);
      throw error;
    }
  }

  /**
   * Generate loan report
   */
  async generateLoanReport(
    contractId: string,
    requestedBy: string,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("LoanAuditTrail" as any),
          contractId,
          choice: "GenerateLoanReport",
          argument: { requestedBy },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Generate loan report error", error);
      throw error;
    }
  }

  /**
   * Update loan status
   */
  async updateLoanStatus(
    contractId: string,
    newStatus: string,
    updatedBy: string,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("LoanAuditTrail" as any),
          contractId,
          choice: "UpdateLoanStatus",
          argument: { newStatus, updatedBy },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Update loan status error", error);
      throw error;
    }
  }

  // POOL AUDIT LOGS

  /**
   * Query pool audit logs
   */
  async queryPoolLogs(
    authToken: string,
    filters?: {
      poolManager?: string;
      poolId?: string;
      eventType?: string;
    }
  ) {
    try {
      const query: any = {
        templateIds: [getTemplateId("PoolAuditLog" as any)],
      };

      if (filters) {
        query.query = filters;
      }

      const result = await this.damlService.queryContracts(query, authToken);
      return result;
    } catch (error) {
      ConsoleLogger.error("Query pool logs error", error);
      throw error;
    }
  }

  /**
   * Generate pool report
   */
  async generatePoolReport(contractId: string, authToken: string) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("PoolAuditLog" as any),
          contractId,
          choice: "GeneratePoolReport",
          argument: {},
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Generate pool report error", error);
      throw error;
    }
  }

  // COMPLIANCE AUDIT LOGS

  /**
   * Query compliance audit logs
   */
  async queryComplianceLogs(
    authToken: string,
    filters?: {
      complianceOfficer?: string;
      subject?: string;
      complianceCheckType?: string;
      checkResult?: string;
      riskLevel?: string;
      actionRequired?: boolean;
    }
  ) {
    try {
      const query: any = {
        templateIds: [getTemplateId("ComplianceAuditLog" as any)],
      };

      if (filters) {
        query.query = filters;
      }

      const result = await this.damlService.queryContracts(query, authToken);
      return result;
    } catch (error) {
      ConsoleLogger.error("Query compliance logs error", error);
      throw error;
    }
  }

  /**
   * Record compliance action
   */
  async recordComplianceAction(
    contractId: string,
    action: string,
    actionBy: string,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("ComplianceAuditLog" as any),
          contractId,
          choice: "RecordComplianceAction",
          argument: { action, actionBy },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Record compliance action error", error);
      throw error;
    }
  }

  /**
   * Escalate compliance issue
   */
  async escalateComplianceIssue(
    contractId: string,
    escalationReason: string,
    escalatedTo: string,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("ComplianceAuditLog" as any),
          contractId,
          choice: "EscalateComplianceIssue",
          argument: { escalationReason, escalatedTo },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Escalate compliance issue error", error);
      throw error;
    }
  }

  // ACTIVITY MONITORS

  /**
   * Query activity monitors
   */
  async queryActivityMonitors(
    authToken: string,
    filters?: {
      platform?: string;
      monitoredParty?: string;
      activityType?: string;
      thresholdExceeded?: boolean;
      alertTriggered?: boolean;
    }
  ) {
    try {
      const query: any = {
        templateIds: [getTemplateId("ActivityMonitor" as any)],
      };

      if (filters) {
        query.query = filters;
      }

      const result = await this.damlService.queryContracts(query, authToken);
      return result;
    } catch (error) {
      ConsoleLogger.error("Query activity monitors error", error);
      throw error;
    }
  }

  /**
   * Record activity
   */
  async recordActivity(contractId: string, authToken: string) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("ActivityMonitor" as any),
          contractId,
          choice: "RecordActivity",
          argument: {},
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Record activity error", error);
      throw error;
    }
  }

  /**
   * Reset activity counter
   */
  async resetActivityCounter(
    contractId: string,
    resetBy: string,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("ActivityMonitor" as any),
          contractId,
          choice: "ResetActivityCounter",
          argument: { resetBy },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Reset activity counter error", error);
      throw error;
    }
  }

  // COMPLIANCE ALERTS

  /**
   * Query compliance alerts
   */
  async queryComplianceAlerts(
    authToken: string,
    filters?: {
      platform?: string;
      subject?: string;
      alertType?: string;
      alertLevel?: string;
      investigated?: boolean;
    }
  ) {
    try {
      const query: any = {
        templateIds: [getTemplateId("ComplianceAlert" as any)],
      };

      if (filters) {
        query.query = filters;
      }

      const result = await this.damlService.queryContracts(query, authToken);
      return result;
    } catch (error) {
      ConsoleLogger.error("Query compliance alerts error", error);
      throw error;
    }
  }

  /**
   * Investigate alert
   */
  async investigateAlert(
    contractId: string,
    investigator: string,
    notes: string,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("ComplianceAlert" as any),
          contractId,
          choice: "InvestigateAlert",
          argument: { investigator, notes },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Investigate alert error", error);
      throw error;
    }
  }

  // ESCALATIONS

  /**
   * Query platform escalations
   */
  async queryPlatformEscalations(
    authToken: string,
    filters?: {
      complianceOfficer?: string;
      escalatedTo?: string;
      resolved?: boolean;
    }
  ) {
    try {
      const query: any = {
        templateIds: [getTemplateId("PlatformEscalation" as any)],
      };

      if (filters) {
        query.query = filters;
      }

      const result = await this.damlService.queryContracts(query, authToken);
      return result;
    } catch (error) {
      ConsoleLogger.error("Query platform escalations error", error);
      throw error;
    }
  }

  /**
   * Query compliance escalations
   */
  async queryComplianceEscalations(
    authToken: string,
    filters?: {
      complianceOfficer?: string;
      subject?: string;
      escalatedTo?: string;
      resolved?: boolean;
    }
  ) {
    try {
      const query: any = {
        templateIds: [getTemplateId("ComplianceEscalation" as any)],
      };

      if (filters) {
        query.query = filters;
      }

      const result = await this.damlService.queryContracts(query, authToken);
      return result;
    } catch (error) {
      ConsoleLogger.error("Query compliance escalations error", error);
      throw error;
    }
  }

  /**
   * Resolve platform escalation
   */
  async resolvePlatformEscalation(
    contractId: string,
    resolver: string,
    notes: string,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("PlatformEscalation" as any),
          contractId,
          choice: "ResolvePlatformEscalation",
          argument: { resolver, notes },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Resolve platform escalation error", error);
      throw error;
    }
  }

  /**
   * Resolve compliance escalation
   */
  async resolveComplianceEscalation(
    contractId: string,
    resolver: string,
    notes: string,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("ComplianceEscalation" as any),
          contractId,
          choice: "ResolveComplianceEscalation",
          argument: { resolver, notes },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Resolve compliance escalation error", error);
      throw error;
    }
  }

  // ARCHIVE OPERATIONS

  /**
   * Archive platform log
   */
  async archivePlatformLog(
    contractId: string,
    archiver: string,
    archiveReason: string,
    authToken: string
  ) {
    try {
      const result = await this.damlService.exerciseChoice(
        {
          templateId: getTemplateId("PlatformAuditLog" as any),
          contractId,
          choice: "ArchiveLog",
          argument: { archiver, archiveReason },
        },
        authToken
      );
      return result;
    } catch (error) {
      ConsoleLogger.error("Archive platform log error", error);
      throw error;
    }
  }
}
