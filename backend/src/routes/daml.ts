/**
 * DAML Ledger Integration Routes
 *
 * Direct DAML JSON API proxy with authentication, contract operations,
 * party management, and ledger query capabilities.
 */

import { Hono } from "hono";
import { DamlService } from "../services/daml";
import { ConsoleLogger } from "../utils/logger";
import { requireAuth } from "../middleware/auth";
import { auth } from "../lib/auth";

const daml = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const damlService = DamlService.getInstance();

daml.use("*", requireAuth);
daml.get("/parties", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const result = await damlService.getParties(authToken);
    const duration = Date.now() - startTime;

    ConsoleLogger.request("GET", "/api/daml/parties", result.status, duration);

    if (result.status === 200) {
      ConsoleLogger.success(`Retrieved ${result.result?.length || 0} parties`);
      return c.json(result.result);
    } else {
      ConsoleLogger.error("Failed to get parties", result.errors);
      return c.json({ errors: result.errors }, result.status as any);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get parties error", error);
    ConsoleLogger.request("GET", "/api/daml/parties", 500, duration);
    return c.json({ error: "Internal server error" }, 500);
  }
});

daml.post("/query", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const body = await c.req.json();
    const result = await damlService.queryContracts(body, authToken);
    const duration = Date.now() - startTime;

    ConsoleLogger.request("POST", "/api/daml/query", result.status, duration);

    if (result.status === 200) {
      ConsoleLogger.success(
        `Query returned ${result.result?.length || 0} contracts`
      );
      return c.json(result.result);
    } else {
      ConsoleLogger.error("Query failed", result.errors);
      return c.json({ errors: result.errors }, result.status as any);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Query error", error);
    ConsoleLogger.request("POST", "/api/daml/query", 500, duration);
    return c.json({ error: "Internal server error" }, 500);
  }
});

daml.post("/create", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const body = await c.req.json();
    const result = await damlService.createContract(body, authToken);
    const duration = Date.now() - startTime;

    ConsoleLogger.request("POST", "/api/daml/create", result.status, duration);

    if (result.status === 200) {
      ConsoleLogger.success("Contract created successfully", {
        contractId: result.result?.contractId,
      });
      return c.json(result.result);
    } else {
      ConsoleLogger.error("Contract creation failed", result.errors);
      return c.json({ errors: result.errors }, result.status as any);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Create contract error", error);
    ConsoleLogger.request("POST", "/api/daml/create", 500, duration);
    return c.json({ error: "Internal server error" }, 500);
  }
});

daml.post("/exercise", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const body = await c.req.json();
    const result = await damlService.exerciseChoice(body, authToken);
    const duration = Date.now() - startTime;

    ConsoleLogger.request(
      "POST",
      "/api/daml/exercise",
      result.status,
      duration
    );

    if (result.status === 200) {
      ConsoleLogger.success("Choice exercised successfully");
      return c.json(result.result);
    } else {
      ConsoleLogger.error("Exercise choice failed", result.errors);
      return c.json({ errors: result.errors }, result.status as any);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Exercise choice error", error);
    ConsoleLogger.request("POST", "/api/daml/exercise", 500, duration);
    return c.json({ error: "Internal server error" }, 500);
  }
});

daml.get("/rfqs", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const result = await damlService.getRFQs(authToken);
    const duration = Date.now() - startTime;

    ConsoleLogger.request("GET", "/api/daml/rfqs", result.status, duration);

    if (result.status === 200) {
      ConsoleLogger.success(`Retrieved ${result.result?.length || 0} RFQs`);
      return c.json(result.result);
    } else {
      ConsoleLogger.error("Failed to get RFQs", result.errors);
      return c.json({ errors: result.errors }, result.status as any);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get RFQs error", error);
    ConsoleLogger.request("GET", "/api/daml/rfqs", 500, duration);
    return c.json({ error: "Internal server error" }, 500);
  }
});

daml.get("/bids", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const result = await damlService.getBids(authToken);
    const duration = Date.now() - startTime;

    ConsoleLogger.request("GET", "/api/daml/bids", result.status, duration);

    if (result.status === 200) {
      ConsoleLogger.success(`Retrieved ${result.result?.length || 0} bids`);
      return c.json(result.result);
    } else {
      ConsoleLogger.error("Failed to get bids", result.errors);
      return c.json({ errors: result.errors }, result.status as any);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get bids error", error);
    ConsoleLogger.request("GET", "/api/daml/bids", 500, duration);
    return c.json({ error: "Internal server error" }, 500);
  }
});

daml.get("/loans", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const result = await damlService.getLoans(authToken);
    const duration = Date.now() - startTime;

    ConsoleLogger.request("GET", "/api/daml/loans", result.status, duration);

    if (result.status === 200) {
      ConsoleLogger.success(`Retrieved ${result.result?.length || 0} loans`);
      return c.json(result.result);
    } else {
      ConsoleLogger.error("Failed to get loans", result.errors);
      return c.json({ errors: result.errors }, result.status as any);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("Get loans error", error);
    ConsoleLogger.request("GET", "/api/daml/loans", 500, duration);
    return c.json({ error: "Internal server error" }, 500);
  }
});

daml.all("*", async (c) => {
  const startTime = Date.now();
  const session = c.get("session");
  const authToken = `Bearer ${session?.token || ""}`;

  try {
    const path = c.req.path.replace("/api/daml/", "");
    let body: any = undefined;

    if (c.req.method === "POST" || c.req.method === "PUT") {
      body = await c.req.json();
    }

    const result = await damlService.makeRequest(
      path,
      c.req.method as any,
      body,
      {
        Authorization: `Bearer ${authToken}`,
      }
    );

    const duration = Date.now() - startTime;
    ConsoleLogger.request(c.req.method, c.req.path, result.status, duration);

    if (result.status >= 200 && result.status < 300) {
      return c.json(result.result, result.status as any);
    } else {
      return c.json({ errors: result.errors }, result.status as any);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    ConsoleLogger.error("DAML proxy error", error);
    ConsoleLogger.request(c.req.method, c.req.path, 500, duration);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { daml };
