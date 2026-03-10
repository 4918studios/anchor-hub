/**
 * Lambda Router
 *
 * Maps HTTP method + path combinations to handler functions.
 * Supports path parameters (e.g., `/clients/{clientId}/install-manifest`).
 *
 * This replaces Azure Functions' `app.http()` route registration.
 */

import type { HubHandler } from "../types/http.js";
import { createAuditedHandler } from "../lib/auditedHandler.js";
import type { AuditOperation } from "../types/audit.js";

// Import handlers
import { health } from "../handlers/health.js";
import { getIdentity } from "../handlers/me.js";
import { registryResolve } from "../handlers/registry-resolve.js";
import { installApp } from "../handlers/apps/install.js";
import { uninstallApp } from "../handlers/apps/uninstall.js";
import { listInstalledApps } from "../handlers/apps/list.js";
import { getInstallManifest } from "../handlers/apps/install-manifest.js";

// =============================================================================
// Route definition
// =============================================================================

export interface RouteDefinition {
  method: string;
  /** Pattern like `/health` or `/users/me/installed-apps/{clientId}` */
  pattern: string;
  /** Audit operation name */
  operation: AuditOperation;
  /** The handler function */
  handler: HubHandler;
}

/** All registered routes */
export const routes: RouteDefinition[] = [
  { method: "GET",    pattern: "/health",                              operation: "system.health",   handler: health },
  { method: "GET",    pattern: "/me",                                  operation: "identity.whoami", handler: getIdentity },
  { method: "GET",    pattern: "/registry/resolve",                    operation: "registry.resolve", handler: registryResolve },
  { method: "POST",   pattern: "/users/me/installed-apps",             operation: "app.install",     handler: installApp },
  { method: "DELETE",  pattern: "/users/me/installed-apps/{clientId}",  operation: "app.uninstall",   handler: uninstallApp },
  { method: "GET",    pattern: "/users/me/installed-apps",             operation: "app.list",        handler: listInstalledApps },
  { method: "GET",    pattern: "/clients/{clientId}/install-manifest", operation: "app.manifest",    handler: getInstallManifest },
];

// =============================================================================
// Route matching
// =============================================================================

export interface MatchResult {
  handler: HubHandler;
  params: Record<string, string>;
}

/**
 * Match an HTTP method + path to a registered route.
 *
 * @param method - HTTP method (GET, POST, DELETE, etc.)
 * @param path - Request path (e.g., `/api/users/me/installed-apps`)
 * @returns The matched handler + extracted path params, or undefined
 */
export function matchRoute(method: string, path: string): MatchResult | undefined {
  // Strip /api/ prefix if present (API Gateway stage prefix)
  const normalizedPath = path.replace(/^\/api/, "");

  for (const route of routes) {
    if (route.method !== method.toUpperCase()) continue;

    const params = matchPattern(route.pattern, normalizedPath);
    if (params !== undefined) {
      const wrappedHandler = createAuditedHandler(route.operation, route.handler);
      return { handler: wrappedHandler, params };
    }
  }

  return undefined;
}

/**
 * Match a route pattern against a path, extracting path parameters.
 *
 * @returns Extracted params object, or undefined if no match
 */
function matchPattern(
  pattern: string,
  path: string,
): Record<string, string> | undefined {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return undefined;

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i];
    const match = pp.match(/^\{(\w+)\}$/);

    if (match) {
      // Path parameter
      params[match[1]] = pathParts[i];
    } else if (pp !== pathParts[i]) {
      return undefined;
    }
  }

  return params;
}
