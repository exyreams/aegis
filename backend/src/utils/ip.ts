/**
 * IP Address Utility
 *
 * Client IP address extraction from HTTP requests with proxy support
 * including X-Forwarded-For and X-Real-IP header parsing for accurate
 * client identification behind load balancers and reverse proxies.
 */

import type { Context } from "hono";

export function getClientIP(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = c.req.header("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfIP = c.req.header("cf-connecting-ip");
  if (cfIP) {
    return cfIP;
  }

  const clientIP = c.req.header("x-client-ip");
  if (clientIP) {
    return clientIP;
  }

  const clusterIP = c.req.header("x-cluster-client-ip");
  if (clusterIP) {
    return clusterIP;
  }

  const userAgent = c.req.header("user-agent") || "";
  const host = c.req.header("host") || "";
  const isLocalhost =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes("::1");

  if (isLocalhost) {
    const browserFingerprint = userAgent
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 15);

    return `localhost-${browserFingerprint}`;
  }

  const origin = c.req.header("origin");
  if (origin) {
    return `origin-${origin.replace(/[^a-zA-Z0-9]/g, "").slice(0, 15)}`;
  }

  return "unknown-client";
}

export function getIPForLogging(c: Context): string {
  const ip = getClientIP(c);

  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip) || /^[0-9a-fA-F:]+$/.test(ip)) {
    return ip;
  }

  if (ip.startsWith("localhost-")) {
    return `Local-${ip.slice(-8)}`;
  }

  return ip;
}
