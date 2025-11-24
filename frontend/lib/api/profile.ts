import { BaseApiClient } from "./base";

// Privacy-preserving lender profile
export interface LenderProfile {
  // Public tier information (non-sensitive)
  categoryTier:
    | "Tier1Bank"
    | "RegionalBank"
    | "InvestmentFund"
    | "PrivateEquity"
    | "InsuranceCompany"
    | "PensionFund"
    | "SpecialtyLender";
  ratingTier: "Premium" | "Standard" | "Basic";
  capacityTier: "Large" | "Medium" | "Small";
  geographicScope: "Global" | "Regional" | "Local";
  anonymousId: string; // AEGIS-INST-001, AEGIS-PRIV-002, etc.

  // Private information (internal use only, never sent to DAML)
  internalCategory?: string;
  internalRating?: string;
  internalCapacity?: string;
  internalAvailableCapacity?: string;
  activeLoans?: number;
  defaultRate?: string;
  averageInterestRate?: string;
}

export interface LenderProfileOptions {
  categoryTiers: Array<{
    value:
      | "Tier1Bank"
      | "RegionalBank"
      | "InvestmentFund"
      | "PrivateEquity"
      | "InsuranceCompany"
      | "PensionFund"
      | "SpecialtyLender";
    label: string;
    description: string;
  }>;
  ratingTiers: Array<{
    value: "Premium" | "Standard" | "Basic";
    label: string;
    description: string;
  }>;
  capacityTiers: Array<{
    value: "Large" | "Medium" | "Small";
    label: string;
    description: string;
  }>;
  geographicScopes: Array<{
    value: "Global" | "Regional" | "Local";
    label: string;
    description: string;
  }>;
}

export class ProfileApi extends BaseApiClient {
  async getLenderProfile() {
    try {
      const response = await this.request<{
        data?: LenderProfile;
        error?: string;
      }>("/api/profile/lender");

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

  async updateLenderProfile(profile: Partial<LenderProfile>) {
    try {
      const response = await this.request<{
        data?: LenderProfile;
        error?: string;
        message?: string;
      }>("/api/profile/lender", {
        method: "PUT",
        body: JSON.stringify(profile),
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

  async getLenderProfileOptions() {
    try {
      const response = await this.request<{
        data?: LenderProfileOptions;
        error?: string;
      }>("/api/profile/lender/options");

      return {
        data: response.data || null,
        error: response.error || null,
        status: response.data ? 200 : 500,
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

export const profileApi = new ProfileApi();
