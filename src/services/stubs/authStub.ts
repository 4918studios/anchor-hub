/**
 * Auth Stub — Mock authentication for local development
 *
 * Extracts identity from request headers or falls back to env vars/defaults.
 * Used when AUTH_BYPASS=true or in development mode.
 */

import type { HubRequest } from "../../types/http.js";
import type { Identity, IAuthService } from "../interfaces/index.js";
import type { ClientPolicies, ClientType } from "../../types/client.js";

function parseScopes(value: string | null | undefined): string[] {
  if (!value || value.trim().length === 0) {
    return [];
  }

  return value
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0);
}

/** Default permissive policies for dev mode */
const DEV_POLICIES: ClientPolicies = {
  "anchor-log": {
    schemaVersion: 1,
    read: [{ entryTypes: ["*"], states: ["*"], authorship: "any" }],
    create: [{ entryTypes: ["*"], states: ["*"], authorship: "self" }],
    update: [{ entryTypes: ["*"], states: ["*"], authorship: "self" }],
    delete: [{ entryTypes: ["*"], states: ["*"], authorship: "self" }],
    list: [{ entryTypes: ["*"], states: ["*"], authorship: "any" }],
    search: [{ entryTypes: ["*"], states: ["*"], authorship: "any" }],
    promote: [{ entryTypes: ["*"], states: ["working"], authorship: "self" }],
  },
};

export class AuthStub implements IAuthService {
  /**
   * Extract identity from headers or use defaults.
   *
   * Headers checked:
   * - x-user-id, x-client-id, x-client-type, x-auth-scopes
   *
   * Fallback to env vars:
   * - DEV_USER_ID, DEV_CLIENT_ID, DEV_CLIENT_TYPE, DEV_AUTH_SCOPES
   */
  async requireIdentity(request: HubRequest): Promise<Identity> {
    const userId =
      request.headers.get("x-user-id") ||
      process.env.DEV_USER_ID ||
      "usr_00000000-0000-0000-0000-000000000001";

    const clientId =
      request.headers.get("x-client-id") ||
      process.env.DEV_CLIENT_ID ||
      "cli_00000000-0000-0000-0000-000000000001";

    const clientType = (
      request.headers.get("x-client-type") ||
      process.env.DEV_CLIENT_TYPE ||
      "first-party"
    ) as ClientType;

    const scopes = parseScopes(
      request.headers.get("x-auth-scopes") ||
      process.env.DEV_AUTH_SCOPES ||
      "anchor-log.entries.read anchor-log.entries.write anchor-hub.admin"
    );

    const identity: Identity = {
      userId,
      clientId,
      clientType,
      scopes,
      policies: DEV_POLICIES,
    };

    return identity;
  }
}
