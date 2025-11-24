import { BaseApiClient } from "./base";
import type {
  CreditProfile,
  CreateCreditProfileRequest,
  CreditProfileResponse,
  CreditInquiry,
  RiskAssessment,
} from "@/types/api";

export class CreditApi extends BaseApiClient {
  async getCreditProfiles() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: CreditProfile[];
        error?: string;
      }>("/api/credit/profiles");

      return {
        data: response.success ? response.data || [] : [],
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async createCreditProfile(data: CreateCreditProfileRequest) {
    try {
      const response = await this.request<CreditProfileResponse>(
        "/api/credit/profiles",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      return {
        data: response.success ? response.data : null,
        error: response.success ? null : response.error,
        status: response.success ? 201 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getCreditProfile(party: string) {
    try {
      const response = await this.request<CreditProfileResponse>(
        `/api/credit/profiles/${party}`
      );

      return {
        data: response.success ? response.data : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 404,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getCreditInquiries() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: CreditInquiry[];
        error?: string;
      }>("/api/credit/inquiries");

      return {
        data: response.success ? response.data || [] : [],
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async createCreditInquiry(data: {
    inquiryId: string;
    borrower: string;
    lender: string;
    purpose: string;
  }) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string };
        error?: string;
      }>("/api/credit/inquiries", {
        method: "POST",
        body: JSON.stringify(data),
      });

      return {
        data: response.success ? response.data : null,
        error: response.success ? null : response.error,
        status: response.success ? 201 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getRiskAssessments() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: RiskAssessment[];
        error?: string;
      }>("/api/credit/risk-assessments");

      return {
        data: response.success ? response.data || [] : [],
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async createRiskAssessment(data: {
    assessmentId: string;
    borrower: string;
    lender: string;
    creditScore: number;
    riskRating: string;
    assessmentDetails: string;
    recommendedInterestRate: string;
    maxLoanAmount: string;
  }) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string };
        error?: string;
      }>("/api/credit/risk-assessments", {
        method: "POST",
        body: JSON.stringify(data),
      });

      return {
        data: response.success ? response.data : null,
        error: response.success ? null : response.error,
        status: response.success ? 201 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // CREDIT PROFILE CHOICES

  async recordLoanOrigination(
    contractId: string,
    loanId: string,
    loanAmount: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/credit/profiles/${contractId}/record-loan`, {
        method: "POST",
        body: JSON.stringify({ loanId, loanAmount }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  async recordRepayment(
    contractId: string,
    loanId: string,
    repaymentAmount: string,
    daysToRepay: number,
    wasOnTime: boolean
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/credit/profiles/${contractId}/record-repayment`, {
        method: "POST",
        body: JSON.stringify({
          loanId,
          repaymentAmount,
          daysToRepay,
          wasOnTime,
        }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  async recordDefault(
    contractId: string,
    loanId: string,
    defaultAmount: string,
    defaultDate: string,
    lender: string,
    platformCid: string,
    assetType: any
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/credit/profiles/${contractId}/record-default`, {
        method: "POST",
        body: JSON.stringify({
          loanId,
          defaultAmount,
          defaultDate,
          lender,
          platformCid,
          assetType,
        }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  async recordDefaultResolution(
    contractId: string,
    loanId: string,
    resolutionDate: string,
    recoveryAmount: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/credit/profiles/${contractId}/record-default-resolution`, {
        method: "POST",
        body: JSON.stringify({ loanId, resolutionDate, recoveryAmount }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  async updatePrivacyLevel(contractId: string, newPrivacyLevel: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/credit/profiles/${contractId}/update-privacy`, {
        method: "POST",
        body: JSON.stringify({ newPrivacyLevel }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  // RISK ASSESSMENT CHOICES

  async acceptAssessment(contractId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/credit/risk-assessments/${contractId}/accept`, {
        method: "POST",
      });

      return {
        success: response.success,
        message: response.message,
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

  async rejectAssessment(contractId: string, rejectionReason: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/credit/risk-assessments/${contractId}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejectionReason }),
      });

      return {
        success: response.success,
        message: response.message,
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

  // PORTFOLIO RISK

  async getPortfolioRisks() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/credit/portfolio-risks");

      return {
        data: response.success ? response.data || [] : [],
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async createPortfolioRisk(data: any) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any;
        error?: string;
      }>("/api/credit/portfolio-risks", {
        method: "POST",
        body: JSON.stringify(data),
      });

      return {
        data: response.success ? response.data : null,
        error: response.success ? null : response.error,
        status: response.success ? 201 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async updatePortfolioRisk(
    contractId: string,
    newActiveLoans: number,
    newTotalExposure: string,
    newAverageLTV: string,
    newConcentrationByBorrower: Array<[string, string]>,
    newConcentrationByAssetType: Array<[string, string]>,
    newRiskMetrics: any
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/credit/portfolio-risks/${contractId}/update`, {
        method: "POST",
        body: JSON.stringify({
          newActiveLoans,
          newTotalExposure,
          newAverageLTV,
          newConcentrationByBorrower,
          newConcentrationByAssetType,
          newRiskMetrics,
        }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  async checkConcentrationLimits(
    contractId: string,
    maxBorrowerConcentration: string,
    maxAssetTypeConcentration: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/credit/portfolio-risks/${contractId}/check-limits`, {
        method: "POST",
        body: JSON.stringify({
          maxBorrowerConcentration,
          maxAssetTypeConcentration,
        }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  // CREDIT INSURANCE

  async getInsurancePolicies() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/credit/insurance-policies");

      return {
        data: response.success ? response.data || [] : [],
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async createInsurancePolicy(data: any) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any;
        error?: string;
      }>("/api/credit/insurance-policies", {
        method: "POST",
        body: JSON.stringify(data),
      });

      return {
        data: response.success ? response.data : null,
        error: response.success ? null : response.error,
        status: response.success ? 201 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async fileInsuranceClaim(
    contractId: string,
    defaultAmount: string,
    claimDate: string,
    claimEvidence: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/credit/insurance-policies/${contractId}/file-claim`, {
        method: "POST",
        body: JSON.stringify({ defaultAmount, claimDate, claimEvidence }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  async cancelInsurance(contractId: string, cancellationReason: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/credit/insurance-policies/${contractId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ cancellationReason }),
      });

      return {
        success: response.success,
        message: response.message,
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

  // CREDIT GUARANTEES

  async getGuarantees() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/credit/guarantees");

      return {
        data: response.success ? response.data || [] : [],
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async createGuarantee(data: any) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any;
        error?: string;
      }>("/api/credit/guarantees", {
        method: "POST",
        body: JSON.stringify(data),
      });

      return {
        data: response.success ? response.data : null,
        error: response.success ? null : response.error,
        status: response.success ? 201 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async invokeGuarantee(
    contractId: string,
    loanId: string,
    defaultAmount: string,
    invokeDate: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/credit/guarantees/${contractId}/invoke`, {
        method: "POST",
        body: JSON.stringify({ loanId, defaultAmount, invokeDate }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  // CREDIT INQUIRIES

  async getInquiries() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/credit/inquiries");

      return {
        data: response.success ? response.data || [] : [],
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async createInquiry(data: any) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any;
        error?: string;
      }>("/api/credit/inquiries", {
        method: "POST",
        body: JSON.stringify(data),
      });

      return {
        data: response.success ? response.data : null,
        error: response.success ? null : response.error,
        status: response.success ? 201 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async approveInquiry(contractId: string, creditProfile: any) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/credit/inquiries/${contractId}/approve`, {
        method: "POST",
        body: JSON.stringify({ creditProfile }),
      });

      return {
        data: response.success ? response.data : null,
        message: response.message,
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

  async declineInquiry(contractId: string, reason: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/credit/inquiries/${contractId}/decline`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });

      return {
        success: response.success,
        message: response.message,
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
}

export const creditApi = new CreditApi();
