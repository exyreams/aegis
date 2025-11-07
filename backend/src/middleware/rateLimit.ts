/**
 * Rate Limiting Middleware
 *
 * In-memory rate limiting with configurable windows and thresholds.
 * Provides global and strict rate limiters for different endpoint types.
 */

import type { Context, Next } from "hono";
import { ConsoleLogger } from "../utils/logger";
import config from "../config/env";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getKey(c: Context): string {
    // Get real IP from headers (set by reverse proxy)
    const forwardedFor = c.req.header("x-forwarded-for");
    const realIp = c.req.header("x-real-ip");

    // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2)
    // Take the first one which is the real client IP
    const ip = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : realIp || "unknown";

    const userAgent = c.req.header("user-agent") || "unknown";
    return `${ip}:${userAgent.slice(0, 50)}`;
  }

  check(c: Context): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const key = this.getKey(c);
    const now = Date.now();

    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: this.store[key].resetTime,
      };
    }

    this.store[key].count++;

    const remaining = Math.max(0, this.maxRequests - this.store[key].count);
    const allowed = this.store[key].count <= this.maxRequests;

    return {
      allowed,
      remaining,
      resetTime: this.store[key].resetTime,
    };
  }
}

const globalLimiter = new RateLimiter(
  config.security.rateLimit.windowMs,
  config.security.rateLimit.maxRequests
);

const strictLimiter = new RateLimiter(
  config.security.rateLimit.windowMs,
  Math.floor(config.security.rateLimit.maxRequests / 4)
);

export const rateLimitMiddleware = (limiter: RateLimiter = globalLimiter) => {
  return async (c: Context, next: Next) => {
    const result = limiter.check(c);

    c.header(
      "X-RateLimit-Limit",
      config.security.rateLimit.maxRequests.toString()
    );
    c.header("X-RateLimit-Remaining", result.remaining.toString());
    c.header("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      // Get real IP for logging
      const forwardedFor = c.req.header("x-forwarded-for");
      const realIp = c.req.header("x-real-ip");
      const ip = forwardedFor
        ? forwardedFor.split(",")[0].trim()
        : realIp || "unknown";

      ConsoleLogger.warning("Rate limit exceeded", {
        path: c.req.path,
        method: c.req.method,
        ip,
        userAgent: c.req.header("user-agent")?.slice(0, 100),
      });

      return c.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        429
      );
    }

    await next();
  };
};

export const strictRateLimitMiddleware = rateLimitMiddleware(strictLimiter);

export { globalLimiter, strictLimiter };
