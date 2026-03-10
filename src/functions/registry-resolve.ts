/**
 * Registry Resolution Endpoint
 *
 * GET /api/registry/resolve
 *
 * Validates the caller's JWT and returns their resolved identity and
 * stream capabilities. Called by the NATS auth callout service and by
 * anchor-log's delegated auth.
 *
 * Returns: { userId, clientId, status, domains: [{domainId, canPost, canReceive}] }
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../lib/serviceFactory.js";
import { createAuditedHandler } from "../lib/auditedHandler.js";

export async function registryResolve(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const { auth, errors } = getServices();

  try {
    const identity = await auth.requireIdentity(request);

    context.log(`Registry resolve for user: ${identity.userId}, client: ${identity.clientId}`);

    // TODO (A2): Add streamCapabilities to ClientRecord and return domains here
    return {
      status: 200,
      jsonBody: {
        userId: identity.userId,
        clientId: identity.clientId,
        clientType: identity.clientType,
        status: "active",
        scopes: identity.scopes,
        policies: identity.policies,
        // Placeholder — populated in A2 when streamCapabilities are added to ClientRecord
        domains: [],
      },
    };
  } catch (error) {
    return errors.handleError(error, context);
  }
}

app.http("registryResolve", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "registry/resolve",
  handler: createAuditedHandler("registry.resolve", registryResolve),
});
