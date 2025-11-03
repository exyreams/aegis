/**
 * Request Logging and Monitoring Middleware
 *
 * Comprehensive logging system with request tracking, audit trails,
 * security monitoring, and performance analysis for API endpoints.
 */

import type { Context, Next } from "hono";
import { ConsoleLogger } from "../utils/logger";
import { CacheService } from "../services/cache";
import { getClientIP, getIPForLogging } from "../utils/ip";

export interface LoggingContext {
  Variables: {
    requestId: string;
    startTime: number;
    user: any;
    session: any;
  };
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
export const requestLoggingMiddleware = async (
  c: Context<LoggingContext>,
  next: Next
) => {
  const requestId = generateRequestId();
  const startTime = Date.now();

  c.set("requestId", requestId);
  c.set("startTime", startTime);

  const method = c.req.method;
  const path = c.req.path;
  const userAgent = c.req.header("user-agent");
  const ip = getClientIP(c);
  const ipForLogging = getIPForLogging(c);
  const contentType = c.req.header("content-type");

  const skipDebugLogging =
    path.includes("/health") || path.includes("/api/session");

  if (!skipDebugLogging) {
    console.log("Request started", {
      requestId,
      method,
      path,
      ip: ipForLogging,
      userAgent: userAgent?.slice(0, 100),
      contentType,
    });
    console.log();
  }

  try {
    await next();

    const duration = Date.now() - startTime;
    const status = c.res.status;
    const responseSize = c.res.headers.get("content-length");

    const skipLogging =
      path.includes("/health") || path.includes("/api/session");

    if (!skipLogging) {
      ConsoleLogger.request(method, path, status, duration);
      CacheService.logApiRequest(method, path, status, duration, userAgent, ip);
    }

    if (!skipLogging) {
      console.log("Request completed", {
        requestId,
        method,
        path,
        status,
        duration,
        responseSize,
        ip: ipForLogging,
      });
      console.log();
    }

    const slowRequestThreshold = parseInt(
      process.env.SLOW_REQUEST_THRESHOLD_MS || "5000"
    );
    if (duration > slowRequestThreshold) {
      ConsoleLogger.warning("Slow request detected", {
        requestId,
        method,
        path,
        duration,
        status,
        threshold: slowRequestThreshold,
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;

    ConsoleLogger.error("Request failed", {
      requestId,
      method,
      path,
      duration,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    CacheService.logApiRequest(method, path, 500, duration, userAgent, ip);

    throw error;
  }
};

export const auditLoggingMiddleware = (action: string) => {
  return async (c: Context<LoggingContext>, next: Next) => {
    const user = c.get("user");
    const requestId = c.get("requestId");
    const method = c.req.method;
    const path = c.req.path;
    const ip = getIPForLogging(c);

    const damlParty = user?.damlParty || "anonymous";
    const userRole = user?.role || "unknown";

    ConsoleLogger.audit(action, damlParty, {
      requestId,
      method,
      path,
      ip,
      userRole,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    });

    try {
      await next();

      ConsoleLogger.audit(`${action} - SUCCESS`, damlParty, {
        requestId,
        status: c.res.status,
        duration: Date.now() - (c.get("startTime") || Date.now()),
      });
    } catch (error) {
      ConsoleLogger.audit(`${action} - FAILED`, damlParty, {
        requestId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack:
          error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      });

      throw error;
    }
  };
};

export const securityLoggingMiddleware = async (
  c: Context<LoggingContext>,
  next: Next
) => {
  const ip =
    c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
  const userAgent = c.req.header("user-agent");
  const method = c.req.method;
  const path = c.req.path;
  const requestId = c.get("requestId");

  const suspiciousPatterns = [
    /\.\./,
    /<script/i,
    /union.*select/i,
    /javascript:/i,
    /eval\(/i,
  ];

  const fullUrl = c.req.url;
  const isSuspicious = suspiciousPatterns.some((pattern) =>
    pattern.test(fullUrl)
  );

  if (isSuspicious) {
    ConsoleLogger.security("Suspicious request detected", {
      requestId,
      method,
      path,
      fullUrl,
      ip,
      userAgent: userAgent?.slice(0, 200),
    });
  }

  const authHeader = c.req.header("authorization");
  const sessionCookie = c.req
    .header("cookie")
    ?.includes("better-auth.session_token");
  const user = c.get("user");

  const isProtectedRoute =
    path.startsWith("/api/") &&
    !path.includes("/health") &&
    !path.includes("/info") &&
    !path.includes("/auth/sign-in") &&
    !path.includes("/auth/sign-up") &&
    !path.includes("/session");

  if (isProtectedRoute && !authHeader && !sessionCookie && !user) {
    ConsoleLogger.security("Unauthenticated API access attempt", {
      requestId,
      method,
      path,
      ip,
      userAgent: userAgent?.slice(0, 100),
    });
  }

  await next();
};

export const performanceLoggingMiddleware = async (
  c: Context<LoggingContext>,
  next: Next
) => {
  const startTime = c.get("startTime") || Date.now();
  const requestId = c.get("requestId");

  const memBefore = process.memoryUsage();

  await next();

  const duration = Date.now() - startTime;
  const memAfter = process.memoryUsage();

  const performanceThreshold = parseInt(
    process.env.PERFORMANCE_THRESHOLD_MS || "3000"
  );
  if (duration > performanceThreshold) {
    ConsoleLogger.warning("Performance issue detected", {
      requestId,
      method: c.req.method,
      path: c.req.path,
      duration,
      threshold: performanceThreshold,
      memoryDelta: {
        rss: Math.round((memAfter.rss - memBefore.rss) / 1024 / 1024),
        heapUsed: Math.round(
          (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024
        ),
        heapTotal: Math.round(
          (memAfter.heapTotal - memBefore.heapTotal) / 1024 / 1024
        ),
      },
      status: c.res.status,
    });
  }
};
