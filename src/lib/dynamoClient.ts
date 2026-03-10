/**
 * DynamoDB Client
 *
 * Shared DynamoDB Document client instance and table name helpers.
 * All DynamoDB-backed services import from here to avoid duplicating
 * SDK setup.
 *
 * Tables:
 *   - anchor-hub-clients: Client registry (PK: pk, SK: sk)
 *   - anchor-hub-users:   User registry (PK: pk, SK: sk)
 *   - anchor-hub-audit:   Audit events (PK: requestId, GSI: userId+timestamp)
 *
 * @see PLAN.md — A2: Wire real DynamoDB tables
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// =============================================================================
// Client singleton
// =============================================================================

let _docClient: DynamoDBDocumentClient | null = null;

/**
 * Get the shared DynamoDB Document client.
 *
 * Uses `AWS_REGION` env var (defaults to us-east-1).
 * In local dev with DynamoDB Local, set `DYNAMODB_ENDPOINT` to override.
 */
export function getDocClient(): DynamoDBDocumentClient {
  if (_docClient) return _docClient;

  const region = process.env.AWS_REGION || "us-east-1";
  const endpoint = process.env.DYNAMODB_ENDPOINT || undefined;

  const baseClient = new DynamoDBClient({
    region,
    ...(endpoint && { endpoint }),
  });

  _docClient = DynamoDBDocumentClient.from(baseClient, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
    unmarshallOptions: {
      wrapNumbers: false,
    },
  });

  return _docClient;
}

// =============================================================================
// Table names
// =============================================================================

/** Table name for client records */
export function clientsTableName(): string {
  return process.env.DYNAMODB_TABLE_CLIENTS || "anchor-hub-clients";
}

/** Table name for user records */
export function usersTableName(): string {
  return process.env.DYNAMODB_TABLE_USERS || "anchor-hub-users";
}

/** Table name for audit events */
export function auditTableName(): string {
  return process.env.DYNAMODB_TABLE_AUDIT || "anchor-hub-audit";
}

// =============================================================================
// Key conventions
// =============================================================================

/**
 * DynamoDB key conventions for anchor-hub tables.
 *
 * **Clients table** (pk, sk):
 *   - Client record:  pk = clientId,                           sk = "CLIENT"
 *   - Identity link:  pk = "LINK#<provider>#<identifier>",     sk = "CLIENT"
 *     (contains { clientId } for pointer back to the record)
 *
 * **Users table** (pk, sk):
 *   - User record:    pk = userId,                             sk = "USER"
 *   - Identity link:  pk = "LINK#<issuer>#<subject>",          sk = "USER"
 *     (contains { userId } for pointer back to the record)
 *
 * **Audit table** (requestId as PK):
 *   - Audit event:    requestId as partition key
 *   - GSI (UserIdIndex): pk = userId, sk = timestamp
 */
export const SK_CLIENT = "CLIENT";
export const SK_USER = "USER";

export function clientLinkPk(provider: string, identifier: string): string {
  return `LINK#${provider}#${identifier}`;
}

export function userLinkPk(issuer: string, subject: string): string {
  return `LINK#${issuer}#${subject}`;
}

// =============================================================================
// Test helpers
// =============================================================================

/**
 * Reset the cached client (useful for testing with different configs).
 */
export function resetDocClient(): void {
  _docClient = null;
}
