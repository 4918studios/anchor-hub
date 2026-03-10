/**
 * Cloud-Agnostic HTTP Types
 *
 * These types decouple handler logic from any cloud SDK (Azure Functions,
 * AWS Lambda, etc.). The Lambda adapter maps API Gateway events to/from
 * these types. All handlers, lib utilities, and service interfaces use
 * these instead of cloud-specific imports.
 *
 * @see ADR-001: Migrate from Azure to AWS
 */

// =============================================================================
// Request
// =============================================================================

/** Minimal headers interface matching the subset used by handlers */
export interface HubHeaders {
  /** Get a header value by name (case-insensitive) */
  get(name: string): string | null;
}

/**
 * Cloud-agnostic HTTP request.
 *
 * Mirrors the subset of Azure Functions' HttpRequest / API Gateway event
 * that our handlers actually use.
 */
export interface HubRequest {
  /** HTTP method (GET, POST, DELETE, etc.) */
  method: string;

  /** Full request URL */
  url: string;

  /** Request headers */
  headers: HubHeaders;

  /** Path parameters extracted from the route pattern */
  params: Record<string, string>;

  /** Query string parameters */
  query: Record<string, string>;

  /** Parsed request body (if any) */
  body?: unknown;
}

// =============================================================================
// Response
// =============================================================================

/**
 * Cloud-agnostic HTTP response.
 *
 * Handlers return this shape. The Lambda adapter converts it to the
 * cloud-specific response format (APIGatewayProxyResult, etc.).
 */
export interface HubResponse {
  /** HTTP status code */
  status: number;

  /** JSON-serializable response body */
  jsonBody?: unknown;

  /** Additional response headers */
  headers?: Record<string, string>;
}

// =============================================================================
// Context
// =============================================================================

/**
 * Cloud-agnostic invocation context.
 *
 * Provides structured logging. In Lambda, maps to CloudWatch via console.
 * In Azure Functions, mapped to InvocationContext.
 */
export interface HubContext {
  /** Log an informational message */
  log: (message: string) => void;

  /** Log an error message */
  error?: (message: string) => void;
}

// =============================================================================
// Handler signature
// =============================================================================

/** Standard handler function signature used by all endpoints */
export type HubHandler = (
  request: HubRequest,
  context: HubContext,
) => Promise<HubResponse>;
