/**
 * Health Check Endpoint
 *
 * GET /health
 *
 * Returns service health status and version info.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../lib/serviceFactory.js";
import { createAuditedHandler } from "../lib/auditedHandler.js";

export async function health(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const services = getServices();

    const servicesOk =
      services.auth &&
      services.clientRegistry &&
      services.userRegistry &&
      services.errors;

    return {
      status: 200,
      jsonBody: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        service: "anchor-hub",
        services: servicesOk ? "ok" : "degraded",
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    context.error?.("Service initialization failed");

    return {
      status: 500,
      jsonBody: {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        service: "anchor-hub",
        error: errorMessage,
      },
    };
  }
}

app.http("health", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "health",
  handler: createAuditedHandler("system.health", health),
});
