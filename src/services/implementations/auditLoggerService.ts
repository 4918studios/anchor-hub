/**
 * Audit Logger Service — DynamoDB Implementation
 *
 * DynamoDB-backed audit event storage.
 *
 * Table: anchor-hub-audit
 *   - PK: requestId (string)
 *   - GSI UserIdIndex: PK = userId, SK = timestamp (for time-ordered listing)
 *
 * @see PLAN.md — A2: Wire real DynamoDB tables
 */

import { PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { IAuditLogger, AuditListOptions } from "../interfaces/auditLogger.js";
import type { AuditEvent } from "../../types/audit.js";
import { getDocClient, auditTableName } from "../../lib/dynamoClient.js";

// =============================================================================
// Constants
// =============================================================================

const USER_ID_INDEX = "UserIdIndex";
const ANONYMOUS_USER = "__anonymous__";

// =============================================================================
// Implementation
// =============================================================================

export class AuditLoggerService implements IAuditLogger {
  async log(event: AuditEvent): Promise<void> {
    const doc = getDocClient();
    const table = auditTableName();

    await doc.send(
      new PutCommand({
        TableName: table,
        Item: {
          ...event,
          // Add userId for GSI (use anonymous placeholder if missing)
          userId: event.userId ?? ANONYMOUS_USER,
        },
      }),
    );
  }

  async getByRequestId(requestId: string): Promise<AuditEvent | null> {
    const doc = getDocClient();
    const table = auditTableName();

    const result = await doc.send(
      new GetCommand({
        TableName: table,
        Key: { requestId },
      }),
    );

    if (!result.Item) return null;

    return result.Item as unknown as AuditEvent;
  }

  async listByUserId(
    userId: string,
    options?: AuditListOptions,
  ): Promise<AuditEvent[]> {
    const doc = getDocClient();
    const table = auditTableName();

    const limit = options?.limit ?? 50;

    // Build key condition
    let keyCondition = "userId = :uid";
    const expressionValues: Record<string, unknown> = {
      ":uid": userId,
    };

    if (options?.since) {
      keyCondition += " AND #ts >= :since";
      expressionValues[":since"] = options.since;
    }

    // Build filter expression for optional filters
    const filterParts: string[] = [];
    if (options?.operation) {
      filterParts.push("operation = :op");
      expressionValues[":op"] = options.operation;
    }
    if (options?.decision) {
      filterParts.push("decision = :dec");
      expressionValues[":dec"] = options.decision;
    }

    const filterExpression =
      filterParts.length > 0 ? filterParts.join(" AND ") : undefined;

    // timestamp is a reserved word in DynamoDB
    const expressionNames: Record<string, string> = {};
    if (options?.since) {
      expressionNames["#ts"] = "timestamp";
    }

    const result = await doc.send(
      new QueryCommand({
        TableName: table,
        IndexName: USER_ID_INDEX,
        KeyConditionExpression: keyCondition,
        ExpressionAttributeValues: expressionValues,
        ...(Object.keys(expressionNames).length > 0 && {
          ExpressionAttributeNames: expressionNames,
        }),
        ...(filterExpression && { FilterExpression: filterExpression }),
        ScanIndexForward: false, // most recent first
        Limit: limit,
      }),
    );

    return (result.Items ?? []) as unknown as AuditEvent[];
  }
}
