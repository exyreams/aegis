import { BaseApiClient } from "./base";
import type { UserData, UserRole } from "@/types/api";

export class AuthApi extends BaseApiClient {
  async login(email: string, password: string) {
    try {
      // Use Better-Auth's built-in sign-in endpoint
      const response = await fetch(`${this.baseUrl}/api/auth/sign-in/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Better-Auth returns user and session directly
      return {
        data: { user: data.user, token: null },
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

  async register(
    email: string,
    password: string,
    name: string,
    damlParty: string,
    role: UserRole,
    image?: string
  ) {
    try {
      // Use Better-Auth's built-in sign-up endpoint
      const response = await fetch(`${this.baseUrl}/api/auth/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({
          email,
          password,
          name,
          damlParty,
          role,
          image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      return {
        data: { user: data.user, token: null },
        error: null,
        status: 201,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async createUser(
    email: string,
    password: string,
    name: string,
    damlParty: string,
    role: UserRole,
    image?: string,
    lenderProfile?: {
      categoryTier:
        | "Tier1Bank"
        | "RegionalBank"
        | "InvestmentFund"
        | "PrivateEquity"
        | "InsuranceCompany"
        | "PensionFund"
        | "SpecialtyLender";
      ratingTier?: "Premium" | "Standard" | "Basic";
      capacityTier?: "Large" | "Medium" | "Small";
      geographicScope?: "Global" | "Regional" | "Local";
    }
  ) {
    try {
      // Use admin endpoint that uses Better-Auth (doesn't auto-login)
      const response = await this.request<{ user: UserData }>(
        "/api/admin/users/create",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            name,
            damlParty,
            role,
            image,
            lenderProfile,
          }),
        }
      );

      return {
        data: { user: response.user },
        error: null,
        status: 201,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async logout() {
    try {
      // Use Better-Auth's built-in sign-out endpoint
      const response = await fetch(`${this.baseUrl}/api/auth/sign-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({}), // Send empty JSON object instead of no body
      });

      return { success: response.ok };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  async getCurrentUser() {
    try {
      // Use Better-Auth session endpoint
      const response = await this.request<{
        authenticated: boolean;
        user: UserData | null;
        session: Record<string, unknown> | null;
        error?: string;
      }>("/api/session");

      return {
        data: response.user,
        error: response.error || null,
        status: response.authenticated && response.user ? 200 : 404,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error),
        status: 500,
      };
    }
  }

  async listUsers(role?: UserRole) {
    try {
      const queryParams = role ? `?role=${role}` : "";
      const response = await this.request<{ data: UserData[] }>(
        `/api/auth/registered-users${queryParams}`
      );
      return {
        data: response.data || [],
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

  async listLenders() {
    try {
      const response = await this.request<{ data: UserData[] }>(
        "/api/auth/registered-users?role=lender"
      );
      return {
        data: response.data || [],
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

  async getAllParties() {
    try {
      const response = await this.request<{ parties: UserData[] }>(
        "/api/auth/parties"
      );
      return {
        data: response.parties || [],
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

  async regenerateBulkParties(userIds: string[], force: boolean = false) {
    try {
      const response = await this.request<{
        success: boolean;
        message: string;
        summary: {
          total: number;
          successful: number;
          failed: number;
          skipped: number;
        };
        results: {
          success: Array<{
            userId: string;
            oldParty: string | null;
            newParty: string;
          }>;
          failed: Array<{ userId: string; error: string }>;
          skipped: Array<{ userId: string; reason: string }>;
        };
      }>("/api/admin/users/regenerate-parties", {
        method: "POST",
        body: JSON.stringify({ userIds, force }),
      });

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

  async getPartyStatus() {
    try {
      const response = await this.request<{
        success: boolean;
        stats: {
          total: number;
          validParties: number;
          invalidParties: number;
          noParties: number;
          damlLedgerParties: number;
        };
        partyStatus: Array<{
          userId: string;
          name: string;
          email: string;
          role: string;
          damlParty: string | null;
          hasDbParty: boolean;
          existsInDaml: boolean;
          status: "valid" | "invalid" | "no_party";
        }>;
        message: string;
      }>("/api/admin/users/party-status");

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

  async deleteUser(userId: string) {
    try {
      const response = await this.request<{
        message: string;
        userId: string;
        duration: string;
      }>(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

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

  async deleteUserByParty(damlParty: string) {
    try {
      const response = await this.request<{
        message: string;
        damlParty: string;
        duration: string;
      }>(`/api/admin/users/party/${damlParty}`, {
        method: "DELETE",
      });

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

  async deleteNonAdminUsers() {
    try {
      const response = await this.request<{
        message: string;
        deletedCount: number;
        duration: string;
      }>("/api/admin/users/non-admin", {
        method: "DELETE",
      });

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

  async deleteAllUsers() {
    try {
      const response = await this.request<{
        message: string;
        deletedCount: number;
        duration: string;
        warning: string;
      }>("/api/admin/users/all", {
        method: "DELETE",
      });

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

  async updateUser(userId: string, updateData: any) {
    try {
      const response = await this.request<{
        message: string;
        user: UserData;
      }>(`/api/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

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
}

export const authApi = new AuthApi();
