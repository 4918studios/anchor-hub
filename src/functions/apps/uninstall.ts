/**
 * Uninstall App Endpoint
 *
 * DELETE /api/users/me/installed-apps/{clientId}
 *
 * Uninstall a third-party app and revoke OAuth consent.
 * Placeholder — implementation extracted from anchor-log in A3/A4.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../../lib/serviceFactory.js";
import { createAuditedHandler } from "../../lib/auditedHandler.js";

export async function uninstallApp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const { auth, errors } = getServices();

  try {
    const identity = await auth.requireIdentity(request);
    const clientId = request.params.clientId;

    context.log(`Uninstall app ${clientId} requested by user: ${identity.userId}`);

    // TODO (A3/A4): Extract uninstall + OAuth revocation logic from anchor-log
    return {
      status: 501,
      jsonBody: { code: "NOT_IMPLEMENTED", message: "App uninstall not yet implemented — pending A3/A4 extraction" },
    };
  } catch (error) {
    return errors.handleError(error, context);
  }
}

app.http("uninstallApp", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "users/me/installed-apps/{clientId}",
  handler: createAuditedHandler("app.uninstall", uninstallApp),
});
