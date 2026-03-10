/**
 * Identity Endpoint
 *
 * GET /api/me
 *
 * Returns the caller's resolved identity — canonical IDs, client type,
 * scopes, and policies. Useful for clients to inspect their own profile.
 *
 * Extracted from anchor-log.
 * @see anchor-log/docs/architecture/decisions/013-client-and-user-access-control.md
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../lib/serviceFactory.js";
import { createAuditedHandler } from "../lib/auditedHandler.js";

export async function getIdentity(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const { auth, errors } = getServices();

  try {
    const identity = await auth.requireIdentity(request);

    context.log(`Identity resolved for user: ${identity.userId}, client: ${identity.clientId}`);

    return {
      status: 200,
      jsonBody: {
        userId: identity.userId,
        clientId: identity.clientId,
        clientType: identity.clientType,
        scopes: identity.scopes,
        policies: identity.policies,
      },
    };
  } catch (error) {
    return errors.handleError(error, context);
  }
}

app.http("getIdentity", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "me",
  handler: createAuditedHandler("identity.whoami", getIdentity),
});
