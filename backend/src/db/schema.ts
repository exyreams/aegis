/**
 * Database Schema Definitions
 *
 * Drizzle ORM schema for PostgreSQL with Better-Auth integration.
 * Includes user management, sessions, DAML caching tables, analytics,
 * and privacy-preserving lender profiles.
 */

import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
  damlParty: text("daml_party").unique(),
  role: text("role").default("borrower").notNull(),

  // Privacy-preserving lender profile fields
  lenderCategoryTier: text("lender_category_tier"),
  lenderRatingTier: text("lender_rating_tier"),
  lenderCapacityTier: text("lender_capacity_tier"),
  lenderGeographicScope: text("lender_geographic_scope"),
  lenderAnonymousId: text("lender_anonymous_id").unique(),

  // Private lender information (internal use only)
  lenderInternalCategory: text("lender_internal_category"),
  lenderInternalRating: text("lender_internal_rating"),
  lenderInternalCapacity: real("lender_internal_capacity"),
  lenderInternalAvailableCapacity: real("lender_internal_available_capacity"),
  activeLoans: integer("active_loans").default(0),
  defaultRate: real("default_rate").default(0.01),
  averageInterestRate: real("average_interest_rate"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const users = user;
export const sessions = session;
export const accounts = account;
export const verifications = verification;
export const rfqCache = pgTable("rfq_cache", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  contractId: text("contract_id").notNull().unique(),
  borrower: text("borrower").notNull(),
  loanAmount: real("loan_amount").notNull(),
  collateralAmount: real("collateral_amount").notNull(),
  collateralAsset: text("collateral_asset").notNull(),
  loanDurationDays: integer("loan_duration_days").notNull(),
  interestRate: real("interest_rate"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const bidCache = pgTable("bid_cache", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  contractId: text("contract_id").notNull(),
  rfqContractId: text("rfq_contract_id").notNull(),
  lender: text("lender").notNull(),
  interestRate: real("interest_rate").notNull(),
  additionalTerms: text("additional_terms"),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const apiLogs = pgTable("api_logs", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  method: text("method").notNull(),
  endpoint: text("endpoint").notNull(),
  statusCode: integer("status_code").notNull(),
  duration: integer("duration").notNull(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`),
});

export const creditProfileCache = pgTable("credit_profile_cache", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  contractId: text("contract_id").notNull().unique(),
  party: text("party").notNull(),
  profileId: text("profile_id").notNull(),
  creditScore: integer("credit_score").notNull(),
  riskRating: text("risk_rating").notNull(),
  totalBorrowed: real("total_borrowed").notNull(),
  totalRepaid: real("total_repaid").notNull(),
  currentOutstanding: real("current_outstanding").notNull(),
  numberOfLoans: integer("number_of_loans").notNull(),
  numberOfDefaults: integer("number_of_defaults").notNull(),
  numberOfLatePayments: integer("number_of_late_payments").notNull(),
  lastUpdated: text("last_updated").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const riskAssessmentCache = pgTable("risk_assessment_cache", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  contractId: text("contract_id").notNull().unique(),
  assessmentId: text("assessment_id").notNull(),
  borrower: text("borrower").notNull(),
  lender: text("lender").notNull(),
  loanAmount: real("loan_amount").notNull(),
  recommendedRate: real("recommended_rate").notNull(),
  riskAdjustedRate: real("risk_adjusted_rate").notNull(),
  approvalRecommendation: text("approval_recommendation").notNull(),
  assessmentDate: text("assessment_date").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const collateralPoolCache = pgTable("collateral_pool_cache", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  contractId: text("contract_id").notNull().unique(),
  poolId: text("pool_id").notNull(),
  borrower: text("borrower").notNull(),
  lender: text("lender").notNull(),
  loanId: text("loan_id").notNull(),
  totalInitialValue: real("total_initial_value").notNull(),
  totalCurrentValue: real("total_current_value").notNull(),
  loanAmount: real("loan_amount").notNull(),
  currentLTV: real("current_ltv").notNull(),
  status: text("status").notNull(),
  marginCallActive: boolean("margin_call_active").notNull().default(false),
  lastValuationTime: text("last_valuation_time").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const platformAnalytics = pgTable("platform_analytics", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  date: text("date").notNull().unique(),
  totalRFQs: integer("total_rfqs").notNull().default(0),
  totalBids: integer("total_bids").notNull().default(0),
  totalLoans: integer("total_loans").notNull().default(0),
  totalVolume: real("total_volume").notNull().default(0),
  totalCollateral: real("total_collateral").notNull().default(0),
  totalYieldGenerated: real("total_yield_generated").notNull().default(0),
  activeUsers: integer("active_users").notNull().default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
