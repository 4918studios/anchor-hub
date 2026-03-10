/**
 * Audit Logger Service Interface
 *
 * Defines the contract for writing and querying audit events.
 */

import type { AuditEvent } from "../../types/audit.js";

/** Options for listing audit events by userId */
export interface AuditListOptions {
  /** Maximum number of events to return (default: 50) */
  limit?: number;

  /** ISO 8601 timestamp — only events after this time */
  since?: string;

  /** Filter by operation */
  operation?: string;

  /** Filter by decision */
  decision?: "ALLOW" | "DENY";
}

export interface IAuditLogger {
  /**
   * Write a single audit event.
   */
  log(event: AuditEvent): Promise<void>;

  /**
   * Retrieve an audit event by its requestId.
   */
  getByRequestId(requestId: string): Promise<AuditEvent | null>;

  /**
   * List audit events for a specific userId, most recent first.
   */
  listByUserId(userId: string, options?: AuditListOptions): Promise<AuditEvent[]>;
}
