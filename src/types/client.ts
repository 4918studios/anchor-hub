/**
 * Client Types
 *
 * Client registry types for the DynamoDB `clients` table.
 * Each client record represents an application that can access the platform.
 *
 * Shared between anchor-hub (source of truth) and anchor-log (consumer).
 */

import type { ClientPolicies } from "./policy.js";
export type { ClientPolicies };

// =============================================================================
// Identity Link
// =============================================================================

/**
 * Maps a client to an external authentication provider.
 */
export interface ClientIdentityLink {
  /** Auth provider identifier, e.g. "clerk", "auth0", "custom" */
  provider: string;

  /** Provider-specific client identifier (e.g. Clerk publishable key / azp) */
  identifier: string;

  /** When this link was created (ISO 8601) */
  linkedAt: string;
}

// =============================================================================
// Client Status & Type
// =============================================================================

/** Client operational status */
export type ClientStatus = "active" | "disabled" | "pending-review" | "revoked";

/** Client application type */
export type ClientType = "first-party" | "third-party" | "agent";

// =============================================================================
// Client Record
// =============================================================================

/**
 * Full client record stored in the DynamoDB `clients` table.
 * Partition key: clientId.
 */
export interface ClientRecord {
  /** Canonical client ID: `cli_<uuidv7>` — platform-owned, provider-neutral */
  clientId: string;

  /** Human-readable application name */
  name: string;

  /** Brief description of what the app does */
  description: string;

  /** Application type — affects consent flow and install check */
  type: ClientType;

  /** Operational status — inactive clients get 403 */
  status: ClientStatus;

  /** When client was registered (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;

  /** Authentication provider links (azp → clientId resolution) */
  identityLinks: ClientIdentityLink[];

  /** Coarse-grained scopes the client is allowed (server-side resolution) */
  grantedScopes: string[];

  /** Per-resource fine-grained policy rules */
  policies: ClientPolicies;

  /** Open bag for cross-referencing external systems */
  externalIds: Record<string, string>;

  /** Application icon URL (for install manifest) */
  iconUrl: string | null;

  /** Developer contact email */
  contactEmail: string | null;
}
