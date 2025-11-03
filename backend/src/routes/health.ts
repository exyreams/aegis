/**
 * Health Check Routes
 *
 * System health monitoring with DAML ledger connectivity,
 * database status, and service availability checks.
 */

import { Hono } from "hono";
import { DamlService } from "../services/daml";
import { DatabaseService } from "../db";
import { ConsoleLogger } from "../utils/logger";

const health = new Hono();
const damlService = DamlService.getInstance();
health.get("/", async (c) => {
  const startTime = Date.now();

  try {
    const damlHealth = await damlService.healthCheck();
    const dbHealth = await DatabaseService.healthCheck();
    const dbStats = await DatabaseService.getStats();
    const duration = Date.now() - startTime;

    const allHealthy = damlHealth.healthy && dbHealth.healthy;
    const status = allHealthy ? 200 : 503;

    const response = {
      status: allHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        backend: "healthy",
        daml: damlHealth.healthy ? "healthy" : "unhealthy",
        database: dbHealth.healthy ? "healthy" : "unhealthy",
      },
      details: {
        daml: damlHealth.details,
        database: dbHealth,
        stats: dbStats,
      },
      uptime: process.uptime(),
      duration: `${duration}ms`,
    };

    ConsoleLogger.request("GET", "/health", status, duration);

    if (allHealthy) {
      ConsoleLogger.success("Health check passed - All services healthy");
    } else {
      ConsoleLogger.error("Health check failed", {
        daml: damlHealth.healthy ? "OK" : "FAIL",
        database: dbHealth.healthy ? "OK" : "FAIL",
      });
    }

    return c.json(response, status);
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Health check error", error);
    ConsoleLogger.request("GET", "/health", 500, duration);

    return c.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
      },
      500
    );
  }
});

export { health };
