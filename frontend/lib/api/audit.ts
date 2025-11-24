import { BaseApiClient } from "./base";

// Type definitions for Audit API

// Platform Audit Log
export interface PlatformAuditLog {
  platform: string;
  eventType: string;
  eventDescription: string;
  eventTimestamp: string;
  triggeredBy: string;
  affectedParties: string[];
  severity: string;
  requiresReview: boolean;
  reviewed: boolean;
  reviewedBy?: string;
  reviewNotes?: string;
  escalated: boolean;
}

// Lender Audit Log
export interface LenderAuditLog {
  lender: string;
  eventType: string;
  eventDescription: string;
  eventTimestamp: string;
  counterparty?: string;
  transactionAmount?: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  flaggedAsSuspicious: boolean;
}

// Borrower Audit Log
export interface BorrowerAuditLog {
  borrower: string;
  eventType: string;
  eventDescription: string;
  eventTimestamp: string;
  counterparty?: string;
  transactionAmount?: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

// Loan Audit Trail
export interface LoanAuditTrail {
  borrower: string;
  loanId: string;
  loanAmount: string;
  lender: string;
  currentStatus: string;
  events: Array<{
    eventType: string;
    eventDescription: string;
    eventTimestamp: string;
    triggeredBy: string;
    eventData: Array<[string, string]>;
    financialImpact?: {
      amountChange: string;
      balanceAfter: string;
    };
  }>;
  createdAt: string;
  lastUpdated: string;
}

// Pool Audit Log
export interface PoolAuditLog {
  poolManager: string;
  poolId: string;
  eventType: string;
  eventDescription: string;
  eventTimestamp: string;
  liquidityChange?: string;
  participantCount: number;
}

// Compliance Audit Log
export interface ComplianceAuditLog {
  complianceOfficer: string;
  subject: string;
  complianceCheckType: string;
  checkResult: string;
  checkTimestamp: string;
  riskLevel: string;
  findings: string;
  actionRequired: boolean;
  actionTaken?: string;
  escalated: boolean;
}

// Activity Monitor
export interface ActivityMonitor {
  platform: string;
  monitoredParty: string;
  activityType: string;
  activityCount: number;
  threshold: number;
  thresholdExceeded: boolean;
  alertTriggered: boolean;
  monitoringPeriod: string;
  lastActivity: string;
}

// Compliance Alert
export interface ComplianceAlert {
  platform: string;
  subject: string;
  alertType: string;
  alertLevel: string;
  alertDescription: string;
  alertTimestamp: string;
  investigated: boolean;
  investigatedBy?: string;
  investigationNotes?: string;
}

// Platform Escalation
export interface PlatformEscalation {
  complianceOfficer: string;
  originalLogId: string;
  escalationReason: string;
  escalatedTo: string;
  escalationTimestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  resolutionNotes?: string;
}

// Compliance Escalation
export interface ComplianceEscalation {
  complianceOfficer: string;
  subject: string;
  originalCheckId: string;
  escalationReason: string;
  escalatedTo: string;
  escalationTimestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  resolutionNotes?: string;
}

// Request types
export interface ReviewLogRequest {
  reviewer: string;
  notes: string;
  approved: boolean;
}

export interface EscalateEventRequest {
  escalationReason: string;
  escalatedTo: string;
}

export interface FlagSuspiciousRequest {
  flaggedBy: string;
  suspicionReason: string;
  alertLevel: string;
}

export interface LogLoanEventRequest {
  eventType: string;
  eventDescription: string;
  eventData?: Array<[string, string]>;
  financialImpact?: {
    amountChange: string;
    balanceAfter: string;
  };
}

// Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  result?: any;
  logs?: any[];
  trails?: any[];
  monitors?: any[];
  alerts?: any[];
  escalations?: any[];
  count?: number;
  export?: any;
  report?: any;
  error?: string;
}

export class AuditApi extends BaseApiClient {
  // PLATFORM AUDIT LOGS

