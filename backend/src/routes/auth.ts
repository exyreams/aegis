/**
 * Authentication Routes
 *
 * Better-Auth integration with login, logout, user management,
 * and DAML party retrieval endpoints.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "../lib/auth";
import { ConsoleLogger } from "../utils/logger";
import { userService } from "../services/user";

const authRoutes = new Hono();
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid("json");

    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: c.req.raw.headers,
    });

    if (!result) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    ConsoleLogger.success("User logged in successfully", { email });

    return c.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    ConsoleLogger.error("Login error", error);
    return c.json({ error: "Login failed" }, 401);
  }
});

authRoutes.post("/logout", async (c) => {
  try {
    await auth.api.signOut({
      headers: c.req.raw.headers,
    });

    return c.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    ConsoleLogger.error("Logout error", error);
    return c.json({ error: "Logout failed" }, 500);
  }
});

authRoutes.get("/me", async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    return c.json({
      user: session.user,
      session: session.session,
    });
  } catch (error) {
    ConsoleLogger.error("Get user error", error);
    return c.json({ error: "Failed to get user info" }, 500);
  }
});

authRoutes.get("/registered-users", async (c) => {
  try {
    const role = c.req.query("role");
    const limit = parseInt(c.req.query("limit") || "100");
    const offset = parseInt(c.req.query("offset") || "0");

    const users = await userService.listUsers({
      role,
      limit,
      offset,
    });

    ConsoleLogger.success(`Retrieved ${users.length} users`, {
      role,
      limit,
      offset,
    });

    return c.json({
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        damlParty: user.damlParty,
        role: user.role,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lenderProfile:
          user.role === "lender" && user.lenderAnonymousId
            ? {
                anonymousId: user.lenderAnonymousId,
                categoryTier: user.lenderCategoryTier,
                ratingTier: user.lenderRatingTier,
                capacityTier: user.lenderCapacityTier,
                geographicScope: user.lenderGeographicScope,
              }
            : null,
      })),
      total: users.length,
    });
  } catch (error) {
    ConsoleLogger.error("Get registered users error", error);
    return c.json({ error: "Failed to get registered users" }, 500);
  }
});

authRoutes.get("/parties", async (c) => {
  try {
    const users = await userService.listUsers({ limit: 1000 });

    const parties = users
      .filter((user) => user.damlParty)
      .map((user) => ({
        id: user.id,
        name: user.name,
        damlParty: user.damlParty,
        role: user.role,
      }));

    ConsoleLogger.success(`Retrieved ${parties.length} parties from database`);

    return c.json({
      parties,
      total: parties.length,
    });
  } catch (error) {
    ConsoleLogger.error("Get parties error", error);
    return c.json({ error: "Failed to get parties" }, 500);
  }
});

export { authRoutes };
