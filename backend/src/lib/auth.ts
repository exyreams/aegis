/**
 * Better-Auth Configuration with DAML Integration
 *
 * Authentication setup with Drizzle adapter, JWT plugin for DAML tokens,
 * user management with custom fields, and session handling.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { db } from "../db";
import { user, session, account, verification, jwks } from "../db/schema";
import config from "../config/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: user,
      session: session,
      account: account,
      verification: verification,
      jwks: jwks,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    disableSessionRefresh: false,
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: false,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["email-password"],
      allowDifferentEmails: false,
    },
  },
  user: {
    additionalFields: {
      damlParty: {
        type: "string",
        required: false,
        unique: true,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "borrower",
      },
      image: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    jwt({
      jwt: {
        issuer: config.damlJwt.issuer,
        audience: config.damlJwt.audience,
        expirationTime: `${config.damlJwt.expiry}s`,
        definePayload: ({ user }) => {
          if (!user.damlParty) {
            throw new Error(
              `No DAML party assigned to user: ${user.name || user.email}`
            );
          }

          return {
            sub: user.damlParty,
            aud: config.damlJwt.audience,
            iss: config.damlJwt.issuer,
            "https://daml.com/ledger-api": {
              ledgerId: config.daml.ledgerId,
              applicationId: config.daml.applicationId,
              actAs: [user.damlParty],
              readAs: [user.damlParty],
              admin: false,
            },
            scope: "daml:read daml:write",
            uid: user.id,
            role: user.role,
          };
        },
      },
      jwks: {
        keyPairConfig: {
          alg: "EdDSA",
          crv: "Ed25519",
        },
      },
    }),
  ],
  rateLimit: {
    window: 60,
    max: 50, // Increased from 10 to 50 to allow more login attempts
  },
  trustedOrigins: ["http://localhost:8000", "http://localhost:3000"],
  secret: config.auth.secret,
  baseURL: config.auth.baseURL,
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    cookiePrefix: "better-auth",
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
