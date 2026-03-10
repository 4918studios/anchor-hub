/**
 * Policy Stub
 *
 * Configurable policy service for local development and testing.
 *
 * Modes:
 * - "allow-all" (default): Permits everything
 * - "deny-all": Denies everything — for testing error responses
 */

import { ForbiddenError } from "../../types/errors.js";
import type {
  IPolicyService,
  PolicyContext,
  PolicyDecision,
} from "../interfaces/policy.js";

type StubMode = "allow-all" | "deny-all";

export class PolicyStub implements IPolicyService {
  private readonly mode: StubMode;

  constructor(mode?: StubMode) {
    this.mode = mode || (process.env.POLICY_STUB_MODE as StubMode) || "allow-all";
  }

  evaluate(context: PolicyContext): PolicyDecision {
    if (this.mode === "deny-all") {
      return {
        allowed: false,
        reason: `[PolicyStub deny-all] ${context.operation} denied`,
      };
    }

    return { allowed: true };
  }

  requireAllowed(context: PolicyContext): void {
    const decision = this.evaluate(context);

    if (!decision.allowed) {
      throw new ForbiddenError(decision.reason || "Access denied by policy", {
        subcode: "policy_denied",
        clientId: context.identity.clientId,
        operation: context.operation,
      });
    }
  }
}