  async getPlatformLogs(filters?: {
    platform?: string;
    eventType?: string;
    severity?: string;
    requiresReview?: boolean;
    reviewed?: boolean;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.platform) params.append("platform", filters.platform);
      if (filters?.eventType) params.append("eventType", filters.eventType);
      if (filters?.severity) params.append("severity", filters.severity);
      if (filters?.requiresReview !== undefined)
        params.append("requiresReview", String(filters.requiresReview));
      if (filters?.reviewed !== undefined)
        params.append("reviewed", String(filters.reviewed));

      const queryString = params.toString();
      const response = await this.request<ApiResponse<PlatformAuditLog[]>>(
        `/api/audit/platform${queryString ? `?${queryString}` : ""}`
      );

      return {
        data: response.success ? response.logs || [] : [],
        count: response.count || 0,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async reviewPlatformLog(contractId: string, data: ReviewLogRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/platform/${contractId}/review`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async escalatePlatformEvent(contractId: string, data: EscalateEventRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/platform/${contractId}/escalate`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async archivePlatformLog(contractId: string, archiveReason: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/platform/${contractId}/archive`,
        {
          method: "POST",
          body: JSON.stringify({ archiveReason }),
        }
      );

      return {
        success: response.success,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // LENDER AUDIT LOGS

  async getLenderLogs(filters?: {
    lender?: string;
    eventType?: string;
    counterparty?: string;
    acknowledged?: boolean;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.lender) params.append("lender", filters.lender);
      if (filters?.eventType) params.append("eventType", filters.eventType);
      if (filters?.counterparty)
        params.append("counterparty", filters.counterparty);
      if (filters?.acknowledged !== undefined)
        params.append("acknowledged", String(filters.acknowledged));

      const queryString = params.toString();
      const response = await this.request<ApiResponse<LenderAuditLog[]>>(
        `/api/audit/lender${queryString ? `?${queryString}` : ""}`
      );

      return {
        data: response.success ? response.logs || [] : [],
        count: response.count || 0,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async acknowledgeLenderLog(contractId: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/lender/${contractId}/acknowledge`,
        {
          method: "POST",
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async exportLenderLog(contractId: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/lender/${contractId}/export`,
        {
          method: "POST",
        }
      );

      return {
        data: response.success ? response.export : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async flagSuspiciousActivity(
    contractId: string,
    data: FlagSuspiciousRequest
  ) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/lender/${contractId}/flag`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // BORROWER AUDIT LOGS

  async getBorrowerLogs(filters?: {
    borrower?: string;
    eventType?: string;
    counterparty?: string;
    acknowledged?: boolean;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.borrower) params.append("borrower", filters.borrower);
      if (filters?.eventType) params.append("eventType", filters.eventType);
      if (filters?.counterparty)
        params.append("counterparty", filters.counterparty);
      if (filters?.acknowledged !== undefined)
        params.append("acknowledged", String(filters.acknowledged));

      const queryString = params.toString();
      const response = await this.request<ApiResponse<BorrowerAuditLog[]>>(
        `/api/audit/borrower${queryString ? `?${queryString}` : ""}`
      );

      return {
        data: response.success ? response.logs || [] : [],
        count: response.count || 0,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async acknowledgeBorrowerLog(contractId: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/borrower/${contractId}/acknowledge`,
        {
          method: "POST",
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async exportBorrowerLog(contractId: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/borrower/${contractId}/export`,
        {
          method: "POST",
        }
      );

      return {
        data: response.success ? response.export : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // LOAN AUDIT TRAILS

  async getLoanTrails(filters?: {
    borrower?: string;
    loanId?: string;
    currentStatus?: string;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.borrower) params.append("borrower", filters.borrower);
      if (filters?.loanId) params.append("loanId", filters.loanId);
      if (filters?.currentStatus)
        params.append("currentStatus", filters.currentStatus);

      const queryString = params.toString();
      const response = await this.request<ApiResponse<LoanAuditTrail[]>>(
        `/api/audit/loan${queryString ? `?${queryString}` : ""}`
      );

      return {
        data: response.success ? response.trails || [] : [],
        count: response.count || 0,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async logLoanEvent(contractId: string, data: LogLoanEventRequest) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/loan/${contractId}/log-event`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async generateLoanReport(contractId: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/loan/${contractId}/report`,
        {
          method: "POST",
        }
      );

      return {
        data: response.success ? response.report : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async updateLoanStatus(contractId: string, newStatus: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/loan/${contractId}/status`,
        {
          method: "POST",
          body: JSON.stringify({ newStatus }),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // POOL AUDIT LOGS

  async getPoolLogs(filters?: {
    poolManager?: string;
    poolId?: string;
    eventType?: string;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.poolManager)
        params.append("poolManager", filters.poolManager);
      if (filters?.poolId) params.append("poolId", filters.poolId);
      if (filters?.eventType) params.append("eventType", filters.eventType);

      const queryString = params.toString();
      const response = await this.request<ApiResponse<PoolAuditLog[]>>(
        `/api/audit/pool${queryString ? `?${queryString}` : ""}`
      );

      return {
        data: response.success ? response.logs || [] : [],
        count: response.count || 0,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async generatePoolReport(contractId: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/pool/${contractId}/report`,
        {
          method: "POST",
        }
      );

      return {
        data: response.success ? response.report : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // COMPLIANCE AUDIT LOGS

  async getComplianceLogs(filters?: {
    complianceOfficer?: string;
    subject?: string;
    complianceCheckType?: string;
    checkResult?: string;
    riskLevel?: string;
    actionRequired?: boolean;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.complianceOfficer)
        params.append("complianceOfficer", filters.complianceOfficer);
      if (filters?.subject) params.append("subject", filters.subject);
      if (filters?.complianceCheckType)
        params.append("complianceCheckType", filters.complianceCheckType);
      if (filters?.checkResult)
        params.append("checkResult", filters.checkResult);
      if (filters?.riskLevel) params.append("riskLevel", filters.riskLevel);
      if (filters?.actionRequired !== undefined)
        params.append("actionRequired", String(filters.actionRequired));

      const queryString = params.toString();
      const response = await this.request<ApiResponse<ComplianceAuditLog[]>>(
        `/api/audit/compliance${queryString ? `?${queryString}` : ""}`
      );

      return {
        data: response.success ? response.logs || [] : [],
        count: response.count || 0,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async recordComplianceAction(contractId: string, action: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/compliance/${contractId}/action`,
        {
          method: "POST",
          body: JSON.stringify({ action }),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async escalateComplianceIssue(
    contractId: string,
    escalationReason: string,
    escalatedTo: string
  ) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/compliance/${contractId}/escalate`,
        {
          method: "POST",
          body: JSON.stringify({ escalationReason, escalatedTo }),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // ACTIVITY MONITORS

  async getActivityMonitors(filters?: {
    platform?: string;
    monitoredParty?: string;
    activityType?: string;
    thresholdExceeded?: boolean;
    alertTriggered?: boolean;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.platform) params.append("platform", filters.platform);
      if (filters?.monitoredParty)
        params.append("monitoredParty", filters.monitoredParty);
      if (filters?.activityType)
        params.append("activityType", filters.activityType);
      if (filters?.thresholdExceeded !== undefined)
        params.append("thresholdExceeded", String(filters.thresholdExceeded));
      if (filters?.alertTriggered !== undefined)
        params.append("alertTriggered", String(filters.alertTriggered));

      const queryString = params.toString();
      const response = await this.request<ApiResponse<ActivityMonitor[]>>(
        `/api/audit/activity-monitor${queryString ? `?${queryString}` : ""}`
      );

      return {
        data: response.success ? response.monitors || [] : [],
        count: response.count || 0,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async recordActivity(contractId: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/activity-monitor/${contractId}/record`,
        {
          method: "POST",
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async resetActivityCounter(contractId: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/activity-monitor/${contractId}/reset`,
        {
          method: "POST",
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // COMPLIANCE ALERTS

  async getComplianceAlerts(filters?: {
    platform?: string;
    subject?: string;
    alertType?: string;
    alertLevel?: string;
    investigated?: boolean;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.platform) params.append("platform", filters.platform);
      if (filters?.subject) params.append("subject", filters.subject);
      if (filters?.alertType) params.append("alertType", filters.alertType);
      if (filters?.alertLevel) params.append("alertLevel", filters.alertLevel);
      if (filters?.investigated !== undefined)
        params.append("investigated", String(filters.investigated));

      const queryString = params.toString();
      const response = await this.request<ApiResponse<ComplianceAlert[]>>(
        `/api/audit/alerts${queryString ? `?${queryString}` : ""}`
      );

      return {
        data: response.success ? response.alerts || [] : [],
        count: response.count || 0,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async investigateAlert(contractId: string, notes: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/alerts/${contractId}/investigate`,
        {
          method: "POST",
          body: JSON.stringify({ notes }),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // ESCALATIONS

  async getPlatformEscalations(filters?: {
    complianceOfficer?: string;
    escalatedTo?: string;
    resolved?: boolean;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.complianceOfficer)
        params.append("complianceOfficer", filters.complianceOfficer);
      if (filters?.escalatedTo)
        params.append("escalatedTo", filters.escalatedTo);
      if (filters?.resolved !== undefined)
        params.append("resolved", String(filters.resolved));

      const queryString = params.toString();
      const response = await this.request<ApiResponse<PlatformEscalation[]>>(
        `/api/audit/escalations/platform${queryString ? `?${queryString}` : ""}`
      );

      return {
        data: response.success ? response.escalations || [] : [],
        count: response.count || 0,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getComplianceEscalations(filters?: {
    complianceOfficer?: string;
    subject?: string;
    escalatedTo?: string;
    resolved?: boolean;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.complianceOfficer)
        params.append("complianceOfficer", filters.complianceOfficer);
      if (filters?.subject) params.append("subject", filters.subject);
      if (filters?.escalatedTo)
        params.append("escalatedTo", filters.escalatedTo);
      if (filters?.resolved !== undefined)
        params.append("resolved", String(filters.resolved));

      const queryString = params.toString();
      const response = await this.request<ApiResponse<ComplianceEscalation[]>>(
        `/api/audit/escalations/compliance${
          queryString ? `?${queryString}` : ""
        }`
      );

      return {
        data: response.success ? response.escalations || [] : [],
        count: response.count || 0,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async resolvePlatformEscalation(contractId: string, notes: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/escalations/platform/${contractId}/resolve`,
        {
          method: "POST",
          body: JSON.stringify({ notes }),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async resolveComplianceEscalation(contractId: string, notes: string) {
    try {
      const response = await this.request<ApiResponse<any>>(
        `/api/audit/escalations/compliance/${contractId}/resolve`,
        {
          method: "POST",
          body: JSON.stringify({ notes }),
        }
      );

      return {
        data: response.success ? response.result : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }
}

export const auditApi = new AuditApi();
