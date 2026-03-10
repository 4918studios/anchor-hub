/**
 * Policy Types
 *
 * Fine-grained, per-operation access rules for the authorization model.
 * Policy rules are stored on client records and evaluated at request time.
 */

// =============================================================================
// Policy Rule
// =============================================================================

/**
 * A single policy rule governing access for one operation.
 *
 * All fields are required — deny by default.
 * Rules within an operation are OR'd: any matching rule grants access.
 */
export interface PolicyRule {
  /** Glob patterns for allowed entry types, e.g. ["session:*"], ["*"] */
  entryTypes: string[];

  /** Allowed states, e.g. ["working"], ["committed"], ["*"] */
  states: string[];

  /** Authorship constraint: "self" = client must be author, "any" = no constraint */
  authorship: "self" | "any";
}

// =============================================================================
// Resource Policy
// =============================================================================

/**
 * Per-resource policy defining access rules for each operation.
 */
export interface ResourcePolicy {
  /** Schema version for migration tracking */
  schemaVersion: number;

  /** Read operations */
  read: PolicyRule[];

  /** Create operations */
  create: PolicyRule[];

  /** Update operations */
  update: PolicyRule[];

  /** Delete operations */
  delete: PolicyRule[];

  /** List operations */
  list: PolicyRule[];

  /** Search operations */
  search: PolicyRule[];

  /** Promote operations */
  promote: PolicyRule[];
}

/**
 * Map of resource name → policy rules.
 *
 * Keyed by resource name (e.g. "anchor-log", "anchor-hub").
 */
export type ClientPolicies = Record<string, ResourcePolicy>;
