/**
 * Audited Handler Wrapper
 *
 * Wraps Azure Functions v4 handlers to produce one audit event per request.
 * The wrapper:
 *   1. Creates a RequestContext at request start
 *   2. Runs the original handler
 *   3. Constructs an AuditEvent from the request + response
 *   4. Dispatches the event to the registered audit sink
 *
 * Adapted from anchor-log — uses anchor-hub's ROUTE_OPERATION_MAP.
 */

import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { generateEventId } from "./identifiers.js";
import { createRequestContext } from "./requestContext.js";
import { dispatchAuditEvent } from "./auditSink.js";
import type { AuditEvent, AuditDecision, AuditOperation, DenialLayer } from "../types/audit.js";
import { ROUTE_OPERATION_MAP } from "../types/audit.js";

// =============================================================================
// Types
// =============================================================================

/** Azure Functions v4 HTTP handler signature */
type HttpHandler = (
  request: HttpRequest,
  context: InvocationContext,
) => Promise<HttpResponseInit>;

/** Options for the audited handler wrapper */
export interface AuditedHandlerOptions {
  /** Override the resource type */
  resourceType?: string;

  /** Name of the request.params key holding the resource ID */
  resourceIdParam?: string;
}

// =============================================================================
// Wrapper
// =============================================================================

/**
 * Wrap an Azure Functions handler with audit event emission.
 *
 * @param operation - Logical operation name from the operations catalog
 * @param handler - Original handler function
 * @param options - Optional resource extraction config
 * @returns Wrapped handler that emits an audit event after every request
 */
export function createAuditedHandler(
  operation: AuditOperation,
  handler: HttpHandler,
  options?: AuditedHandlerOptions,
): HttpHandler {
  const routeEntry = ROUTE_OPERATION_MAP.find((r) => r.operation === operation);
  const routePattern = routeEntry?.pattern ?? "/unknown";
  const defaultResourceType = routeEntry?.resourceType;

  return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const reqCtx = createRequestContext(request);

    let response: HttpResponseInit;
    try {
      response = await handler(request, context);
    } catch (error) {
      context.error?.(`Unhandled error in ${operation}: ${error}`);
      response = {
        status: 500,
        jsonBody: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
      };
    }

    // --- Build audit event ---

    const statusCode = response.status ?? 200;
    const durationMs = Date.now() - reqCtx.startTime;

    const { decision, decisionReason, denialLayer, errorMessage } =
      inferDecision(statusCode, response);

    const resourceType = options?.resourceType ?? defaultResourceType;
    const resourceId = options?.resourceIdParam
      ? request.params?.[options.resourceIdParam]
      : undefined;

    const event: AuditEvent = {
      eventId: generateEventId(),
      requestId: reqCtx.requestId,
      ...(reqCtx.correlationId && { correlationId: reqCtx.correlationId }),
      timestamp: reqCtx.timestamp,
      durationMs,
      method: reqCtx.method,
      route: routePattern,
      path: reqCtx.path,
      operation,
      ...(resourceType && { resourceType }),
      ...(resourceId && { resourceId }),
      decision,
      decisionReason,
      ...(denialLayer !== undefined && { denialLayer }),
      statusCode,
      ...(errorMessage && { error: errorMessage }),
      ...(reqCtx.ipAddress && { ipAddress: reqCtx.ipAddress }),
      ...(reqCtx.userAgent && { userAgent: reqCtx.userAgent }),
    };

    // Fire-and-forget — never block the response
    await dispatchAuditEvent(event);

    return response;
  };
}

// =============================================================================
// Decision inference
// =============================================================================

interface DecisionResult {
  decision: AuditDecision;
  decisionReason: string;
  denialLayer?: DenialLayer;
  errorMessage?: string;
}

/**
 * Infer the authorization decision from the HTTP response.
 *
 * - 401 → DENY at layer 1 (JWT validation)
 * - 403 → DENY (layer left undefined until auth service enriches it)
 * - 4xx/5xx → ALLOW with error (auth succeeded but operation failed)
 * - 2xx → ALLOW
 */
function inferDecision(
  statusCode: number,
  response: HttpResponseInit,
): DecisionResult {
  const body = response.jsonBody as Record<string, unknown> | undefined;
  const message = (body?.message as string) || undefined;

  if (statusCode === 401) {
    return {
      decision: "DENY",
      decisionReason: message || "authentication required",
      denialLayer: 1,
    };
  }

  if (statusCode === 403) {
    return {
      decision: "DENY",
      decisionReason: message || "access denied",
      denialLayer: undefined,
    };
  }

  if (statusCode >= 400) {
    return {
      decision: "ALLOW",
      decisionReason: "authorized, operation failed",
      errorMessage: message,
    };
  }

  return {
    decision: "ALLOW",
    decisionReason: "all checks passed",
  };
}
