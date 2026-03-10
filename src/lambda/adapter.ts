/**
 * Lambda Adapter
 *
 * Maps API Gateway Proxy events to/from cloud-agnostic HubRequest/HubResponse
 * types. This is the only file in the project that imports `aws-lambda` types.
 *
 * @see src/types/http.ts for the cloud-agnostic types
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import type { HubRequest, HubResponse, HubContext, HubHeaders } from "../types/http.js";

// =============================================================================
// API Gateway → HubRequest
// =============================================================================

/**
 * Convert an API Gateway Proxy event into a HubRequest.
 *
 * @param event - API Gateway Proxy integration event
 * @param pathParams - Path parameters extracted by the router (route pattern matching)
 */
export function toHubRequest(
  event: APIGatewayProxyEvent,
  pathParams: Record<string, string> = {},
): HubRequest {
  const headers: HubHeaders = {
    get(name: string): string | null {
      // API Gateway normalizes header names to lowercase
      const lower = name.toLowerCase();
      if (event.headers) {
        for (const [key, value] of Object.entries(event.headers)) {
          if (key.toLowerCase() === lower) return value || null;
        }
      }
      return null;
    },
  };

  const query: Record<string, string> = {};
  if (event.queryStringParameters) {
    for (const [key, value] of Object.entries(event.queryStringParameters)) {
      if (value != null) query[key] = value;
    }
  }

  let body: unknown;
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      body = event.body;
    }
  }

  // Build a full URL from the event
  const host = headers.get("host") || "localhost";
  const proto = headers.get("x-forwarded-proto") || "https";
  const qs = event.queryStringParameters
    ? "?" + new URLSearchParams(query).toString()
    : "";
  const url = `${proto}://${host}${event.path}${qs}`;

  return {
    method: event.httpMethod,
    url,
    headers,
    params: { ...event.pathParameters, ...pathParams } as Record<string, string>,
    query,
    body,
  };
}

// =============================================================================
// Lambda Context → HubContext
// =============================================================================

/** Convert a Lambda Context into a HubContext */
export function toHubContext(context: Context): HubContext {
  return {
    log: (message: string) => console.log(`[${context.functionName}] ${message}`),
    error: (message: string) => console.error(`[${context.functionName}] ${message}`),
  };
}

// =============================================================================
// HubResponse → API Gateway Result
// =============================================================================

/** Convert a HubResponse to an API Gateway Proxy result */
export function toApiGatewayResult(response: HubResponse): APIGatewayProxyResult {
  return {
    statusCode: response.status,
    headers: {
      "Content-Type": "application/json",
      ...response.headers,
    },
    body: response.jsonBody !== undefined ? JSON.stringify(response.jsonBody) : "",
  };
}
