/**
 * DAML Party ID Management
 *
 * DAML party creation and management utilities for Canton Network integration
 * including party allocation, identifier generation, and participant management
 * for secure multi-party contract execution in institutional lending workflows.
 */

import { ConsoleLogger } from "./logger";

interface PartyInfo {
  identifier: string;
  displayName?: string;
  isLocal: boolean;
}

interface CreatePartyRequest {
  identifierHint: string;
  displayName: string;
}

export class PartyManager {
  private static async makePartyRequest(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    body?: any
  ) {
    const jwt = require("jsonwebtoken");
    const secret = "bCP2hYALl8nchJ3Iof6aC7UgHTx8OWMl";
    const payload = {
      aud: "daml-ledger",
      iss: "aegis-rfq",
      sub: "PartyManager",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const adminToken = jwt.sign(payload, secret, { algorithm: "HS256" });

    const response = await fetch(`http://localhost:7575/v1/${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(
        `Party API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  static async getAllParties(): Promise<PartyInfo[]> {
    try {
      const response = await this.makePartyRequest("parties");
      return response.result || [];
    } catch (error) {
      ConsoleLogger.error("Failed to get parties", error);
      return [];
    }
  }

  static async createParty(
    request: CreatePartyRequest
  ): Promise<PartyInfo | null> {
    try {
      const response = await this.makePartyRequest("parties/allocate", "POST", {
        identifierHint: request.identifierHint,
        displayName: request.displayName,
      });

      if (response.result) {
        ConsoleLogger.success(`Created party: ${request.displayName}`, {
          identifier: response.result.identifier,
          displayName: response.result.displayName,
        });
        return response.result;
      }

      return null;
    } catch (error) {
      ConsoleLogger.error(
        `Failed to create party: ${request.displayName}`,
        error
      );
      return null;
    }
  }

  static async findPartyByName(displayName: string): Promise<PartyInfo | null> {
    const parties = await this.getAllParties();
    return parties.find((party) => party.displayName === displayName) || null;
  }

  static async getOrCreateUserParty(
    userEmail: string,
    userName: string,
    role: string
  ): Promise<string | null> {
    try {
      const displayName = `${userName} (${role})`;
      const identifierHint = userEmail
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();

      let party = await this.findPartyByName(displayName);

      if (!party) {
        party = await this.createParty({
          identifierHint,
          displayName,
        });
      }

      return party?.identifier || null;
    } catch (error) {
      ConsoleLogger.error("Failed to get or create user party", error);
      return null;
    }
  }
}
