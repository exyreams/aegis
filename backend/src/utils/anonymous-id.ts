/**
 * Anonymous ID Generator
 *
 * Privacy-preserving identifier generation system for lender anonymization
 * with sequential numbering, category-based prefixes, and collision detection
 * to maintain confidentiality in institutional lending workflows.
 */

import { db } from "../db";
import { user } from "../db/schema";
import { eq, like } from "drizzle-orm";

export function generateAnonymousId(
  categoryTier:
    | "Tier1Bank"
    | "RegionalBank"
    | "InvestmentFund"
    | "PrivateEquity"
    | "InsuranceCompany"
    | "PensionFund"
    | "SpecialtyLender"
): string {
  const prefixes = {
    Tier1Bank: "AEGIS-INST-T1",
    RegionalBank: "AEGIS-REGNL",
    InvestmentFund: "AEGIS-INVST-FUND",
    PrivateEquity: "AEGIS-PRIV-EQ",
    InsuranceCompany: "AEGIS-INSUR",
    PensionFund: "AEGIS-PENS-FUND",
    SpecialtyLender: "AEGIS-SPEC",
  };

  const prefix = prefixes[categoryTier];
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `${prefix}-${randomSuffix}`;
}

export async function generateUniqueAnonymousId(
  categoryTier:
    | "Tier1Bank"
    | "RegionalBank"
    | "InvestmentFund"
    | "PrivateEquity"
    | "InsuranceCompany"
    | "PensionFund"
    | "SpecialtyLender"
): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const anonymousId = generateAnonymousId(categoryTier);

    const existing = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.lenderAnonymousId, anonymousId))
      .limit(1);

    if (existing.length === 0) {
      return anonymousId;
    }

    attempts++;
  }

  // Fallback with timestamp if all attempts failed
  const timestamp = Date.now().toString().slice(-6);
  const prefixes = {
    Tier1Bank: "AEGIS-INST-T1",
    RegionalBank: "AEGIS-REGNL",
    InvestmentFund: "AEGIS-INVST-FUND",
    PrivateEquity: "AEGIS-PRIV-EQ",
    InsuranceCompany: "AEGIS-INSUR",
    PensionFund: "AEGIS-PENS-FUND",
    SpecialtyLender: "AEGIS-SPEC",
  };

  return `${prefixes[categoryTier]}-${timestamp}`;
}

export async function generateSequentialAnonymousId(
  categoryTier:
    | "Tier1Bank"
    | "RegionalBank"
    | "InvestmentFund"
    | "PrivateEquity"
    | "InsuranceCompany"
    | "PensionFund"
    | "SpecialtyLender"
    | "undefined" = "undefined"
): Promise<string> {
  const prefixes = {
    Tier1Bank: "AEGIS-INST-T1",
    RegionalBank: "AEGIS-REGNL",
    InvestmentFund: "AEGIS-INVST-FUND",
    PrivateEquity: "AEGIS-PRIV-EQ",
    InsuranceCompany: "AEGIS-INSUR",
    PensionFund: "AEGIS-PENS-FUND",
    SpecialtyLender: "AEGIS-SPEC",
    undefined: "undefined", // For new lender signups without category
  };

  const prefix = prefixes[categoryTier];

  // Find existing IDs with the same prefix
  const existing = await db
    .select({ anonymousId: user.lenderAnonymousId })
    .from(user)
    .where(like(user.lenderAnonymousId, `${prefix}-%`));

  let maxNumber = 0;

  for (const record of existing) {
    if (record.anonymousId) {
      // Escape special regex characters in prefix
      const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = record.anonymousId.match(
        new RegExp(`^${escapedPrefix}-(\\d+)$`)
      );
      if (match) {
        const number = parseInt(match[1], 10);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    }
  }

  const nextNumber = maxNumber + 1;
  return `${prefix}-${nextNumber.toString().padStart(3, "0")}`;
}

export function parseAnonymousId(
  anonymousId: string
): { category: string; identifier: string } | null {
  // Updated patterns for new ID format
  const patterns = [
    { regex: /^AEGIS-INST-T1-(\d+)$/, category: "Tier1Bank" },
    { regex: /^AEGIS-REGNL-(\d+)$/, category: "RegionalBank" },
    { regex: /^AEGIS-INVST-FUND-(\d+)$/, category: "InvestmentFund" },
    { regex: /^AEGIS-PRIV-EQ-(\d+)$/, category: "PrivateEquity" },
    { regex: /^AEGIS-INSUR-(\d+)$/, category: "InsuranceCompany" },
    { regex: /^AEGIS-PENS-FUND-(\d+)$/, category: "PensionFund" },
    { regex: /^AEGIS-SPEC-(\d+)$/, category: "SpecialtyLender" },
    { regex: /^undefined-(\d+)$/, category: "undefined" },
  ];

  for (const pattern of patterns) {
    const match = anonymousId.match(pattern.regex);
    if (match) {
      return {
        category: pattern.category,
        identifier: match[1],
      };
    }
  }

  return null;
}
