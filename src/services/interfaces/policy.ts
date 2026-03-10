/**
 * Policy Service Interface
 *
 * Defines a swappable policy layer for fine-grained, per-operation
 * authorization. For anchor-hub's scaffold, this is simplified —
 * full policy evaluation lives in anchor-log.
 */

import type { Identity } from "./auth.js";

/**
 * Supported policy operations.
 */
export type PolicyOperation =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "list";

/**
 * Full context for a policy evaluation request.
 */
export interface PolicyContext {
  /** The authenticated identity */
  identity: Identity;

  /** The operation being attempted */
  operation: PolicyOperation;

  /** Resource name override (defaults to "anchor-hub") */
  resourceName?: string;
}

/**
 * Result of a policy evaluation.
 */
export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
}

/**
 * Policy service contract.
 *
 * Implementations:
 * - PolicyStub: Configurable allow-all / deny-all (dev/test)
 * - PolicyService: Real evaluation (future)
 */
export interface IPolicyService {
  /**
   * Evaluate whether the operation is allowed by client policy.
   */
  evaluate(context: PolicyContext): PolicyDecision;

  /**
   * Enforce policy by throwing ForbiddenError when denied.
   */
  requireAllowed(context: PolicyContext): void;
}
