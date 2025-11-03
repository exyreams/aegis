/**
 * DAML Token Management
 *
 * JWT token generation and validation for DAML ledger authentication including
 * party-based authorization, claim management, token conversion utilities,
 * and secure credential handling for Canton Network integration.
 */

import jwt from "jsonwebtoken";
import config from "../config/env";
import { ConsoleLogger } from "./logger";

interface DamlJWTPayload {
  sub: string;
  aud: string;
  iss: string;
  exp: number;
  iat: number;

  "https://daml.com/ledger-api": {
    ledgerId: string;
    applicationId: string;
    actAs: string[];
    readAs: string[];
    admin?: boolean;
  };

  scope?: string;
}

export function convertAppTokenToDamlToken(
  authToken: string,
  user?: any
): string | null {
  if (!authToken || authToken === "system") {
    return null;
  }

  try {
    const damlParty = user?.damlParty;

    if (!damlParty) {
      ConsoleLogger.warning(
        "No DAML party found in user context, cannot generate token",
        { authToken: authToken.substring(0, 20) + "..." }
      );
      return null;
    }

    return generateDamlToken(damlParty, {
      scope: "daml:read daml:write",
      expiresIn: config.damlJwt.expiry.toString(),
    });
  } catch (error) {
    ConsoleLogger.error("Failed to convert app token to DAML token", error);
    return null;
  }
}

export function generateDamlToken(
  party: string,
  options: {
    expiresIn?: string | number;
    scope?: string;
    admin?: boolean;
  } = {}
): string {
  const now = Math.floor(Date.now() / 1000);
  const expiry =
    now +
    (options.expiresIn
      ? typeof options.expiresIn === "string"
        ? parseInt(options.expiresIn)
        : options.expiresIn
      : config.damlJwt.expiry);

  const payload: DamlJWTPayload = {
    sub: party,
    aud: config.damlJwt.audience,
    iss: config.damlJwt.issuer,
    iat: now,
    exp: expiry,

    "https://daml.com/ledger-api": {
      ledgerId: config.daml.ledgerId,
      applicationId: config.daml.applicationId,
      actAs: [party],
      readAs: [party],
      admin: options.admin || false,
    },

    scope: options.scope || "daml:read daml:write",
  };

  const damlSecret = config.damlJwt.secret;

  return jwt.sign(payload, damlSecret, {
    algorithm: "HS256",
  });
}

export function createSystemToken(): string {
  return generateDamlToken("System", {
    scope: "daml:read daml:write daml:admin",
    admin: true,
    expiresIn: config.damlJwt.expiry.toString(),
  });
}

export function generatePartyToken(party: string): string {
  return generateDamlToken(party, {
    scope: "daml:read daml:write",
    expiresIn: config.damlJwt.expiry.toString(),
  });
}

export function validateDamlToken(token: string): DamlJWTPayload | null {
  try {
    const decoded = jwt.verify(token, config.damlJwt.secret) as DamlJWTPayload;

    if (!decoded["https://daml.com/ledger-api"]) {
      ConsoleLogger.warning("Token missing DAML ledger-api claims", {
        sub: decoded.sub,
      });
      return null;
    }

    return decoded;
  } catch (error) {
    ConsoleLogger.error("Failed to validate DAML token", error);
    return null;
  }
}
