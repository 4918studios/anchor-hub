/**
 * Audit Event Types
 *
 * One audit event per API request — records who did what, to which resource,
 * whether it was allowed, and how long it took.
 *
 * Adapted from anchor-log — same structure, with anchor-hub's operations catalog.
 */

// =============================================================================
// Decision
// =============================================================================

/** Authorization outcome for an API request */
export type AuditDecision = "ALLOW" | "DENY";

// =============================================================================
// Denial Layers
// =============================================================================

/**
 * Auth layer that denied the request.
 *
 *  1 = JWT validation
 *  2 = Client lookup
 *  3 = User resolution
 *  4 = Install check
 *  5 = Entitlement check
 *  6 = Scope check
 *  7 = Policy check
 */
export type DenialLayer = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// =============================================================================
// Audit Event
// =============================================================================

/**
 * A single audit event capturing one API request's lifecycle.
 */
export interface AuditEvent {
  /** Unique audit event ID: `evt_<uuidv7>` */
  eventId: string;

  /** Unique request ID: `req_<uuidv7>` */
  requestId: string;

  /** Optional client-supplied correlation ID */
  correlationId?: string;

  /** ISO 8601 timestamp when the request was received */
  timestamp: string;

  /** Total request processing time in milliseconds */
  durationMs: number;

  /** Canonical platform userId, absent if auth failed before user resolution */
  userId?: string;

  /** Canonical platform clientId, absent if auth failed before client lookup */
  clientId?: string;

  /** Client type, absent if client unknown */
  clientType?: string;

  /** HTTP method */
  method: string;

  /** Matched route pattern */
  route: string;

  /** Actual request path */
  path: string;

  /** Logical operation name */
  operation: string;

  /** Type of resource accessed */
  resourceType?: string;

  /** ID of the accessed resource */
  resourceId?: string;

  /** Authorization outcome */
  decision: AuditDecision;

  /** Reason for the decision */
  decisionReason: string;

  /** Which auth layer denied the request */
  denialLayer?: DenialLayer;

  /** HTTP status code of the response */
  statusCode: number;

  /** Error message if the request failed */
  error?: string;

  /** Client IP address */
  ipAddress?: string;

  /** User-Agent header */
  userAgent?: string;
}

// =============================================================================
// Operations Catalog
// =============================================================================

/**
 * anchor-hub's operations catalog.
 *
 * Covers identity, registry, and app lifecycle operations.
 * Does NOT include entry operations (those belong to anchor-log).
 */
export const OPERATION_CATALOG = {
  // Identity operations
  "identity.whoami": "identity.whoami",

  // Registry operations
  "registry.resolve": "registry.resolve",

  // App lifecycle operations
  "app.install": "app.install",
  "app.uninstall": "app.uninstall",
  "app.list": "app.list",
  "app.manifest": "app.manifest",

  // System operations
  "system.health": "system.health",
} as const;

/** Valid operation string from the catalog */
export type AuditOperation = keyof typeof OPERATION_CATALOG;

/**
 * Route-to-operation mapping for audit middleware.
 */
export const ROUTE_OPERATION_MAP: ReadonlyArray<{
  method: string;
  pattern: string;
  operation: AuditOperation;
  resourceType?: string;
}> = [
  // Identity routes
  { method: "GET", pattern: "/me", operation: "identity.whoami" },

  // Registry routes
  { method: "GET", pattern: "/registry/resolve", operation: "registry.resolve" },

  // App lifecycle routes
  { method: "POST", pattern: "/users/me/installed-apps", operation: "app.install" },
  { method: "DELETE", pattern: "/users/me/installed-apps/{clientId}", operation: "app.uninstall" },
  { method: "GET", pattern: "/users/me/installed-apps", operation: "app.list" },
  { method: "GET", pattern: "/clients/{clientId}/install-manifest", operation: "app.manifest" },

  // System routes
  { method: "GET", pattern: "/health", operation: "system.health" },
];

/** Number of entries in the operations catalog */
export const OPERATION_COUNT = Object.keys(OPERATION_CATALOG).length;
