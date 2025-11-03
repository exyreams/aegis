/**
 * Environment Configuration and Validation
 *
 * Validates and exports environment variables using Zod schemas.
 * Contains server settings, DAML configuration, database URLs, authentication,
 * business rules, logging, and performance monitoring settings.
 */

import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Environment validation schema
const envSchema = z.object({
  // Server
  PORT: z.string().default("8000").transform(Number),
  NODE_ENV: z.enum(["development", "production"]).default("development"),

  // DAML
  DAML_JSON_API_URL: z.url().default("http://localhost:7575"),
  DAML_LEDGER_ID: z.string().default("sandbox"),
  DAML_APPLICATION_ID: z.string().default("aegis-rfq"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Better-Auth
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.url().default("http://localhost:8000"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://localhost:3001"),
  RATE_LIMIT_WINDOW_MS: z.string().default("900000").transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100").transform(Number),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FILE: z.string().default("./logs/aegis.log"),
  ENABLE_AUDIT_LOGGING: z
    .string()
    .default("true")
    .transform((val) => val === "true"),
  ENABLE_SECURITY_LOGGING: z
    .string()
    .default("true")
    .transform((val) => val === "true"),

  // Business Rules
  MIN_COLLATERAL_RATIO: z.string().default("1.2").transform(Number),
  MAX_INTEREST_RATE: z.string().default("0.25").transform(Number),
  DEFAULT_RFQ_EXPIRY_DAYS: z.string().default("7").transform(Number),
  MAX_LOAN_DURATION_DAYS: z.string().default("365").transform(Number),
  // SUPPORTED_ASSETS moved to DAML config for comprehensive asset list

  // DAML Template IDs (optional - can be set from DAML compilation)
  DAML_TEMPLATE_RFQ: z.string().optional(),
  DAML_TEMPLATE_BID: z.string().optional(),
  DAML_TEMPLATE_LOAN: z.string().optional(),
  DAML_TEMPLATE_LOAN_PROPOSAL: z.string().optional(),

  // Performance & Monitoring
  ENABLE_METRICS: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  ENABLE_TRACING: z
    .string()
    .default("false")
    .transform((val) => val === "true"),

  // Application
  APP_VERSION: z.string().default("1.0.0"),

  // DAML JWT Configuration
  DAML_JWT_SECRET: z
    .string()
    .min(32, "DAML_JWT_SECRET must be at least 32 characters"),
  DAML_JWT_ISSUER: z.string().default("aegis-rfq"),
  DAML_JWT_AUDIENCE: z.string().default("daml-ledger"),
  DAML_JWT_EXPIRY: z.string().default("86400").transform(Number), // 24 hours in seconds

  // Performance Monitoring
  SLOW_REQUEST_THRESHOLD_MS: z.string().default("5000").transform(Number),
  PERFORMANCE_THRESHOLD_MS: z.string().default("1000").transform(Number),
});

// Validate and export environment
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
  console.log("Environment configuration validated");
} catch (error) {
  console.error("Environment validation failed:", error);
  process.exit(1);
}

// Derived configurations
export const config = {
  server: {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === "development",
    isProduction: env.NODE_ENV === "production",
  },

  daml: {
    jsonApiUrl: env.DAML_JSON_API_URL,
    ledgerId: env.DAML_LEDGER_ID,
    applicationId: env.DAML_APPLICATION_ID,
  },

  database: {
    url: env.DATABASE_URL,
  },

  auth: {
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
  },

  security: {
    corsOrigins: env.CORS_ORIGINS.split(",").map((origin) => origin.trim()),
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },
  },

  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
    enableAudit: env.ENABLE_AUDIT_LOGGING,
    enableSecurity: env.ENABLE_SECURITY_LOGGING,
  },

  business: {
    minCollateralRatio: env.MIN_COLLATERAL_RATIO,
    maxInterestRate: env.MAX_INTEREST_RATE,
    defaultRFQExpiryDays: env.DEFAULT_RFQ_EXPIRY_DAYS,
    maxLoanDurationDays: env.MAX_LOAN_DURATION_DAYS,
    // supportedAssets moved to DAML config - use DAML_CONFIG.business.supportedAssets
  },

  performance: {
    slowRequestThreshold: env.SLOW_REQUEST_THRESHOLD_MS,
    performanceThreshold: env.PERFORMANCE_THRESHOLD_MS,
  },

  app: {
    version: env.APP_VERSION,
  },

  damlJwt: {
    secret: env.DAML_JWT_SECRET,
    issuer: env.DAML_JWT_ISSUER,
    audience: env.DAML_JWT_AUDIENCE,
    expiry: env.DAML_JWT_EXPIRY,
  },
};

export default config;
