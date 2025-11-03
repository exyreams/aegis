/**
 * Cache Service
 *
 * High-performance SQLite caching layer for DAML contract data with
 * analytics, search optimization, and automated cleanup for improved
 * API response times and system monitoring.
 */

import { db, rfqCache, bidCache, apiLogs } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { ConsoleLogger } from "../utils/logger";
import type { DamlContract, RFQData, BidData } from "./daml";

export class CacheService {
  static async cacheRFQ(contract: DamlContract<RFQData>) {
    try {
      const payload = contract.payload;
      const now = new Date();
      const expiresAt = new Date(payload.expiresAt);

      const primaryCollateral = payload.collateralAssets[0];
      const collateralAmount = primaryCollateral?.currentValue || 0;
      const collateralAsset = primaryCollateral?.assetType
        ? typeof primaryCollateral.assetType === "object" &&
          "value" in primaryCollateral.assetType
          ? primaryCollateral.assetType.value
          : "Unknown"
        : "Unknown";

      const rfqData = {
        contractId: contract.contractId,
        borrower: payload.borrower,
        loanAmount: parseFloat(payload.loanAmount),
        collateralAmount: collateralAmount,
        collateralAsset: collateralAsset as string,
        loanDurationDays: Math.floor(
          parseInt(payload.loanDuration.microseconds) / (24 * 60 * 60 * 1000000)
        ),
        status: (now > expiresAt ? "expired" : "active") as
          | "active"
          | "expired"
          | "completed"
          | "cancelled",
        createdAt: payload.createdAt,
        expiresAt: payload.expiresAt,
      };

      const existing = await db
        .select()
        .from(rfqCache)
        .where(eq(rfqCache.contractId, contract.contractId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(rfqCache)
          .set({ ...rfqData, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(rfqCache.contractId, contract.contractId));
      } else {
        await db.insert(rfqCache).values(rfqData);
      }

      ConsoleLogger.info("RFQ cached", { contractId: contract.contractId });
    } catch (error) {
      ConsoleLogger.error("Failed to cache RFQ", error);
    }
  }

  static async cacheRFQs(contracts: DamlContract<RFQData>[]) {
    for (const contract of contracts) {
      await this.cacheRFQ(contract);
    }
  }

  static async cacheBid(
    rfqContractId: string,
    bidContract: DamlContract<BidData>
  ) {
    try {
      const payload = bidContract.payload;

      const bidData = {
        contractId: bidContract.contractId,
        rfqContractId,
        lender: payload.lender,
        interestRate: parseFloat(payload.interestRate),
        additionalTerms: payload.additionalTerms || null,
        status: "pending" as "pending" | "accepted" | "rejected",
      };

      const existing = await db
        .select()
        .from(bidCache)
        .where(eq(bidCache.contractId, bidContract.contractId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(bidCache)
          .set(bidData)
          .where(eq(bidCache.contractId, bidContract.contractId));
      } else {
        await db.insert(bidCache).values(bidData);
      }

      ConsoleLogger.info("Bid cached", {
        contractId: bidContract.contractId,
        rfqContractId,
      });
    } catch (error) {
      ConsoleLogger.error("Failed to cache bid", error);
    }
  }

  static async getCachedRFQs(
    filters: {
      status?: string;
      borrower?: string;
      asset?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    try {
      const conditions = [];
      if (filters.status) {
        conditions.push(eq(rfqCache.status, filters.status as any));
      }
      if (filters.borrower) {
        conditions.push(
          sql`${rfqCache.borrower} LIKE ${"%" + filters.borrower + "%"}`
        );
      }
      if (filters.asset) {
        conditions.push(eq(rfqCache.collateralAsset, filters.asset));
      }

      const baseQuery = db.select().from(rfqCache);

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;
      const limit = filters.limit || undefined;
      const offset = filters.offset || 0;

      if (whereClause) {
        return await baseQuery
          .where(whereClause)
          .orderBy(desc(rfqCache.createdAt))
          .limit(limit || 1000)
          .offset(offset);
      } else {
        return await baseQuery
          .orderBy(desc(rfqCache.createdAt))
          .limit(limit || 1000)
          .offset(offset);
      }
    } catch (error) {
      ConsoleLogger.error("Failed to get cached RFQs", error);
      return [];
    }
  }

  static async getCachedRFQ(contractId: string) {
    try {
      const result = await db
        .select()
        .from(rfqCache)
        .where(eq(rfqCache.contractId, contractId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      ConsoleLogger.error("Failed to get cached RFQ", error);
      return null;
    }
  }

  static async getCachedBids(rfqContractId: string) {
    try {
      return await db
        .select()
        .from(bidCache)
        .where(eq(bidCache.rfqContractId, rfqContractId))
        .orderBy(desc(bidCache.createdAt));
    } catch (error) {
      ConsoleLogger.error("Failed to get cached bids", error);
      return [];
    }
  }

  static async updateRFQStatus(
    contractId: string,
    status: "active" | "expired" | "completed" | "cancelled"
  ) {
    try {
      await db
        .update(rfqCache)
        .set({ status, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(rfqCache.contractId, contractId));

      ConsoleLogger.info("RFQ status updated", { contractId, status });
    } catch (error) {
      ConsoleLogger.error("Failed to update RFQ status", error);
    }
  }

  static async updateBidStatus(
    contractId: string,
    status: "pending" | "accepted" | "rejected"
  ) {
    try {
      await db
        .update(bidCache)
        .set({ status })
        .where(eq(bidCache.contractId, contractId));

      ConsoleLogger.info("Bid status updated", { contractId, status });
    } catch (error) {
      ConsoleLogger.error("Failed to update bid status", error);
    }
  }

  static async logApiRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    userAgent?: string,
    ip?: string
  ) {
    try {
      await db.insert(apiLogs).values({
        method,
        endpoint,
        statusCode,
        duration,
        userAgent: userAgent?.slice(0, 255) || null,
        ip: ip?.slice(0, 45) || null,
      });
    } catch (error) {
      ConsoleLogger.error("Failed to log API request", error);
    }
  }

  static async getApiAnalytics(hours: number = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const stats = await db
        .select({
          totalRequests: sql<number>`COUNT(*)`,
          avgDuration: sql<number>`AVG(duration)`,
          errorRate: sql<number>`AVG(CASE WHEN status_code >= 400 THEN 1.0 ELSE 0.0 END) * 100`,
          successRate: sql<number>`AVG(CASE WHEN status_code < 400 THEN 1.0 ELSE 0.0 END) * 100`,
        })
        .from(apiLogs)
        .where(sql`timestamp > ${since}`)
        .limit(1);

      const topEndpoints = await db
        .select({
          endpoint: apiLogs.endpoint,
          count: sql<number>`COUNT(*)`,
        })
        .from(apiLogs)
        .where(sql`timestamp > ${since}`)
        .groupBy(apiLogs.endpoint)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10);

      return {
        period: `${hours} hours`,
        stats: stats[0] || null,
        topEndpoints,
      };
    } catch (error) {
      ConsoleLogger.error("Failed to get API analytics", error);
      return null;
    }
  }

  static async cleanupCache(daysOld: number = 30) {
    try {
      const cutoff = new Date(
        Date.now() - daysOld * 24 * 60 * 60 * 1000
      ).toISOString();

      await db.delete(rfqCache).where(sql`updated_at < ${cutoff}`);

      await db.delete(bidCache).where(sql`created_at < ${cutoff}`);

      await db.delete(apiLogs).where(sql`timestamp < ${cutoff}`);

      // Get counts after deletion for logging
      const remainingRFQs = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(rfqCache);
      const remainingBids = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(bidCache);
      const remainingLogs = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(apiLogs);

      ConsoleLogger.info("Cache cleanup completed", {
        remainingRFQs: remainingRFQs[0]?.count || 0,
        remainingBids: remainingBids[0]?.count || 0,
        remainingLogs: remainingLogs[0]?.count || 0,
      });

      return {
        message: "Cache cleanup completed successfully",
        remainingRFQs: remainingRFQs[0]?.count || 0,
        remainingBids: remainingBids[0]?.count || 0,
        remainingLogs: remainingLogs[0]?.count || 0,
      };
    } catch (error) {
      ConsoleLogger.error("Failed to cleanup cache", error);
      return null;
    }
  }
}
