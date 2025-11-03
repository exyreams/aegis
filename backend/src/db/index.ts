/**
 * Database Connection and Services
 *
 * Drizzle ORM setup with PostgreSQL, database utilities, health checks,
 * statistics, and Row Level Security (RLS) management for user context.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { ConsoleLogger } from "../utils/logger";
import config from "../config/env";

const connectionString = config.database.url;
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

export class DatabaseService {
  static async initialize() {
    try {
      ConsoleLogger.info("Initializing database...");
      await this.seedDefaultSettings();
      ConsoleLogger.success("Database initialized successfully", {
        url: connectionString.replace(/:\/\/[^:]+:[^@]+@/, "://***:***@"),
      });
    } catch (error) {
      ConsoleLogger.error("Database initialization failed", error);
      throw error;
    }
  }

  static async seedDefaultSettings() {
    ConsoleLogger.info("Configuration loaded from environment variables");
  }

  static async healthCheck() {
    try {
      const result = await db.execute(sql`SELECT 1 as test`);
      return { healthy: true, result };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async getStats() {
    try {
      const userCount = (await db.select().from(schema.user)).length;
      const rfqCount = (await db.select().from(schema.rfqCache)).length;
      const bidCount = (await db.select().from(schema.bidCache)).length;
      const logCount = (await db.select().from(schema.apiLogs)).length;
      const sessionCount = (await db.select().from(schema.session)).length;

      return {
        user_count: userCount,
        session_count: sessionCount,
        rfq_count: rfqCount,
        bid_count: bidCount,
        log_count: logCount,
        database_url: connectionString.replace(
          /:\/\/[^:]+:[^@]+@/,
          "://***:***@"
        ),
      };
    } catch (error) {
      ConsoleLogger.error("Failed to get database stats", error);
      return null;
    }
  }
}

export class RLSService {
  static async setUserContext(userId: string, damlParty?: string) {
    try {
      await db.execute(sql`SET LOCAL app.current_user_id = ${userId}`);
      if (damlParty) {
        await db.execute(sql`SET LOCAL app.current_user_party = ${damlParty}`);
      }
    } catch (error) {
      ConsoleLogger.error("Failed to set RLS user context", error);
    }
  }

  static async clearUserContext() {
    try {
      await db.execute(sql`SET LOCAL app.current_user_id = ''`);
      await db.execute(sql`SET LOCAL app.current_user_party = ''`);
    } catch (error) {
      ConsoleLogger.error("Failed to clear RLS user context", error);
    }
  }
}

export * from "./schema";
