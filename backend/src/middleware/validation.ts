/**
 * Request Validation Middleware
 *
 * Zod schemas and validation middleware for API endpoints.
 * Includes RFQ creation, bid submission, DAML operations, and business rule validation.
 */

import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { ConsoleLogger } from "../utils/logger";
import config from "../config/env";
import { DAML_CONFIG } from "../config/daml";
export const createRFQSchema = z.object({
  borrower: z.string().min(1, "Borrower is required"),
  loanAmount: z.number().positive("Loan amount must be positive"),
  collateralAmount: z.number().positive("Collateral amount must be positive"),
  collateralAsset: z.enum(
    DAML_CONFIG.business.supportedAssets as [string, ...string[]],
    {
      message: `Supported assets: ${DAML_CONFIG.business.supportedAssets.join(
        ", "
      )}`,
    }
  ),
  loanDurationDays: z
    .number()
    .int()
    .min(1)
    .max(365, "Loan duration must be between 1-365 days"),
  approvedLenders: z
    .array(z.string().min(1))
    .min(1, "At least one approved lender required"),
});

export const submitBidSchema = z.object({
  lender: z.string().min(1, "Lender is required"),
  interestRate: z
    .number()
    .min(0)
    .max(
      config.business.maxInterestRate * 100,
      `Interest rate cannot exceed ${(
        config.business.maxInterestRate * 100
      ).toFixed(1)}%`
    ),
  paymentFrequency: z.enum(
    ["Monthly", "Quarterly", "SemiAnnual", "Annual", "Bullet"],
    {
      message: "Payment frequency is required",
    }
  ),
  additionalTerms: z.string().optional(),
});

export const acceptBidSchema = z.object({
  bidContractId: z.string().min(1, "Bid contract ID is required"),
});

export const queryParamsSchema = z.object({
  status: z.enum(["active", "expired", "completed", "cancelled"]).optional(),
  borrower: z.string().optional(),
  asset: z.string().optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val) || 50)
    .pipe(z.number().min(1).max(100)),
  offset: z
    .string()
    .transform((val) => parseInt(val) || 0)
    .pipe(z.number().min(0)),
});

export const damlCreateSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  payload: z.record(z.string(), z.any()),
  meta: z
    .object({
      requestId: z.string().optional(),
      timeout: z.number().optional(),
    })
    .optional(),
});

export const damlQuerySchema = z.object({
  templateIds: z
    .array(z.string().min(1))
    .min(1, "At least one template ID required"),
  query: z.record(z.string(), z.any()).optional(),
  meta: z
    .object({
      requestId: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    })
    .optional(),
});

export const damlExerciseSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  contractId: z.string().min(1, "Contract ID is required"),
  choice: z.string().min(1, "Choice is required"),
  argument: z.record(z.string(), z.any()),
  meta: z
    .object({
      requestId: z.string().optional(),
      timeout: z.number().optional(),
    })
    .optional(),
});

export const validateJson = (schema: z.ZodSchema) => {
  return zValidator("json", schema, (result, c) => {
    if (!result.success) {
      ConsoleLogger.warning("Validation failed", {
        path: c.req.path,
        method: c.req.method,
        errors: result.error.issues,
      });

      return c.json(
        {
          error: "Validation Error",
          message: "Invalid request data",
          details: result.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
        },
        400
      );
    }
  });
};

export const validateQuery = (schema: z.ZodSchema) => {
  return zValidator("query", schema, (result, c) => {
    if (!result.success) {
      ConsoleLogger.warning("Query validation failed", {
        path: c.req.path,
        method: c.req.method,
        errors: result.error.issues,
      });

      return c.json(
        {
          error: "Validation Error",
          message: "Invalid query parameters",
          details: result.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
        },
        400
      );
    }
  });
};

export const validateBusinessRules = (data: any) => {
  const errors: string[] = [];

  if (data.loanAmount && data.collateralAmount) {
    const collateralRatio = data.collateralAmount / data.loanAmount;
    if (collateralRatio < config.business.minCollateralRatio) {
      errors.push(
        `Collateral ratio ${collateralRatio.toFixed(2)} is below minimum ${
          config.business.minCollateralRatio
        }`
      );
    }
  }

  if (data.interestRate) {
    const rate =
      typeof data.interestRate === "string"
        ? parseFloat(data.interestRate)
        : data.interestRate;
    if (rate > config.business.maxInterestRate) {
      errors.push(
        `Interest rate ${(rate * 100).toFixed(2)}% exceeds maximum ${(
          config.business.maxInterestRate * 100
        ).toFixed(1)}%`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
