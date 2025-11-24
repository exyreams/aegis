import { BaseApiClient } from "./base";
import type {
  SyndicatedLoan,
  SyndicatedLoanResponse,
  SyndicateFormation,
} from "@/types/api";

export class SyndicationApi extends BaseApiClient {
  async getSyndicatedLoans() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: SyndicatedLoan[];
        error?: string;
      }>("/api/syndication/loans");

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

  async createSyndicatedLoan(data: {
    loanId: string;
    borrower: string;
    leadLender: string;
    totalAmount: string;
    interestRate: string;
    arrangementFee: string;
    participationFee: string;
    terms: string;
  }) {
    try {
      const response = await this.request<SyndicatedLoanResponse>(
        "/api/syndication/loans",
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

  async getSyndicatedLoan(loanId: string) {
    try {
      const response = await this.request<SyndicatedLoanResponse>(
        `/api/syndication/loans/${loanId}`
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

  async getSyndicateFormations() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: SyndicateFormation[];
        error?: string;
      }>("/api/syndication/formations");

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

  async createSyndicateFormation(data: {
    formationId: string;
    leadLender: string;
    borrower: string;
    loanAmount: string;
    targetParticipants: number;
    minimumCommitment: string;
    arrangementFee: string;
    participationFee: string;
    deadline: string;
  }) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string };
        error?: string;
      }>("/api/syndication/formations", {
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

  async commitToSyndicate(formationId: string, commitment: string) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string };
        error?: string;
      }>(`/api/syndication/formations/${formationId}/commit`, {
        method: "POST",
        body: JSON.stringify({ commitment }),
      });

      return {
        data: response.success ? response.data : null,
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

  async finalizeSyndicate(formationId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string };
        error?: string;
      }>(`/api/syndication/formations/${formationId}/finalize`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      return {
        data: response.success ? response.data : null,
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

  async makeSyndicatedPayment(
    contractId: string,
    paymentAmount: string,
    principalPortion: string,
    interestPortion: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/syndication/loans/${contractId}/payment`, {
        method: "POST",
        body: JSON.stringify({
          paymentAmount,
          principalPortion,
          interestPortion,
        }),
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

  async proposeSyndicateDecision(
    contractId: string,
    proposer: string,
    decisionType: string,
    description: string,
    votingDeadline: string,
    requiredMajority: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/syndication/loans/${contractId}/propose-decision`, {
        method: "POST",
        body: JSON.stringify({
          proposer,
          decisionType,
          description,
          votingDeadline,
          requiredMajority,
        }),
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

  async markSyndicatedDefault(contractId: string, defaultReason: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/syndication/loans/${contractId}/mark-default`, {
        method: "POST",
        body: JSON.stringify({ defaultReason }),
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

  async addSyndicateParticipant(contractId: string, newParticipant: any) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/syndication/loans/${contractId}/add-participant`, {
        method: "POST",
        body: JSON.stringify({ newParticipant }),
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

  async removeSyndicateParticipant(
    contractId: string,
    participantToRemove: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/syndication/loans/${contractId}/remove-participant`, {
        method: "POST",
        body: JSON.stringify({ participantToRemove }),
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

  async distributeArrangementFees(contractId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/syndication/loans/${contractId}/distribute-fees`, {
        method: "POST",
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

  // SYNDICATE FORMATIONS

  async commitToSyndicateFormation(
    contractId: string,
    lender: string,
    profile: any,
    commitmentAmount: string,
    role: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/syndication/formations/${contractId}/commit`, {
        method: "POST",
        body: JSON.stringify({ lender, profile, commitmentAmount, role }),
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

  async finalizeSyndicateFormation(
    contractId: string,
    interestRateStructure: any,
    repaymentSchedule: any,
    collateralAssets: any[],
    covenants: string[],
    loanDuration: any
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/syndication/formations/${contractId}/finalize`, {
        method: "POST",
        body: JSON.stringify({
          interestRateStructure,
          repaymentSchedule,
          collateralAssets,
          covenants,
          loanDuration,
        }),
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

  async cancelFormation(contractId: string, reason: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/syndication/formations/${contractId}/cancel`, {
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

  // SYNDICATE VOTES

  async getSyndicateVotes() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/syndication/votes");

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

  async voteFor(contractId: string, voter: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/syndication/votes/${contractId}/vote-for`, {
        method: "POST",
        body: JSON.stringify({ voter }),
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

  async voteAgainst(contractId: string, voter: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/syndication/votes/${contractId}/vote-against`, {
        method: "POST",
        body: JSON.stringify({ voter }),
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

  async finalizeVote(contractId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/syndication/votes/${contractId}/finalize`, {
        method: "POST",
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

  // SYNDICATE REPORTS

  async getSyndicateReports() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/syndication/reports");

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

  async acknowledgeReport(contractId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/syndication/reports/${contractId}/acknowledge`, {
        method: "POST",
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
}

export const syndicationApi = new SyndicationApi();
