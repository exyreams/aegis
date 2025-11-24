import { BaseApiClient } from "./base";
import type { ApiResponse } from "@/types/api";

export interface BidData {
  bidContractId: string;
  rfqContractId: string;
  rfqTitle: string;
  borrower: string;
  loanAmount: number;
  collateralAsset: string;
  interestRate: string;
  interestRateDecimal: string;
  additionalTerms: string;
  submittedAt: string;
  status: string;
  rfqStatus: string;
  rfqExpiresAt?: string;
}

export interface ReceivedBidData {
  bidContractId: string;
  lender: string;
  interestRate: string;
  interestRateDecimal: string;
  additionalTerms: string;
  submittedAt: string;
  status: string;
}

export interface RFQWithBids {
  rfqContractId: string;
  rfqTitle: string;
  loanAmount: number;
  collateralAsset: string;
  rfqStatus: string;
  rfqExpiresAt?: string;
  bidCount: number;
  bids: ReceivedBidData[];
  bestRate: string | null;
}

export interface BidStats {
  // Lender stats
  totalBidsSubmitted?: number;
  averageInterestRate?: string;
  pendingBids?: number;
  acceptedBids?: number;
  rejectedBids?: number;

  // Borrower stats
  totalRFQsCreated?: number;
  totalBidsReceived?: number;
  activeRFQs?: number;
  completedLoans?: number;
}

export class BidsApi extends BaseApiClient {
  /**
   * Get all bids submitted by the current user (for lenders)
   */
  async getMyBids(): Promise<ApiResponse<BidData[]>> {
    try {
      const data = await this.request<{ data: BidData[] }>("/api/bids/my-bids");
      return {
        status: 200,
        data: data.data || [],
      };
    } catch (error) {
      return {
        status: 500,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Get all bids received on user's RFQs (for borrowers)
   */
  async getReceivedBids(): Promise<ApiResponse<RFQWithBids[]>> {
    try {
      const data = await this.request<{ data: RFQWithBids[] }>(
        "/api/bids/received"
      );
      return {
        status: 200,
        data: data.data || [],
      };
    } catch (error) {
      return {
        status: 500,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Get bidding statistics for dashboard
   */
  async getBidStats(): Promise<ApiResponse<BidStats>> {
    try {
      const data = await this.request<{ data: BidStats }>("/api/bids/stats");
      return {
        status: 200,
        data: data.data || {},
      };
    } catch (error) {
      return {
        status: 500,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Get bids for a specific RFQ (for borrowers to see bids on their RFQs)
   */
  async getRFQBids(
    rfqContractId: string
  ): Promise<ApiResponse<ReceivedBidData[]>> {
    try {
      const data = await this.request<{ data: ReceivedBidData[] }>(
        `/api/rfqs/${rfqContractId}/bids`
      );
      return {
        status: 200,
        data: data.data || [],
      };
    } catch (error) {
      return {
        status: 500,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Accept a bid on an RFQ (for borrowers)
   */
  async acceptBid(
    rfqContractId: string,
    bidContractId: string
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const data = await this.request<{ data: { success: boolean } }>(
        `/api/rfqs/${rfqContractId}/accept-bid`,
        {
          method: "POST",
          body: JSON.stringify({
            bidContractId,
          }),
        }
      );
      return {
        status: 200,
        data: data.data,
      };
    } catch (error) {
      return {
        status: 500,
        error: this.handleError(error),
      };
    }
  }
}

export const bidsApi = new BidsApi();
