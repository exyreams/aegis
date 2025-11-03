/**
 * Authentication and Authorization Middleware
 *
 * Provides authentication checks, role-based access control,
 * permission validation, and optional authentication for Hono routes.
 */

import type { Context, Next } from "hono";
import { ConsoleLogger } from "../utils/logger";
export async function requireAuth(c: Context, next: Next) {
  try {
    const user = c.get("user");
    const session = c.get("session");

    if (!user || !session) {
      ConsoleLogger.warning("Unauthorized access attempt", {
        path: c.req.path,
        method: c.req.method,
        hasUser: !!user,
        hasSession: !!session,
      });

      return c.json(
        {
          error: "Unauthorized",
          message: "Authentication required",
        },
        401
      );
    }

    await next();
  } catch (error) {
    ConsoleLogger.error("Auth middleware error", error);
    return c.json(
      {
        error: "Authentication error",
        message: "Failed to verify authentication",
      },
      500
    );
  }
}

export function requireRole(role: string) {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          error: "Unauthorized",
          message: "Authentication required",
        },
        401
      );
    }

    if (user.role !== role && user.role !== "admin") {
      ConsoleLogger.warning("Insufficient permissions", {
        userId: user.id,
        requiredRole: role,
        userRole: user.role,
        path: c.req.path,
      });

      return c.json(
        {
          error: "Forbidden",
          message: `${role} role required`,
        },
        403
      );
    }

    await next();
  };
}

export function requirePermission(resource: string, action: string) {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          error: "Unauthorized",
          message: "Authentication required",
        },
        401
      );
    }

    const { RolePermissions } = await import("../utils/rolePermissions");

    if (!RolePermissions.hasPermission(user.role, resource, action)) {
      ConsoleLogger.warning("Insufficient permissions", {
        userId: user.id,
        userRole: user.role,
        requiredResource: resource,
        requiredAction: action,
        path: c.req.path,
      });

      return c.json(
        {
          error: "Forbidden",
          message: `Permission denied: ${action} on ${resource}`,
        },
        403
      );
    }

    await next();
  };
}

export async function optionalAuth(_c: Context, next: Next) {
  await next();
}
