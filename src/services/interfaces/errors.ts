/**
 * Error Handler Interface
 *
 * Defines the contract for consistent error handling across the service.
 */

import type { HubResponse } from "../../types/http.js";
import { ErrorCode } from "../../types/errors.js";

/**
 * Error handler contract
 */
export interface IErrorHandler {
  /**
   * Handle an unknown error and produce an HTTP response
   */
  handleError(
    error: unknown,
    context: { log: (message: string) => void; error?: (message: string) => void }
  ): HubResponse;

  /**
   * Create a structured error response
   */
  createErrorResponse(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
  ): HubResponse;
}

// Re-export ErrorCode for convenience
export { ErrorCode };
