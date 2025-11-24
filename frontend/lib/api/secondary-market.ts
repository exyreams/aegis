import { BaseApiClient } from "./base";
import type { LoanListing, LoanListingResponse, LoanOffer } from "@/types/api";

export class SecondaryMarketApi extends BaseApiClient {
  async getLoanListings() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: LoanListing[];
        error?: string;
      }>("/api/secondary-market/listings");

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

  async createLoanListing(data: {
    listingId: string;
    seller: string;
    loanId: string;
    askingPrice: string;
    loanDetails: {
      originalAmount: string;
      outstandingAmount: string;
      interestRate: string;
      maturityDate: string;
      borrower: string;
    };
  }) {
    try {
      const response = await this.request<LoanListingResponse>(
        "/api/secondary-market/listings",
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

  async getLoanListing(listingId: string) {
    try {
      const response = await this.request<LoanListingResponse>(
        `/api/secondary-market/listings/${listingId}`
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

  async getLoanOffers(listingId?: string) {
    try {
      const endpoint = listingId
        ? `/api/secondary-market/offers?listingId=${listingId}`
        : "/api/secondary-market/offers";

      const response = await this.request<{
        success: boolean;
        data?: LoanOffer[];
        error?: string;
      }>(endpoint);

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

  async createLoanOffer(data: {
    offerId: string;
    buyer: string;
    listingId: string;
    offerPrice: string;
    terms: string;
    validUntil: string;
  }) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string };
        error?: string;
      }>("/api/secondary-market/offers", {
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

  async acceptOffer(offerId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        data?: { contractId: string };
        error?: string;
      }>(`/api/secondary-market/offers/${offerId}/accept`, {
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

  async cancelListing(contractId: string, reason: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/secondary-market/listings/${contractId}/cancel`, {
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

  async makeOffer(
    contractId: string,
    buyer: string,
    offerPrice: string,
    offerTerms: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/secondary-market/listings/${contractId}/make-offer`, {
        method: "POST",
        body: JSON.stringify({ buyer, offerPrice, offerTerms }),
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

  async acceptOfferOnListing(
    contractId: string,
    offerCid: string,
    borrower: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/secondary-market/listings/${contractId}/accept-offer`, {
        method: "POST",
        body: JSON.stringify({ offerCid, borrower }),
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

  async updateAskingPrice(contractId: string, newPrice: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/secondary-market/listings/${contractId}/update-price`, {
        method: "POST",
        body: JSON.stringify({ newPrice }),
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

  // LOAN OFFERS

  async getOffers() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/secondary-market/offers");

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

  async withdrawOffer(contractId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/secondary-market/offers/${contractId}/withdraw`, {
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

  async rejectOffer(contractId: string, rejectionReason: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/secondary-market/offers/${contractId}/reject`, {
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

  // SECONDARY LOAN TRANSFERS

  async getTransfers() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/secondary-market/transfers");

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

  async executeTransfer(
    contractId: string,
    originalLoanCid: string,
    transferFee: string,
    platformCid: string,
    assetType: any
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/secondary-market/transfers/${contractId}/execute`, {
        method: "POST",
        body: JSON.stringify({
          originalLoanCid,
          transferFee,
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

  async cancelTransfer(contractId: string, cancellationReason: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/secondary-market/transfers/${contractId}/cancel`, {
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

  // TRANSFER SETTLEMENTS

  async getSettlements() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/secondary-market/settlements");

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

  async acknowledgeSettlement(contractId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        error?: string;
      }>(`/api/secondary-market/settlements/${contractId}/acknowledge`, {
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

  // LOAN VALUATIONS

  async getValuations() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/secondary-market/valuations");

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

  async updateValuation(
    contractId: string,
    newFairValue: string,
    newDiscountRate: string,
    newMethodology?: string
  ) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/secondary-market/valuations/${contractId}/update`, {
        method: "POST",
        body: JSON.stringify({
          newFairValue,
          newDiscountRate,
          newMethodology,
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

  // BORROWER NOTIFICATIONS

  async getNotifications() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: any[];
        error?: string;
      }>("/api/secondary-market/notifications");

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

  async acknowledgeNotification(contractId: string) {
    try {
      const response = await this.request<{
        success: boolean;
        message?: string;
        data?: any;
        error?: string;
      }>(`/api/secondary-market/notifications/${contractId}/acknowledge`, {
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

export const secondaryMarketApi = new SecondaryMarketApi();
