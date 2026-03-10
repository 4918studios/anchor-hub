/**
 * Audit Logger Stub — In-Memory Implementation
 *
 * Stores audit events in memory for unit/integration testing and local
 * development.
 */

import type { IAuditLogger, AuditListOptions } from "../interfaces/auditLogger.js";
import type { AuditEvent } from "../../types/audit.js";

const ANONYMOUS_USER = "__anonymous__";

export class AuditLoggerStub implements IAuditLogger {
  private byRequestId = new Map<string, AuditEvent>();
  private byUserId = new Map<string, AuditEvent[]>();

  async log(event: AuditEvent): Promise<void> {
    this.byRequestId.set(event.requestId, event);

    const userId = event.userId ?? ANONYMOUS_USER;
    const list = this.byUserId.get(userId) ?? [];
    list.push(event);
    this.byUserId.set(userId, list);

    if (process.env.AUDIT_LOG_CONSOLE === "true") {
      console.log(
        `[audit-stub] ${event.decision} ${event.operation} ${event.statusCode} ${event.durationMs}ms`,
        event.requestId,
      );
    }
  }

  async getByRequestId(requestId: string): Promise<AuditEvent | null> {
    return this.byRequestId.get(requestId) ?? null;
  }

  async listByUserId(userId: string, options?: AuditListOptions): Promise<AuditEvent[]> {
    let events = this.byUserId.get(userId) ?? [];

    if (options?.since) {
      const sinceTime = new Date(options.since).getTime();
      events = events.filter((e) => new Date(e.timestamp).getTime() >= sinceTime);
    }
    if (options?.operation) {
      events = events.filter((e) => e.operation === options.operation);
    }
    if (options?.decision) {
      events = events.filter((e) => e.decision === options.decision);
    }

    events = [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const limit = options?.limit ?? 50;
    return events.slice(0, limit);
  }

  // ---------------------------------------------------------------------------
  // Test Helpers
  // ---------------------------------------------------------------------------

  size(): number {
    return this.byRequestId.size;
  }

  all(): AuditEvent[] {
    return Array.from(this.byRequestId.values());
  }

  clear(): void {
    this.byRequestId.clear();
    this.byUserId.clear();
  }
}

export const auditLoggerStubSingleton = new AuditLoggerStub();

export function createAuditLoggerStub(): AuditLoggerStub {
  return new AuditLoggerStub();
}
