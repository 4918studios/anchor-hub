/**
 * Audit Sink
 *
 * Pluggable dispatch point for audit events. The audited handler wrapper
 * calls `dispatchAuditEvent()` after every request. By default this is
 * a no-op — the real DynamoDB writer is registered by the service factory.
 *
 * Design:
 *   - `registerAuditSink()` lets the service factory plug in the real logger
 *   - `dispatchAuditEvent()` swallows errors so audit failures never crash requests
 *   - `getAuditSink()` / `resetAuditSink()` — test helpers
 */

import type { AuditEvent } from "../types/audit.js";

// =============================================================================
// Sink interface
// =============================================================================

/** Callback that receives a fully-constructed audit event */
export type AuditEventHandler = (event: AuditEvent) => Promise<void>;

// =============================================================================
// Registry
// =============================================================================

/** Default handler: no-op. Console logging available via AUDIT_LOG_CONSOLE=true */
const defaultHandler: AuditEventHandler = async (event) => {
  if (process.env.AUDIT_LOG_CONSOLE === "true") {
    console.log(
      `[audit] ${event.decision} ${event.operation} ${event.statusCode} ${event.durationMs}ms`,
      event.requestId,
    );
  }
};

let _handler: AuditEventHandler = defaultHandler;

/**
 * Register a real audit sink (called by the service factory).
 */
export function registerAuditSink(handler: AuditEventHandler): void {
  _handler = handler;
}

/**
 * Reset to the default no-op handler (useful for tests).
 */
export function resetAuditSink(): void {
  _handler = defaultHandler;
}

/**
 * Get the currently registered handler (useful for test assertions).
 */
export function getAuditSink(): AuditEventHandler {
  return _handler;
}

// =============================================================================
// Dispatch
// =============================================================================

/**
 * Dispatch an audit event to the registered sink.
 *
 * **Never throws.** Audit failures must not affect request processing.
 */
export async function dispatchAuditEvent(event: AuditEvent): Promise<void> {
  try {
    await _handler(event);
  } catch (error) {
    console.error(
      "[audit] Failed to dispatch audit event:",
      error instanceof Error ? error.message : error,
    );
  }
}
