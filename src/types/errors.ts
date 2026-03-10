/**
 * Custom error types for anchor-hub
 *
 * These errors are thrown by service implementations and caught by
 * the error handler to produce appropriate HTTP responses.
 *
 * Adapted from anchor-log's error hierarchy — same pattern,
 * scoped to anchor-hub's domain.
 */

/**
 * Base class for anchor-hub errors
 */
export abstract class AnchorHubError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;
  readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Thrown when a requested resource is not found
 */
export class NotFoundError extends AnchorHubError {
  readonly code = "NOT_FOUND";
  readonly httpStatus = 404;

  constructor(resourceType: string, resourceId: string) {
    super(`${resourceType} not found: ${resourceId}`, { resourceType, resourceId });
  }
}

/**
 * Thrown when request data is invalid
 */
export class ValidationError extends AnchorHubError {
  readonly code = "BAD_REQUEST";
  readonly httpStatus = 400;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}

/**
 * Thrown when authentication is missing or invalid
 */
export class UnauthorizedError extends AnchorHubError {
  readonly code = "UNAUTHORIZED";
  readonly httpStatus = 401;

  constructor(message = "Authentication required", details?: Record<string, unknown>) {
    super(message, details);
  }
}

/**
 * Thrown when user lacks permission for the operation
 */
export class ForbiddenError extends AnchorHubError {
  readonly code = "FORBIDDEN";
  readonly httpStatus = 403;

  constructor(message = "Access denied", details?: Record<string, unknown>) {
    super(message, details);
  }
}

/**
 * Thrown when an ETag mismatch indicates concurrent modification
 */
export class ConcurrencyError extends AnchorHubError {
  readonly code = "CONFLICT";
  readonly httpStatus = 409;

  constructor(message = "Resource was modified by another request") {
    super(message);
  }
}

/**
 * Error codes enum for consistent error handling
 */
export enum ErrorCode {
  BadRequest = "BAD_REQUEST",
  Unauthorized = "UNAUTHORIZED",
  Forbidden = "FORBIDDEN",
  NotFound = "NOT_FOUND",
  Conflict = "CONFLICT",
  InternalError = "INTERNAL_ERROR",
  ServiceUnavailable = "SERVICE_UNAVAILABLE",
}
