/**
 * Error Handler Implementation
 *
 * Maps service errors to HTTP responses.
 */

import type { HubResponse } from "../types/http.js";
import type { IErrorHandler } from "../services/interfaces/errors.js";
import { ErrorCode } from "../services/interfaces/errors.js";
import { AnchorHubError } from "../types/errors.js";

export class ErrorHandlerImpl implements IErrorHandler {
  handleError(
    error: unknown,
    context: { log: (message: string) => void }
  ): HubResponse {
    // Handle our custom errors
    if (error instanceof AnchorHubError) {
      context.log(`Handled error: ${error.code}`);

      return {
        status: error.httpStatus,
        jsonBody: error.toJSON(),
      };
    }

    // Handle standard errors
    if (error instanceof Error) {
      context.log("Handled error: internal");
      return this.createErrorResponse(
        500,
        ErrorCode.InternalError,
        "An unexpected error occurred",
        { message: error.message }
      );
    }

    // Handle unknown errors
    context.log("Handled error: unknown");
    return this.createErrorResponse(500, ErrorCode.InternalError, "An unknown error occurred");
  }

  createErrorResponse(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
  ): HubResponse {
    return {
      status: statusCode,
      jsonBody: {
        code,
        message,
        ...(details && { details }),
      },
    };
  }
}
