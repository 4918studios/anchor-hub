/**
 * Request Context
 *
 * Captures request metadata at the start of each API request.
 * Created by the audited handler wrapper and enriched during processing.
 */

import type { HubRequest } from "../types/http.js";
import { generateRequestId } from "./identifiers.js";

export interface RequestContext {
  requestId: string;
  correlationId?: string;
  timestamp: string;
  startTime: number;
  method: string;
  path: string;
  ipAddress?: string;
  userAgent?: string;
}

export function createRequestContext(request: HubRequest): RequestContext {
  const correlationId = request.headers.get("x-correlation-id") || undefined;
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined;
  const userAgent = request.headers.get("user-agent") || undefined;

  let path: string;
  try {
    path = new URL(request.url).pathname;
  } catch {
    path = request.url;
  }

  return {
    requestId: generateRequestId(),
    correlationId,
    timestamp: new Date().toISOString(),
    startTime: Date.now(),
    method: request.method,
    path,
    ipAddress,
    userAgent,
  };
}
