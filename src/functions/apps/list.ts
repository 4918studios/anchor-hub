/**
 * List Installed Apps Endpoint
 *
 * GET /api/users/me/installed-apps
 *
 * List all apps installed by the authenticated user.
 * Placeholder — implementation extracted from anchor-log in A3/A4.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getServices } from "../../lib/serviceFactory.js";
import { createAuditedHandler } from "../../lib/auditedHandler.js";

export async function listInstalledApps(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const { auth, errors } = getServices();

  try {
    const identity = await auth.requireIdentity(request);

    context.log(`List installed apps for user: ${identity.userId}`);

    // TODO (A3/A4): Extract list logic from anchor-log
    return {
      status: 501,
      jsonBody: { code: "NOT_IMPLEMENTED", message: "List installed apps not yet implemented — pending A3/A4 extraction" },
    };
  } catch (error) {
    return errors.handleError(error, context);
  }
}

app.http("listInstalledApps", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users/me/installed-apps",
  handler: createAuditedHandler("app.list", listInstalledApps),
});
