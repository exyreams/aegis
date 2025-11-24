import { BaseApiClient } from "./base";
import type { HealthResponse } from "@/types/api";

export class HealthApi extends BaseApiClient {
  async getHealth() {
    try {
      const response = await this.request<HealthResponse>("/health");
      return {
        data: response,
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getApiInfo() {
    try {
      const response = await this.request<{
        name: string;
        version: string;
        description: string;
        environment: string;
        uptime: number;
        features: string[];
      }>("/api/info");

      return {
        data: response,
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async getAnalytics() {
    try {
      const response = await this.request<{
        success: boolean;
        data?: {
          totalRFQs: number;
          totalBids: number;
          totalLoans: number;
          totalUsers: number;
          activeRFQs: number;
          completedLoans: number;
          averageLoanAmount: string;
          averageInterestRate: string;
        };
        error?: string;
      }>("/api/analytics");

      return {
        data: response.success ? response.data : null,
        error: response.success ? null : response.error,
        status: response.success ? 200 : 500,
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

export const healthApi = new HealthApi();
