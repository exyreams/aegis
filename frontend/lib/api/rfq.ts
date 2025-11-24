import { BaseApiClient } from "./base";
import type {
  RFQData,
  CreateRFQRequest,
  BidData,
  BidResponse,
  RFQResponse,
  AcceptBidResponse,
} from "@/types/api";

export class RfqApi extends BaseApiClient {
  async getRFQs(params?: {
    status?: string;
    borrower?: string;
    asset?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/api/rfqs${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await this.request<{
        data?: RFQData[];
        error?: string;
        pagination?: {
          total: number;
          limit: number;
          offset: number;
          hasMore: boolean;
        };
        filters?: Record<string, string>;
      }>(endpoint);

      return {
        data: response.data || [],
        error: response.error || null,
        status: 200,
        pagination: response.pagination,
        filters: response.filters,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async createRFQ(data: CreateRFQRequest) {
    try {
      const response = await this.request<{
        data?: RFQResponse;
        error?: string;
        message?: string;
      }>("/api/rfqs", {
        method: "POST",
        body: JSON.stringify(data),
      });

      return {
        data: response.data || null,
        error: response.error || null,
        status: response.data ? 201 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getRFQ(contractId: string) {
    try {
      const response = await this.request<{
        data?: RFQData;
        error?: string;
      }>(`/api/rfqs/${contractId}`);

      return {
        data: response.data || null,
        error: response.error || null,
        status: response.data ? 200 : 404,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async submitBid(rfqContractId: string, data: BidData) {
    try {
      const response = await this.request<{
        data?: BidResponse;
        error?: string;
        message?: string;
      }>(`/api/rfqs/${rfqContractId}/bids`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      return {
        data: response.data || null,
        error: response.error || null,
        status: response.data ? 201 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async acceptBid(rfqContractId: string, bidContractId: string) {
    try {
      const response = await this.request<{
        data?: AcceptBidResponse;
        error?: string;
        message?: string;
      }>(`/api/rfqs/${rfqContractId}/accept-bid`, {
        method: "POST",
        body: JSON.stringify({ bidContractId }),
      });

      return {
        data: response.data || null,
        error: response.error || null,
        status: response.data ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getBids(rfqContractId: string) {
    try {
      const response = await this.request<{
        data?: BidResponse[];
        error?: string;
      }>(`/api/rfqs/${rfqContractId}/bids`);

      return {
        data: response.data || [],
        error: response.error || null,
        status: response.data ? 200 : 404,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getAllBids() {
    try {
      const response = await this.request<any>("/api/daml/bids");

      return {
        data: response || [],
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getMyBids() {
    try {
      const response = await this.request<{
        data?: any[];
        metadata?: {
          totalBids: number;
          userParty: string;
        };
        error?: string;
      }>("/api/rfqs/bids/my-bids");

      return {
        data: response.data || [],
        metadata: response.metadata,
        error: response.error || null,
        status: response.data ? 200 : 500,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getBidsForRFQ(contractId: string) {
    try {
      const response = await this.request<{
        data?: any[];
        metadata?: {
          rfqId: string;
          totalBids: number;
          userRole: string;
          canAcceptBids: boolean;
        };
        error?: string;
      }>(`/api/rfqs/${contractId}/bids`);

      return {
        data: response.data || [],
        metadata: response.metadata,
        error: response.error || null,
        status: response.data ? 200 : 404,
      };
    } catch (error) {
      return {
        data: [],
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  // RFQ MANAGEMENT CHOICES

  async startReview(contractId: string) {
    try {
      const response = await this.request<{
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/rfqs/${contractId}/start-review`, {
        method: "POST",
      });

      return {
        data: response.data || null,
        message: response.message,
        error: response.error || null,
        status: response.data ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async cancelRFQ(contractId: string, reason: string) {
    try {
      const response = await this.request<{
        message?: string;
        error?: string;
      }>(`/api/rfqs/${contractId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });

      return {
        success: !!response.message,
        message: response.message,
        error: response.error || null,
        status: response.message ? 200 : 400,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async extendExpiration(contractId: string, newExpiresAt: string) {
    try {
      const response = await this.request<{
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/rfqs/${contractId}/extend`, {
        method: "POST",
        body: JSON.stringify({ newExpiresAt }),
      });

      return {
        data: response.data || null,
        message: response.message,
        error: response.error || null,
        status: response.data ? 200 : 400,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async markExpired(contractId: string) {
    try {
      const response = await this.request<{
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/rfqs/${contractId}/mark-expired`, {
        method: "POST",
      });

      return {
        data: response.data || null,
        message: response.message,
        error: response.error || null,
        status: response.data ? 200 : 400,
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

export const rfqApi = new RfqApi();
