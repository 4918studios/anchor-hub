/**
 * Auth Service Interface
 *
 * Defines the contract for authentication and identity extraction.
 * Production implementation uses Clerk OIDC JWT validation + DynamoDB registries.
 */

import type { HubRequest } from "../../types/http.js";
import type { ClientPolicies, ClientType } from "../../types/client.js";

/**
 * Authenticated user identity extracted from request.
 */
export interface Identity {
  /** Canonical platform userId (`usr_<uuidv7>` from user registry) */
  userId: string;

  /** Canonical platform clientId (`cli_<uuidv7>` from client registry) */
  clientId: string;

  /** Client application type */
  clientType: ClientType;

  /** Coarse-grained scopes resolved from client.grantedScopes */
  scopes: string[];

  /** Per-resource fine-grained policy rules */
  policies: ClientPolicies;

  /** Raw Clerk user ID (sub claim) — for audit trail only */
  clerkUserId?: string;

  /** Raw Clerk azp claim — for audit trail only */
  clerkAzp?: string;
}

/**
 * Auth service contract
 *
 * Implementations:
 * - AuthStub: Returns identity from headers (dev mode)
 * - AuthService: Validates Clerk JWT and resolves canonical user identity (prod)
 */
export interface IAuthService {
  /**
   * Validate request authentication and extract identity
   *
   * @param request - The incoming HTTP request with Authorization header
   * @returns The authenticated user's identity
   * @throws UnauthorizedError if token is missing, invalid, or expired
   * @throws ForbiddenError if authenticated principal fails authorization checks
   */
  requireIdentity(request: HubRequest): Promise<Identity>;
}
